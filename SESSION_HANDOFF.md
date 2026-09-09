# Handoff Ngữ Cảnh Dự Án (Session Handoff & Quick Resume)

> **Mục đích:** File này lưu trữ toàn bộ trạng thái kiến trúc, tiến độ thực thi, quy chuẩn kỷ luật kỹ thuật, các bài học kinh nghiệm cần tránh và hướng dẫn cho phiên làm việc tiếp theo của dự án **Ascend LMS** (Adaptive Learning SQL ứng dụng Reinforcement Learning).  
> **Thời gian cập nhật:** 2026-09-09 (Cuối Phase 1 & Task 5 Phase 2) | **Hạn nộp đồ án:** 20/12/2026 (~15 tuần) | **Hình thức:** Solo Project

---

## 1. Tóm Tắt Dự Án & Quyết Định Đã Chốt

* **Tên đề tài:** Hệ thống quản lý và khuyến nghị lộ trình học cá nhân hóa (Adaptive Learning) cho môn SQL/Database ứng dụng mô hình Học tăng cường (Reinforcement Learning).
* **Mục tiêu:** Đồ án tốt nghiệp CNTT đạt chuẩn xuất sắc (vừa có sản phẩm Web hoàn chỉnh thực tế, vừa có nghiên cứu toán/AI vững chắc).
* **Đối tượng cốt lõi:** Người học cấp độ Intermediate (sinh viên luyện thi, người luyện phỏng vấn kỹ thuật Backend/Data) với điểm nghẽn nhận thức là *học vẹt, nhầm lẫn bản chất, mau quên và thiếu tư duy vận dụng thực tế*.
* **Định hướng kiến trúc then chốt:**
  1. **Two-Stage RL Architecture:** RL Macro Agent quyết định chiến lược vĩ mô `(Khái niệm + Độ khó + Mục đích sư phạm)`, tầng LMS phụ trách lấy bài tập cụ thể từ CSDL.
  2. **Simulated Learner Environment:** Xây dựng môi trường giả lập người học chuẩn nhận thức (`Gymnasium` + BKT - Bayesian Knowledge Tracing + Đường cong quên lãng Ebbinghaus) để huấn luyện offline và đối chuẩn (benchmark) với lộ trình Fixed Linear và Rule-based.
  3. **Đánh giá "Hiểu Bản Chất" Đa Lớp:** SQLite WebAssembly (`sql.js`) chạy trong trình duyệt + Phân tích cú pháp AST (`sqlglot`) + Chấm kế hoạch thực thi `EXPLAIN QUERY PLAN` (tối ưu hóa Index) + Bộ test case bẫy biên (`NULL`, duplicates).
  4. **Phòng thủ chống gian lận AI (Anti-Ghost Mastery):** AI Socratic Tutor nội bộ gợi mở từng bước + Telemetry nhận diện dán code (0ms paste) + Thử thách phản xạ ngắn (Spot-Check 30s) tránh ngộ nhận năng lực ảo.
  5. **Chế độ Phỏng vấn Mô phỏng (Mock Technical Interview):** Đóng gói truy vấn, tối ưu hóa và câu hỏi tình huống thành bài thi phỏng vấn thử chân thực.
  6. **Observability & Quản trị 2 tầng:** Giám sát kỹ thuật (độ trễ < 200ms, lỗi sandbox) và giám sát sư phạm (Frustration Heatmap, độ trôi mô hình AI, cảnh báo học viên copy AI).
  7. **Bộ Đánh Giá Năng Lực Đầu Vào (Adaptive Placement Diagnostic):** Giải quyết bài toán Cold-Start bằng bài test nhanh (5-7 câu tại các nút giao DAG) kết hợp lan truyền tiên quyết (Prerequisite Propagation) để khởi tạo chính xác $s_0$, đưa học viên vào đúng ZPD ngay từ bước đầu.
* **Tech Stack đã chốt:**
  - **Backend & AI:** Python 3.12 (FastAPI) monolith, `sqlalchemy` (AsyncIO + asyncpg), `alembic`, `onnxruntime`, `Gymnasium`, `Stable-Baselines3`, `sqlglot`.
  - **Frontend:** Next.js 15 (React 19 / TypeScript strict) + Monaco Editor + `sql.js` (SQLite WASM in Web Worker) + `@xyflow/react` + Tailwind CSS / Lucide React.
  - **Reverse Proxy & Container:** Caddy v2 (HTTPS reverse proxy), Docker Compose, PostgreSQL 16.
* **Danh sách Dứt khoát KHÔNG LÀM (Not Doing):**
  - Không chạy RDBMS container (Postgres/MySQL) trên server cho từng người học.
  - Không huấn luyện RL online từ đầu trên người thật (chỉ dùng offline pre-trained policy).
  - Không nạp dữ liệu môn học khác ngoài SQL trong phạm vi 15 tuần.
  - Không làm mạng xã hội / diễn đàn thảo luận / chat P2P.

