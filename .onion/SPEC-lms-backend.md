# Spec: Module `lms-backend`

> **Module ID:** `lms-backend`  
> **Trạng thái:** Đặc tả chi tiết (Approved Specification)  
> **Tài liệu cha:** [Capability Map](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/capability-map.md) | [API Contracts](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/API-CONTRACTS.md) | [System Architecture](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/SYSTEM-ANALYSIS-ARCHITECTURE.md)  
> **Phiên bản:** 1.0.0

---

## 1. Objective (Mục Tiêu & Trách Nhiệm Cốt Lõi)

Module `lms-backend` là **hạt nhân điều phối toàn bộ dịch vụ nghiệp vụ, dữ liệu và trí tuệ nhân tạo** của nền tảng Adaptive Learning SQL:

1. **Quản Lý Phiên & Người Học Không Ma Sát (Session & Identity Management):**
   - Khởi tạo phiên ẩn danh tức thì (Guest Session) với mã định danh duy nhất và JWT token để học viên vào học ngay mà không bị chặn bởi form đăng ký.
   - Hỗ trợ chuyển đổi tài khoản không mất dữ liệu (Zero-Loss Conversion) từ Guest sang Người dùng chính thức.
2. **Bộ Đánh Giá Đầu Vào Thích Ứng (Onboarding Placement & Calibration Service):**
   - Phân phối bài test chẩn đoán 5-7 câu then chốt trên DAG hoặc câu hỏi kiểm chứng phản xạ 30s (Calibration Mini-Check) khi học viên tự chọn profile.
   - Thực thi thuật toán Lan truyền Tiên quyết trên DAG (Prerequisite Propagation) để khởi tạo vector trạng thái nhận thức chuẩn xác $s_0 = [K_0, M_0, H_0, F_0]$.
3. **Bộ Điều Phối Khuyến Nghị 2 Tầng (Two-Stage Recommendation Coordinator):**
   - Tầng 1 (Macro): Nạp vector $s_t$ và gọi mô hình ONNX Runtime (`rl-engine`) để lấy tuple sư phạm $\langle c_k, d_m, \text{mode} \rangle$ trong $< 15$ms.
   - Tầng 2 (Micro): Truy vấn CSDL PostgreSQL lấy bài tập phù hợp nhất chưa làm (hoặc bài làm sai cần củng cố).
   - Tự động sinh Thẻ giải thích sư phạm (Explainable AI - XAI Card) minh bạch lý do đề xuất cho học viên.
4. **Điều Phối Chấm Bài & Cập Nhật Trạng Thái Nhận Thức:**
   - Tiếp nhận bài nộp, phối hợp với `sql-engine` để kiểm tra AST và kế hoạch thực thi.
   - Cập nhật xác suất thành thạo theo BKT ($P(L_{t+1})$) và độ bền trí nhớ theo Ebbinghaus ($S_i, M_i(t)$).
   - Quản lý chỉ số nản lòng $F_t$ (tăng khi làm sai $\ge 3$ lần liên tiếp, tự động hạ độ khó hoặc gợi ý bài ôn tập).
5. **Đường Ống An Ninh Nhận Thức (Anti-Ghost Mastery Telemetry Pipeline):**
   - Thu thập telemetry gõ phím, thời gian dừng, số lần chuyển tab và sự kiện dán code.
   - Tự động kích hoạt câu hỏi Spot-Check 30s khi phát hiện bất thường (Dán $\ge 50$ ký tự với tốc độ $< 5$ms/ký tự + có chuyển tab).
6. **Hệ Thống Quan Sát Sư Phạm & Kỹ Thuật (Observability Services):**
   - Cung cấp API giám sát Bản đồ nhiệt nản lòng (Frustration Heatmap) và Đo lường độ trôi mô hình (Model Drift).

---

## 2. Commands (Lệnh Thực Thi Chuẩn)

```bash
# Kích hoạt môi trường backend
cd backend && source .venv/bin/activate

# Chạy migrations cơ sở dữ liệu PostgreSQL qua Alembic
alembic upgrade head

# Khởi chạy server FastAPI ở môi trường phát triển (Dev)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Chạy toàn bộ integration tests và API contract tests
pytest tests/ -v --durations=10

# Kiểm tra kiểu tĩnh (Strict Type Checking)
mypy app/ --strict

# Linter và format code
ruff check app/ tests/
ruff format app/ tests/ --check
```

---

## 3. Project Structure (Cấu Trúc Thư Mục Module)

