# Capability Map: Adaptive Learning SQL (RL-Driven Personalization LMS)

> **Tài liệu điều phối kiến trúc:** Xác lập ranh giới module, quan hệ phụ thuộc và thứ tự triển khai độc lập theo quy chuẩn `/onion-agents:spec-driven-development`.  
> **Thời gian tạo:** 2026-09-07 | **Hạn nộp đồ án:** 20/12/2026 (~15 tuần) | **Tác giả:** Solo Developer (Kết hợp LLM Pipeline để sinh tự động ngân hàng câu hỏi/seed data số lượng lớn, đảm bảo tính khả thi).

---

## 1. Bản Đồ Năng Lực (Module Capability Map)

| Module ID | Trách nhiệm cốt lõi (Responsibility) | Phụ thuộc (Depends on) |
|---|---|---|
| `knowledge-graph` | Định nghĩa Ontology đồ thị tri thức SQL (~18-20 concepts, phân cấp Bloom, quan hệ DAG tiên quyết), JSON schema chuẩn hóa cho ngân hàng bài tập (metadata, DDL, seed bẫy NULL/dupes, AST rules, gợi ý 3 cấp độ), bộ câu hỏi chẩn đoán năng lực đầu vào (Diagnostic Placement Quiz), và công cụ xác thực DAG không chu trình (Cycle Detection). | — |
| `cognitive-simulator` | Môi trường mô phỏng người học chuẩn `Gymnasium` (`SQLStudentEnv`), tích hợp mô hình nhận thức BKT (Bayesian Knowledge Tracing) và đường cong quên lãng Ebbinghaus, 3 Personas người học ảo (Fast, Average, Struggling), và 3 thuật toán đối chuẩn (Fixed Linear, Leitner Spaced Repetition, Rule-Based). | `knowledge-graph` |
| `rl-engine` | Huấn luyện thuật toán RL (PPO/MaskablePPO trên `Stable-Baselines3`) với Action Masking tránh nhảy cóc kiến thức, kịch bản đối chuẩn thực nghiệm 100.000 episodes (t-test / p-value xuất số liệu báo cáo khoa học), và export policy suy luận tốc độ cao (< 50ms) cho Backend. | `cognitive-simulator` |
| `sql-engine` | Bộ thực thi và chấm điểm SQL đa lớp: SQLite In-Memory / WASM (`sql.js`) runner, bộ phân tích cú pháp AST ngữ nghĩa bằng `sqlglot` (bắt buộc dùng đúng mệnh đề, cấm hardcode), bộ so sánh kết quả diff table an toàn với NULL/thứ tự, và cơ chế chấm kế hoạch `EXPLAIN QUERY PLAN`. | `knowledge-graph` |
| `lms-backend` | FastAPI application, quản lý sinh viên và lịch sử học tập (PostgreSQL), Onboarding Placement Diagnostic Engine (thuật toán lan truyền tiên quyết DAG khởi tạo $s_0$), cập nhật vector nhận thức thực tế ($K_t, M_t, H_t, F_t$), bộ điều phối Two-Stage Recommendation (RL Macro Agent + Micro Exercise Selector), XAI Card Generator, Telemetry dán code 0ms + Spot-Check Trigger, và Socratic Hint Service. | `knowledge-graph`, `rl-engine`, `sql-engine` |
| `lms-frontend` | Next.js 14+ UI với Monaco Editor, Màn hình Onboarding Placement Test (5 phút), Web Worker chạy SQLite WASM client-side (Zero server latency), Cây kỹ năng trực quan (`@xyflow/react`) phản ánh trạng thái tri thức thời gian thực, XAI Card giải thích lý do gợi ý, Progressive Hint Drawer, Admin Dashboard (Frustration Heatmap & Model Drift), và Chế độ Mock Technical Interview. | `lms-backend`, `sql-engine` |

---

## 2. Thứ Tự Triển Khai (Build Order)

Chiến lược triển khai tuân thủ nguyên tắc **Vertical Slicing & Fail-fast**, ưu tiên xử lý các rủi ro kỹ thuật (High-Risk Spikes) lớn nhất ngay từ đầu, thay vì đi tuần tự từ dưới lên.

**Lộ trình thực thi (Dựa trên `tasks/plan.md`):**
1. **Phase 1 (Triệt Tiêu Rủi Ro):** Dựng Base Project & PoC 2 module khó nhất: `sql-engine` (WASM Worker) và `rl-engine` (ONNX Inference API).
2. **Phase 2 (Logic Lõi & Chấm Điểm):** Xây dựng `knowledge-graph` (DAG Pydantic) và phần lõi của `sql-engine` (AST Grader bằng sqlglot).
3. **Phase 3 (AI Simulator & Training):** Hoàn thiện `cognitive-simulator` (Gym Env, BKT) và `rl-engine` (Train PPO, Export ONNX).
4. **Phase 4 (LMS Backend API):** Xây dựng `lms-backend` (Auth, Two-Stage Recommender, Telemetry).
5. **Phase 5 (Next.js UI):** Xây dựng `lms-frontend` (Skill Tree, Monaco Editor ghép nối API).
6. **Phase 6 (Đóng gói):** Load test, đánh giá điểm số LCP, và hoàn thiện Báo cáo.

---

## 3. Ranh Giới Giao Tiếp Giữa Các Module (Interface Boundaries)

1. **`knowledge-graph` $\to$ `cognitive-simulator` / `sql-engine` / `lms-backend`:**
   - Dữ liệu schema chuẩn hóa `knowledge_graph.json` và thư mục bài tập `exercises/*.json`.
   - Python Pydantic Models dùng chung để parse và kiểm định tính toàn vẹn của Concept DAG và Exercise Metadata.
2. **`cognitive-simulator` $\to$ `rl-engine`:**
   - Tuân thủ chuẩn `gymnasium.Env` với Observation Space `Box(low=0.0, high=1.0, shape=(N_dim,))` và Action Space `MultiDiscrete([N_concepts, N_difficulties, N_modes])` hoặc Flattened Discrete kèm Action Mask.
3. **`rl-engine` $\to$ `lms-backend`:**
   - Stateless Inference Interface: `predict_next_action(student_state_vector: np.ndarray, available_mask: np.ndarray) -> MacroAction(concept_id, difficulty, mode)`.
   - Độ trễ suy luận $\le 50$ms không phụ thuộc GPU.
4. **`sql-engine` $\to$ `lms-backend` & `lms-frontend`:**
   - Grader Contract: `evaluate_submission(student_sql, expected_sql, schema_ddl, seed_data, ast_rules) -> EvaluationResult(is_correct, diff_table, syntax_errors, ast_violations, explain_plan_score)`.
5. **`lms-backend` $\to$ `lms-frontend`:**
   - REST API v1 JSON contracts (JWT Authentication, Student State & Skill Tree status, Next Recommended Exercise with XAI rationale, Submit Code & AST Result, Telemetry Event Ingestion, Socratic Hint Stream).