---

## 2. ⚠️ BÀI HỌC KINH NGHIỆM & NGUYÊN TẮC BẮT BUỘC (RETROSPECTIVE & ANTI-PATTERNS)

Trong quá trình thực thi Phase 1 và đầu Phase 2, đã có các sai sót kỹ thuật và thói quen làm việc cần **tuyệt đối tránh** và **khắc cốt ghi tâm**:

### 🚫 Lỗi 1: Báo xong khi chưa chạy thực nghiệm (Premature Completion)
* **Sai sót đã xảy ra:** Viết xong code endpoint / spike là vội vàng đánh dấu hoàn thành task và đòi nhảy sang task mới mà chưa khởi động docker container, chưa gọi API thật, chưa mở UI trình duyệt kiểm thử.
* **Quy tắc sửa đổi:** 
  - Cấm tuyệt đối việc viết code xong là báo hoàn thành.
  - Phải tự chạy thử nghiệm thực tế: chạy container, kiểm tra healthcheck, curl API endpoint, đo lường SLA thời gian phản hồi, kiểm tra console log trình duyệt.
  - Chỉ khi có đầy đủ dữ liệu thực nghiệm chứng minh đạt 100% Acceptance Criteria mới được báo hoàn tất.

### 🚫 Lỗi 2: Hack Code / Bypass Test để làm xanh CI (Bệnh Giả Tạo Kiểm Thử)
* **Sai sót đã xảy ra:** Khi CI Gate 4 báo lỗi thiếu bảng trên database trắng, thay vì chạy đúng lệnh migration trong CI pipeline, lại chèn `Base.metadata.create_all` vào fixture của file test để tự tạo bảng bằng Python ORM.
* **Hậu quả nguy hiểm:** `Base.metadata.create_all` che giấu hoàn toàn các lỗi của file Alembic migration. Nếu file migration thiếu bảng, thiếu index hoặc sai câu lệnh SQL DDL, test vẫn xanh mượt nhưng khi deploy lên môi trường staging/production thì hệ thống sẽ crash ngay lập tức!
* **Quy tắc sửa đổi:**
  - Tuyệt đối không dùng bất kỳ hack code, monkey-patch, hay fixture tạo schema giả lập nào để qua mặt test.
  - Toàn bộ database schema trong CI, test và production phải được tạo lập **duy nhất bởi lệnh chính thống `alembic upgrade head`**.
  - Test phải phản ánh trung thực 100% điều kiện thực tế. Nếu test fail, phải truy tìm tận gốc nguyên nhân kiến trúc và sửa đúng nơi, đúng chỗ.

### 🚫 Lỗi 3: Không tuân thủ kỷ luật Git Workflow (Code/Commit trên `main`)
* **Sai sót đã xảy ra:** Làm việc và commit trực tiếp trên nhánh `main`.
* **Quy tắc sửa đổi:**
  - Không bao giờ được phép code hay commit trực tiếp trên `main`.
  - Mọi công việc phải tạo nhánh tính năng ngắn hạn: `feat/task-X-...` hoặc `fix/...`.
  - Chạy toàn bộ pre-commit checks, unit tests, linters trên nhánh feature trước.
  - Sau khi kiểm thử thành công, merge nhánh feature vào `main`, push lên origin và kiểm tra CI GitHub Actions.

### 🚫 Lỗi 4: Không tự chủ động kiểm tra và chẩn đoán lỗi (Trông chờ người dùng)
* **Quy tắc sửa đổi:**
  - AI Assistant phải tự mình kiểm tra, tự phân tích log, tái hiện bug và tự khắc phục triệt để.
  - Không coi người dùng là QA tester.
  - Chỉ thông báo tới người dùng sau khi đã tự verify xong, hoặc khi cần tham vấn quyết định chiến lược/sản phẩm lớn.

---

## 3. Trạng Thái Hiện Tại Của Hệ Thống (System Status Checkpoint)

* **Git Branch hiện tại:** `feat/task-5-db-schema` (đã merge đồng bộ với `main`).
* **Commit mới nhất:** `d275da5` (`refactor(tests): remove create_all fixture to strictly enforce Alembic migration validation`).
* **Trạng thái Working Tree:** Sạch sẽ (`working tree clean`), không có file rác hay uncommitted changes.
* **Trạng thái CI/CD GitHub Actions (Run ID: `34342493670`):** **Xanh 100% (5/5 Quality Gates)**:
  - Gate 1: Lint & Format (Ruff, ESLint, Prettier) -> ✅ Success
  - Gate 2: Typecheck (Mypy strict, TypeScript `tsc --noEmit`) -> ✅ Success
  - Gate 3: Security & Secrets (Gitleaks, pip-audit, npm audit) -> ✅ Success
  - Gate 4: Unit Tests & Coverage (14/14 tests pass, Coverage 97%, Alembic migration thật) -> ✅ Success
  - Gate 5: Docker Build Check (Build backend, frontend, caddy images) -> ✅ Success
