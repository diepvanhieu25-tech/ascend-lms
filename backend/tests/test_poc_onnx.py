from fastapi.testclient import TestClient

from app.main import app
from app.services.onnx_engine import CONCEPT_NAMES, DIFFICULTY_MAP, LEARNING_MODE_MAP, ONNXEngine

client = TestClient(app)


def test_poc_onnx_get_default() -> None:
    response = client.get("/api/v1/poc/onnx")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "ok"
    assert data["within_sla"] is True
    assert data["latency_ms"] < 20.0  # Acceptance criterion: < 20ms
    assert 0 <= data["predicted_action"] < 162

    # Verify action details decoding
    details = data["action_details"]
    assert details["action_id"] == data["predicted_action"]
    assert 0 <= details["concept_index"] < 18
    assert details["concept_name"] in CONCEPT_NAMES
    assert details["difficulty"] in DIFFICULTY_MAP
    assert details["learning_mode"] in LEARNING_MODE_MAP

    assert data["probabilities_count"] == 162
    assert len(data["probabilities_sample"]) == 5


def test_poc_onnx_post_custom_state() -> None:
    # 41-dim custom state vector
    custom_state = [0.8] * 18 + [0.5] * 18 + [1.0, 0.0, 30.0, 0.0, 0.1]
    response = client.post(
        "/api/v1/poc/onnx",
        json={"state_vector": custom_state},
    )
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "ok"
    assert data["latency_ms"] < 20.0
    assert 0 <= data["predicted_action"] < 162


def test_poc_onnx_post_action_masking() -> None:
    custom_state = [0.2] * 41

    # Create mask that FORBIDS all actions except action 42
    target_action = 42
    mask = [0] * 162
    mask[target_action] = 1

    response = client.post(
        "/api/v1/poc/onnx",
        json={
            "state_vector": custom_state,
            "action_mask": mask,
        },
    )
    assert response.status_code == 200
    data = response.json()

    # The predicted action MUST be 42 because all other actions were masked out
    assert data["predicted_action"] == target_action
    assert data["action_details"]["action_id"] == target_action


def test_poc_onnx_post_invalid_dimension() -> None:
    # State vector with only 5 elements (must be 41)
    response = client.post(
        "/api/v1/poc/onnx",
        json={"state_vector": [1.0, 2.0, 3.0, 4.0, 5.0]},
    )
    assert response.status_code == 422


def test_onnx_engine_direct_errors() -> None:
    engine = ONNXEngine()

    # Invalid state length
    try:
        engine.predict([1.0] * 10)
        assert False, "Should have raised ValueError"
    except ValueError as e:
        assert "Expected state vector of length 41" in str(e)

    # Invalid mask length
    try:
        engine.predict([0.1] * 41, action_mask=[1] * 50)
        assert False, "Should have raised ValueError"
    except ValueError as e:
        assert "Expected action mask of length 162" in str(e)
