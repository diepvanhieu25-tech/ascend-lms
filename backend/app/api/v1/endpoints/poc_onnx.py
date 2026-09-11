from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.onnx_engine import get_onnx_engine

router = APIRouter(prefix="/poc/onnx", tags=["PoC - ONNX Inference"])


class ActionDetails(BaseModel):
    action_id: int
    concept_index: int
    concept_name: str
    difficulty: str
    learning_mode: str


class ONNXInferenceRequest(BaseModel):
    state_vector: list[float] = Field(
        ...,
        description="41-dim vector representing learner cognitive state (18 BKT + 18 Ebbinghaus + 5 Telemetry)",
        min_length=41,
        max_length=41,
    )
    action_mask: list[int] | None = Field(
        default=None,
        description="Optional 162-dim binary mask (1: allowed, 0: forbidden)",
    )


class ONNXInferenceResponse(BaseModel):
    status: str
    predicted_action: int
    action_details: ActionDetails
    latency_ms: float
    threshold_ms: float = 20.0
    within_sla: bool
    probabilities_sample: list[float]
    probabilities_count: int


# Default baseline state vector for testing (Beginner learner)
DEFAULT_BASELINE_STATE: list[float] = [
    # 18 BKT mastery probabilities (0.1 initial prior for beginner)
    0.1,
    0.05,
    0.05,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    # 18 Ebbinghaus memory retention (0.0 fresh)
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    # 5 Telemetry features: recent attempts, consecutive fails, time spent, paste events, frustration index
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
]


@router.get("", response_model=ONNXInferenceResponse)
def test_onnx_inference_get() -> ONNXInferenceResponse:
    """
    Spike/PoC Benchmark: Runs ONNX policy inference on baseline learner state.
    Guarantees latency < 20ms on CPU without PyTorch dependency.
    """
    try:
        engine = get_onnx_engine()
        predicted_action, probabilities, latency_ms, action_details = engine.predict(
            DEFAULT_BASELINE_STATE
        )

        return ONNXInferenceResponse(
            status="ok",
            predicted_action=predicted_action,
            action_details=ActionDetails(**action_details),
            latency_ms=latency_ms,
            threshold_ms=20.0,
            within_sla=latency_ms < 20.0,
            probabilities_sample=probabilities[:5],
            probabilities_count=len(probabilities),
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("", response_model=ONNXInferenceResponse)
def test_onnx_inference_post(request: ONNXInferenceRequest) -> ONNXInferenceResponse:
    """
    Runs ONNX policy inference on custom learner state vector and action mask.
    """
    try:
        engine = get_onnx_engine()
        predicted_action, probabilities, latency_ms, action_details = engine.predict(
            request.state_vector,
            request.action_mask,
        )

        return ONNXInferenceResponse(
            status="ok",
            predicted_action=predicted_action,
            action_details=ActionDetails(**action_details),
            latency_ms=latency_ms,
            threshold_ms=20.0,
            within_sla=latency_ms < 20.0,
            probabilities_sample=probabilities[:5],
            probabilities_count=len(probabilities),
        )
    except ValueError as val_err:
        raise HTTPException(status_code=422, detail=str(val_err)) from val_err
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