```text
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── auth.py              # Guest session & JWT authentication
│   │       ├── diagnostic.py        # Placement test, Calibration mini-check, K_0 init
│   │       ├── student.py           # Skill tree state, Cognitive vector retrieval
│   │       ├── recommendation.py    # Two-stage recommender & XAI card generation
│   │       ├── exercises.py         # Code submission, AST check, Telemetry ingestion
│   │       ├── hints.py             # 3-level progressive hint unlocking
│   │       └── admin.py             # Frustration heatmap & Model drift analytics
│   ├── core/
│   │   ├── config.py            # Pydantic Settings (ENV variables, DB URLs, Secrets)
│   │   ├── security.py          # JWT creation/decoding, Argon2id password hashing
│   │   └── exceptions.py        # Custom API exceptions & Global error handlers
│   ├── db/
│   │   ├── session.py           # Async SQLAlchemy engine & sessionmaker (asyncpg)
│   │   └── base.py              # Declarative Base & Model imports
│   ├── domain/
│   │   ├── kg/                  # Pydantic models & loader for knowledge_graph.json
│   │   ├── simulator/           # BKT & Ebbinghaus math updates
│   │   └── grader/              # AST analyzer & Explain plan grader (sql-engine)
│   ├── models/                  # SQLAlchemy ORM Models (Student, Submission, etc.)
│   ├── schemas/                 # Pydantic v2 Request/Response Schemas
│   ├── services/
│   │   ├── diagnostic_service.py # Prerequisite propagation & Calibration logic
│   │   ├── recommender_service.py# Two-stage RL orchestration & exercise picking
│   │   ├── cognitive_service.py # State vector updater (BKT + Ebbinghaus + Frustration)
│   │   └── telemetry_service.py # Anti-ghost paste detection & Spot-check trigger
│   └── main.py                  # FastAPI app factory, CORS, Middleware & Routers
├── migrations/                  # Alembic migration scripts
└── tests/
    ├── test_api_diagnostic.py
    ├── test_api_recommendation.py
    └── test_api_submission_telemetry.py
```

---

## 4. Code Triển Khai Minh Họa: Two-Stage Recommender & Telemetry

### 4.1. Bộ Điều Phối Khuyến Nghị 2 Tầng (`recommender_service.py`)

```python
from typing import Tuple, Optional
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.student import Student, CognitiveState
from app.models.exercise import Exercise
from app.ai.rl.inference import RLEngine
from app.schemas.recommendation import XAICard

class TwoStageRecommenderService:
    def __init__(self, rl_engine: RLEngine):
        self.rl_engine = rl_engine

    async def get_next_exercise(self, db: AsyncSession, student_id: str) -> Tuple[Exercise, XAICard]:
        # 1. Trích xuất vector trạng thái nhận thức hiện tại s_t (41 chiều)
        state_vector, action_mask = await self._build_student_state_vector(db, student_id)
        
        # 2. Tầng 1: RL Macro Agent dự đoán hành động tối ưu (< 15ms)
        action_idx = self.rl_engine.predict_action(state_vector, action_mask)
        concept_id, difficulty, mode = self._decode_macro_action(action_idx)
        
        # 3. Tầng 2: LMS Micro Content Delivery - Lấy bài tập phù hợp nhất từ CSDL
        query = select(Exercise).where(
            and_(
                Exercise.concept_id == concept_id,
                Exercise.difficulty == difficulty,
                Exercise.mode == mode
            )
        )
        result = await db.execute(query)
        exercise = result.scalars().first()
        
        # Fallback an toàn nếu chưa có bài tập đúng tuple đó
        if not exercise:
            fallback_query = select(Exercise).where(Exercise.concept_id == concept_id)
            exercise = (await db.execute(fallback_query)).scalars().first()

        # 4. Sinh thẻ giải thích sư phạm (XAI Card)
        xai_card = self._generate_xai_rationale(concept_id, mode, state_vector)
        
        return exercise, xai_card

    def _generate_xai_rationale(self, concept_id: str, exercise: Exercise, state_vector: np.ndarray) -> XAICard:
        if exercise.mode.value == "PRACTICE_REVIEW":
            return XAICard(
                pedagogical_mode="PRACTICE_REVIEW",
                headline="Ôn tập củng cố trí nhớ ngắt quãng",
                rationale_message=f"Chỉ số ghi nhớ của bạn về {concept_id} đang có xu hướng giảm. Bài tập này giúp kích hoạt lại trí nhớ dài hạn trước khi quên.",
                target_metrics={"mode": exercise.mode.value}
            )
        return XAICard(
            pedagogical_mode="LEARN_NEW",
            headline="Mở rộng kỹ năng mới theo Vùng phát triển gần",
            rationale_message=f"Bạn đã thành thạo các kiến thức tiên quyết! Đây là thời điểm lý tưởng nhất để chinh phục {concept_id}.",
            target_metrics={"mode": exercise.mode.value}
        )
```

