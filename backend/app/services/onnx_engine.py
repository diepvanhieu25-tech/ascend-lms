import time
from pathlib import Path
from typing import Any

import numpy as np
import onnxruntime as ort

DIFFICULTY_MAP = ["BEGINNER", "INTERMEDIATE", "ADVANCED"]
LEARNING_MODE_MAP = ["LEARN", "PRACTICE", "REVIEW"]

CONCEPT_NAMES = [
    "sql_select",
    "sql_where",
    "sql_order_by",
    "sql_distinct",
    "sql_limit",
    "sql_aggregate",
    "sql_group_by",
    "sql_having",
    "sql_inner_join",
    "sql_left_join",
    "sql_right_join",
    "sql_full_join",
    "sql_subquery",
    "sql_cte",
    "sql_union",
    "sql_insert_update_delete",
    "sql_ddl_create_table",
    "sql_index_optimization",
]


class ONNXEngine:
    def __init__(self, model_path: str | Path | None = None) -> None:
        if model_path is None:
            # Default to backend/app/models/rl_policy_ppo.onnx
            base_dir = Path(__file__).resolve().parent.parent
            model_path = base_dir / "models" / "rl_policy_ppo.onnx"

        self.model_path = Path(model_path)
        if not self.model_path.exists():
            raise FileNotFoundError(f"ONNX Model not found at: {self.model_path}")

        # Explicitly configure single-threaded execution to prevent thread-affinity warnings in containers
        opts = ort.SessionOptions()
        opts.intra_op_num_threads = 1
        opts.inter_op_num_threads = 1
        opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

        self.session = ort.InferenceSession(
            str(self.model_path),
            sess_options=opts,
            providers=["CPUExecutionProvider"],
        )
        self.input_name: str = self.session.get_inputs()[0].name
        self.output_name: str = self.session.get_outputs()[0].name

    def decode_action(self, action_idx: int) -> dict[str, Any]:
        """Decodes discrete action integer (0..161) into macro pedagogical strategy."""
        concept_idx = action_idx // 9
        remainder = action_idx % 9
        difficulty_idx = remainder // 3
        mode_idx = remainder % 3

        concept_name = (
            CONCEPT_NAMES[concept_idx]
            if concept_idx < len(CONCEPT_NAMES)
            else f"concept_{concept_idx}"
        )

        return {
            "action_id": action_idx,
            "concept_index": concept_idx,
            "concept_name": concept_name,
            "difficulty": DIFFICULTY_MAP[difficulty_idx],
            "learning_mode": LEARNING_MODE_MAP[mode_idx],
        }

    def predict(
        self,
        state_vector: list[float] | np.ndarray[Any, Any],
        action_mask: list[int] | np.ndarray[Any, Any] | None = None,
    ) -> tuple[int, list[float], float, dict[str, Any]]:
        """
        Runs stateless ONNX inference on learner state vector.

        :param state_vector: 41-dim vector representing learner cognitive state
        :param action_mask: 162-dim binary vector (1: valid action, 0: invalid/masked)
        :return: (predicted_action, probabilities, latency_ms, action_details)
        """
        start_time = time.perf_counter()

        # Convert and validate state vector
        state_arr = np.asarray(state_vector, dtype=np.float32)
        if state_arr.ndim == 1:
            state_arr = state_arr.reshape(1, -1)

        if state_arr.shape[1] != 41:
            raise ValueError(f"Expected state vector of length 41, got shape {state_arr.shape}")

        # Run ONNX inference
        raw_output = self.session.run(
            [self.output_name],
            {self.input_name: state_arr},
        )[0]
        logits = raw_output[0].astype(np.float64)

        # Apply Action Masking
        if action_mask is not None:
            mask_arr = np.asarray(action_mask, dtype=np.float64)
            if mask_arr.shape[0] != 162:
                raise ValueError(
                    f"Expected action mask of length 162, got length {mask_arr.shape[0]}"
                )
            logits = np.where(mask_arr > 0.5, logits, -1e9)

        # Numerically stable Softmax for probability distribution
        shifted_logits = logits - np.max(logits)
        exp_logits = np.exp(shifted_logits)
        probabilities = (exp_logits / np.sum(exp_logits)).tolist()

        predicted_action = int(np.argmax(logits))
        latency_ms = round((time.perf_counter() - start_time) * 1000, 3)
        action_details = self.decode_action(predicted_action)

        return predicted_action, probabilities, latency_ms, action_details


# Singleton engine instance for application reuse
_engine_instance: ONNXEngine | None = None


def get_onnx_engine() -> ONNXEngine:
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = ONNXEngine()
    return _engine_instance
