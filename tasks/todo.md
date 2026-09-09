# Danh Sách Công Việc (Task Breakdown & Kanban Board)

> **CÁCH QUẢN LÝ TIẾN ĐỘ:** 
> - Đổi `[ ]` thành `[x]` khi hoàn thành một tiêu chí.
> - Cập nhật trạng thái ở tiêu đề Task: `[TODO]`, `[IN PROGRESS]`, `[DONE]`.
> - Kéo xuống tới Checkpoint nào, toàn bộ các Task ở trên phải là `[DONE]`.

---

## 📌 PHASE 1: Triệt Tiêu Rủi Ro & Hạ Tầng

### [DONE] Task 1: Khởi tạo Base Project, Git Workflow & CONSTRAINTS
**Description:** Setup repository trống với FastAPI, Next.js. Cài đặt toàn bộ linter, test runner. Thiết lập **Husky + lint-staged**.
**Acceptance criteria:**
- [x] Gõ `git commit` tự động trigger Husky chạy pre-commit checks.

### [DONE] Task 2: Thiết lập Docker Compose & CI/CD GitHub Actions
**Description:** Đóng gói ứng dụng thành Micro-Containerized (Caddy, NextJS, FastAPI, Postgres). Viết workflow CI 5 cổng.
**Acceptance criteria:**
- [x] `docker-compose up` khởi chạy thành công 4 services (Caddy, Frontend Next.js, Backend FastAPI, Postgres - Đã test thực tế 200 OK qua Caddy Reverse Proxy).
- [x] CI pipeline Pass màu xanh khi tạo PR trên GitHub (Đã vượt qua toàn bộ 5/5 cổng kiểm định trên GitHub Actions).

### [DONE] Task 3: Spike/PoC - Web Worker SQL
**Description:** Lập trình nháp luồng đưa `sql.js` (SQLite WASM) vào Web Worker.
**Acceptance criteria:**
- [x] Nhận truy vấn `SELECT 1` và trả về mảng kết quả qua `postMessage` dưới 50ms (Đã kiểm thử thực tế đạt ~1-5ms).

### [DONE] Task 4: Spike/PoC - FastAPI ONNX Inference
**Description:** API endpoint dùng `onnxruntime` load model random và chạy mồi.
**Acceptance criteria:**
- [x] Endpoint `/api/v1/poc/onnx` trả về mảng xác suất dưới 20ms (Kiểm thử thực tế đạt ~0.24ms - 0.47ms, nhanh gấp ~40-80 lần ngưỡng SLA).

### 🚩 Checkpoint: Phase 1
- [x] CI/CD và Docker hoạt động trơn tru. Web Worker & ONNX đạt chuẩn tốc độ.

---

## 📌 PHASE 2: Logic Lõi & Chấm Điểm Cơ Sở

### [DONE] Task 5: Dựng Database Schema & Alembic
**Description:** Viết ORM Models bao quát ĐẦY ĐỦ các bảng (bao gồm `TELEMETRY_LOG`, `SPOT_CHECK`, `DIAGNOSTIC_ASSESSMENT`).
**Acceptance criteria:**
- [x] Chạy `alembic upgrade head` tạo thành công DB (Đã áp dụng migration `9df090091b69` thành công trên PostgreSQL, 10 bảng quan hệ đầy đủ foreign key cascades và indexes, test coverage 97%).

### [TODO] Task 6: Module Knowledge Graph & Lan truyền DAG
**Description:** Parse `knowledge_graph.json`. Viết thuật toán khởi tạo vector $s_0$ dựa trên 5-7 câu trả lời đầu vào (Prerequisite Propagation).
**Acceptance criteria:**
- [ ] Thuật toán tính đúng vector K_0 từ các node được pass/fail.

### [TODO] Task 7: AST Grader & EXPLAIN QUERY PLAN
**Description:** Dùng `sqlglot` parse AST bắt lỗi logic/gian lận. Phân tích kết quả của `EXPLAIN QUERY PLAN` để đảm bảo có dùng Index.
**Acceptance criteria:**
- [ ] Chặn truy vấn hardcode kết quả. Bắt buộc dùng đúng `JOIN` hoặc `INDEX`.

### 🚩 Checkpoint: Phase 2
- [ ] Lõi DB và Grader hoàn thiện, không bị crash bởi câu truy vấn lạ.

---

## 📌 PHASE 3: AI Simulator & Training

### [TODO] Task 8: Lập trình Toán BKT & Ebbinghaus
**Description:** Implement công thức cập nhật $P(L_{t+1})$ và độ suy giảm trí nhớ $M(t)$.

### [TODO] Task 9: Build Môi Trường Gymnasium Env
**Description:** Đóng gói BKT vào `SQLStudentEnv` với Vector Observation 41 chiều.

### [TODO] Task 10: Train MaskablePPO & Export ONNX
**Description:** Train mô hình dùng `sb3-contrib` và export ra `.onnx`.

### 🚩 Checkpoint: Phase 3
- [ ] Có file `.onnx` policy hợp lệ sẵn sàng cho API.

---

## 📌 PHASE 4: LMS Backend API

### [TODO] Task 11: API Auth & Identity
**Description:** JWT, Guest Session, Convert Guest to Registered.

### [TODO] Task 12: API Khuyến nghị, Chấm điểm & XAI
**Description:** Cắm ONNX vào Controller. Cập nhật BKT, trả về bài tập và sinh thẻ giải thích XAI.

### [TODO] Task 13: API Onboarding Diagnostic
**Description:** API trả bộ câu hỏi Placement Test và câu hỏi xác thực 30s (Calibration Mini-check).

### [TODO] Task 14: Telemetry Background Tasks & Spot-Check Trigger
**Description:** Nhận Log gõ phím. Nếu phát hiện paste 0ms -> trigger câu hỏi Spot-Check. Cung cấp Socratic Hint API.

### 🚩 Checkpoint: Phase 4
- [ ] 100% API Backend hoạt động dưới 100ms.

---

## 📌 PHASE 5: Next.js Frontend

### [TODO] Task 15: Xây dựng Cây Kỹ Năng (React Flow)
**Description:** Vẽ DAG trực quan, đổi màu real-time theo mức độ Mastery.

### [TODO] Task 16: Không Gian Code (Monaco) & Progressive Hints
**Description:** Monaco Editor + WASM Worker. Hỗ trợ UI gợi ý 3 cấp độ (Socratic Hints).

### [TODO] Task 17: Màn hình Onboarding Placement Test
**Description:** UI chọn trình độ / làm bài test 5 phút đầu vào cực nhanh (Guest Mode).

### [TODO] Task 18: Telemetry Middleware & Modal Spot-Check
**Description:** Bắt sự kiện paste/tab switch. Hiển thị Popup Spot-check 30s khóa màn hình nếu bị Trigger. Hiển thị XAI Card.

### [TODO] Task 19: Admin Dashboard & Mock Interview
**Description:** Màn hình Frustration Heatmap & Model Drift. Chế độ Mock Technical Interview.

### 🚩 Checkpoint: Phase 5
- [ ] UI mượt mà, UX Zero-Friction đúng mô tả Spec.

---

## 📌 PHASE 6: Đóng Gói & Báo Cáo

### [TODO] Task 20: Tối ưu LCP, Load test & Deploy Production
**Description:** Chạy Lighthouse. Load test 500 CCU. Đẩy code tự động qua Github Actions CD lên VPS.

### [TODO] Task 21: Finalize Báo cáo
**Description:** Cập nhật HLD, LLD. Hoàn thành luận văn ĐATN.