* **Trạng thái Docker Containers Local:**
  - `adaptive_backend` (FastAPI, Python 3.12, port 8000) -> `healthy`
  - `adaptive_frontend` (Next.js 15, port 3000) -> `running`
  - `adaptive_caddy` (Caddy v2 reverse proxy, port 80/443) -> `running`
  - `adaptive_postgres` (PostgreSQL 16, port 5432) -> `healthy`

---

## 4. Tiến Độ Chi Tiết Theo Phân Kỳ Nhiệm Vụ (Kanban)

### 📌 Phase 1: Triệt Tiêu Rủi Ro Kiến Trúc (ĐÃ HOÀN TẤT 100%)
- **[x] Task 1:** Khởi tạo Base Project, cấu hình Husky + lint-staged, ruff, mypy strict, eslint, prettier, và hợp đồng chất lượng `CONSTRAINTS.md`.
- **[x] Task 2:** Docker Compose 4 containers (Caddy, Next.js, FastAPI, PostgreSQL) & thiết lập GitHub Actions CI 5 Quality Gates.
- **[x] Task 3:** Spike Web Worker SQLite WASM (`sql.js`), xử lý truy vấn client-side đạt ~1-5ms (vượt xa SLA 50ms).
- **[x] Task 4:** Spike FastAPI ONNX Inference với Action Masking, tốc độ suy luận đạt ~0.24ms - 0.47ms (vượt SLA 20ms gấp ~50 lần), tích hợp UI Interactive Playground trên Frontend.

### 📌 Phase 2: Logic Lõi & Chấm Điểm Cơ Sở (ĐANG TIẾN HÀNH)
- **[x] Task 5: Dựng Database Schema & Alembic (HOÀN THÀNH):**
  - Tạo 10 models SQLAlchemy async: `Student`, `Concept`, `Prerequisite`, `Exercise`, `Submission`, `CognitiveState`, `TelemetryLog`, `SpotCheck`, `SpotCheckAttempt`, `DiagnosticAssessment`.
  - Migration script Alembic đầu tiên: `9df090091b69_create_initial_schema.py`.
  - Thiết lập quan hệ khóa ngoại, cascading deletes, unique constraints và indexes.
  - Bộ 14 tests trong `backend/tests/test_db_schema.py` kiểm thử trực tiếp trên schema di trú thật, test coverage đạt 97%.
- **[ ] Task 6: Module Knowledge Graph & Lan truyền DAG (TIẾP THEO):**
  - Thiết kế file định nghĩa tri thức SQL chuẩn `backend/app/knowledge/knowledge_graph.json` gồm 18 khái niệm SQL từ cơ bản đến nâng cao.
  - Lập trình cấu trúc DAG (Directed Acyclic Graph) với NetworkX / Python class thuần.
  - Kiểm tra đồ thị không chu trình (Cycle Detection / Topological Sort).
  - Lập trình thuật toán **Prerequisite Propagation** để suy diễn khởi tạo vector năng lực $s_0 \in [0, 1]^{18}$ từ 5-7 câu trả lời của bài Placement Test (giải quyết triệt để Cold-Start).
  - Viết unit tests kiểm thử 100% các nhánh lan truyền tiên quyết (Pass nút cha -> suy diễn điểm nút con, Fail nút gốc -> hạ điểm toàn bộ nhánh phụ thuộc).
- **[ ] Task 7: AST Grader & EXPLAIN QUERY PLAN** (Tiếp sau Task 6).

---

## 5. Danh Mục Tài Liệu Cốt Lõi Dự Án

1. **Hợp đồng chất lượng bắt buộc:** `CONSTRAINTS.md`
2. **Kế hoạch & Nhiệm vụ:** `tasks/plan.md` | `tasks/todo.md`
3. **Đặc tả Module Knowledge Graph (dùng cho Task 6):** `.onion/SPEC-knowledge-graph.md`
4. **Đặc tả Toán & Mô hình Nhận thức:** `.onion/SPEC-cognitive-simulator.md`
5. **Hợp đồng API RESTful v1:** `.onion/API-CONTRACTS.md`
6. **Kiến trúc Tổng thể C4 & Phân tích Hệ thống:** `.onion/SYSTEM-ANALYSIS-ARCHITECTURE.md`
7. **Đề cương & Nhiệm vụ ĐATN:** `PHU LUC 02_De cuong DATN.md` | `PHU LUC 03_Nhiem vu do an.md`

---

## 6. Hướng Dẫn Bắt Đầu Phiên Tiếp Theo (Quick Resume Prompt)

Khi mở phiên làm việc tiếp theo, chỉ cần gửi yêu cầu:
```text
@[SESSION_HANDOFF.md] Đọc file handoff để nắm toàn bộ ngữ cảnh dự án, các bài học kinh nghiệm cần tránh, và triển khai Task 6: Module Knowledge Graph & Lan truyền DAG theo đúng quy trình Git branch.
```