### 4.2. Bộ Phân Tích Telemetry Phát Hiện Dán Code 0ms (`telemetry_service.py`)

```python
class TelemetrySecurityService:
    @staticmethod
    def evaluate_suspicious_paste(
        submitted_sql: str,
        keystroke_count: int,
        time_spent_seconds: int,
        paste_events_count: int,
        tab_switches: int
    ) -> bool:
        """
        Xác định dấu hiệu chép code từ ChatGPT/GenAI bên ngoài:
        - Dán khối code dài (> 50 ký tự)
        - Số lượng gõ phím quá ít so với độ dài code (keystroke_count < len(sql) * 0.2)
        - Có sự kiện chuyển tab (tab_switches >= 1) và thời gian làm quá ngắn (< 15s)
        """
        sql_len = len(submitted_sql.strip())
        if sql_len < 30:
            return False  # Câu quá ngắn không cần bẫy

        is_instant_paste = (paste_events_count >= 1 and keystroke_count < sql_len * 0.3)
        has_tab_switch = tab_switches >= 1
        is_too_fast = time_spent_seconds < 10

        if is_instant_paste and (has_tab_switch or is_too_fast):
            return True  # Kích hoạt Spot-Check 30s ngay lập tức!
            
        return False
```

---

## 5. Testing Strategy (Chiến Lược Kiểm Thử)

1. **Kiểm Thử Hợp Đồng API RESTful (API Contract Tests):**
   - Kiểm tra toàn bộ các Endpoint quy định trong `API-CONTRACTS.md` đảm bảo cấu trúc trả về đúng chuẩn JSON Envelope (`success`, `data`, `error`).
2. **Kiểm Thử Luồng Guest sang Registered (Zero-Loss Conversion):**
   - Tạo guest session $\to$ Làm 3 bài tập $\to$ Bấm đăng ký $\to$ Khẳng định `student_id` và các bản ghi trong `cognitive_states` được chuyển đổi nguyên vẹn.
3. **Kiểm Thử Ngưỡng Kích Hoạt Spot-Check (Anti-Cheat Tests):**
   - Giả lập telemetry gõ phím bình thường (120 ký tự trong 45s) $\to$ `trigger_spot_check == False`.
   - Giả lập telemetry copy-paste (Dán 150 ký tự trong 2s kèm 1 lần chuyển tab) $\to$ `trigger_spot_check == True` kèm dữ liệu câu hỏi Spot-Check 30s.

---

## 6. Boundaries (Ranh Giới Phát Triển)

- **Always:**
  - Mọi endpoint yêu cầu xác thực phải trích xuất thông tin người dùng qua Dependency Injection (`get_current_student`).
  - Mọi thao tác ghi CSDL phải sử dụng `AsyncSession` với giao dịch (transaction) an toàn.
  - Xử lý việc ghi nhật ký Telemetry (Telemetry Log) vào CSDL thông qua `BackgroundTasks` của FastAPI (Fire-and-forget) để đảm bảo thời gian phản hồi của API nộp bài `< 100`ms.
  - Tách biệt hoàn toàn tầng Domain Logic (BKT, Ebbinghaus, AST) khỏi tầng HTTP Controller (FastAPI routes).
- **Ask first:**
  - Bổ sung trường mới vào các bảng CSDL chính (phải tạo Alembic migration đi kèm).
  - Thay đổi logic tính điểm phạt nản lòng $F_t$.
- **Never:**
  - Sử dụng các thư viện đồng bộ (blocking I/O) như `requests` hay `time.sleep` trong luồng xử lý `async def` của FastAPI.
  - Bỏ qua bước kiểm tra quyền sở hữu bài làm của học viên khi nộp bài.

---

## 7. Success Criteria (Tiêu Chí Nghiệm Thu)

1. Bộ API Backend khởi động và vượt qua kiểm tra sức khỏe `GET /api/v1/health` trong $< 2$ giây.
2. Endpoint khuyến nghị `GET /api/v1/recommendation/next` đạt độ trễ phản hồi trung bình $< 45$ms trên môi trường kiểm thử.
3. 100% các endpoint được kiểm thử tự động với độ bao phủ kiểm thử (Test Coverage) $\ge 80\%$.
