# Danh Sách Công Việc (Task Breakdown & Kanban Board)

> **CÁCH QUẢN LÝ TIẾN ĐỘ:** 
> - Đổi `[ ]` thành `[x]` khi hoàn thành.
> - Cập nhật trạng thái: `[TODO]`, `[IN PROGRESS]`, `[DONE]`.
> - Theo chuẩn Vertical Slicing, hoàn thành Phase nào là Phase đó chạy được End-to-End.

---

## 📌 PHASE 1: Triệt Tiêu Rủi Ro & Hạ Tầng (ĐÃ HOÀN THÀNH)
- [x] **Task 1-4:** Base Project, Docker, CI/CD, Spike WASM, Spike ONNX.
- [x] **Task 5:** Database Schema & Alembic.

---

## 📌 PHASE 2: Onboarding & Knowledge Graph (Vertical Slice 1)
*(Mục tiêu: Người học vào web có thể bắt đầu phiên Guest, load được DAG 18 nodes, làm bài test đầu vào và nhìn thấy Cây Kỹ Năng sáng lên).*

### [TODO] Task 6: Knowledge Graph Parser & Core DAG Engine
**Description:** Đọc và parse file `knowledge_graph.json` (chứa 18 nodes). Xây dựng cấu trúc dữ liệu đồ thị có hướng (DAG), tích hợp thuật toán phát hiện chu trình (Cycle Detection).
**Acceptance criteria:**
- [ ] Load thành công 18 concepts từ file JSON vào object Python qua Pydantic.
- [ ] Trả về lỗi ValueError nếu DAG có chứa chu trình (Cycle detected).
**Verification:**
- [ ] Tests pass: `pytest backend/tests/domain/test_knowledge_graph.py`
- [ ] Manual check: Thử chèn một chu trình vào JSON để xem system có crash an toàn không.
**Dependencies:** Task 5
**Estimated scope:** Small (2 files)

### [TODO] Task 7: Diagnostic Propagation Algorithm
**Description:** Implement thuật toán suy diễn năng lực (Propagation). Khi User trả lời đúng/sai 5 câu then chốt, hệ thống tự động suy diễn xác suất thông thạo ($K_0$) cho các nodes liên quan (con/cha) trên DAG.
**Acceptance criteria:**
- [ ] Nút cha được 0.85 (mastered) thì các nút con tiên quyết mặc định $\ge 0.85$.
- [ ] Tính toán đúng vector state $s_0$ (41 chiều) cho người học.
**Verification:**
- [ ] Tests pass: `pytest backend/tests/domain/test_diagnostic.py`
**Dependencies:** Task 6
**Estimated scope:** Medium (3 files)

### [TODO] Task 8: Onboarding API & Guest Auth
**Description:** Cung cấp endpoint REST lấy câu hỏi Placement Test (`GET /diagnostic/placement-test`) và endpoint Submit sinh ra Guest Session JWT (`POST /diagnostic/submit`).
**Acceptance criteria:**
- [ ] API trả về đúng 5-7 câu hỏi SpotCheck ngẫu nhiên ở các nút giao.
- [ ] Bắn JWT token chứa `guest_id` khi nộp bài thành công, khởi tạo DB `COGNITIVE_STATE`.
**Verification:**
- [ ] Tests pass: `pytest backend/tests/api/test_onboarding.py`
**Dependencies:** Task 7
**Estimated scope:** Medium (4 files)

### [TODO] Task 9: Onboarding UI & Visual Skill Tree
**Description:** Xây dựng màn hình React đầu tiên: Nút "Bắt đầu ngay" -> Modal Placement Test -> Chuyển hướng sang màn hình Workspace có Cây Kỹ Năng (`@xyflow/react`) hiển thị nút xanh/xám dựa trên kết quả.
**Acceptance criteria:**
- [ ] Đọc JWT lưu vào `localStorage`.
- [ ] Cây kỹ năng render đúng vị trí, node chưa mở khóa (màu xám) không bấm được.
**Verification:**
- [ ] Tests pass: `npm run test` (Vitest FE)
- [ ] Manual check: Click UI end-to-end từ trang chủ đến lúc vào được Workspace.
**Dependencies:** Task 8
**Estimated scope:** Large (5-6 files)

### 🚩 Checkpoint: Phase 2 (Onboarding E2E)
- [ ] Toàn bộ test Backend và Frontend pass.
- [ ] Trải nghiệm người dùng: Đóng vai học sinh, truy cập Web, làm test đầu vào, thấy cây kỹ năng hiển thị đúng trạng thái.

---

## 📌 Các Phase Tiếp Theo (Sẽ mở rộng chi tiết khi Phase 2 hoàn tất)

### PHASE 3: Core Workspace & SQL Engine (Vertical Slice 2)
- [ ] Task 10: SQLite WASM Worker & IndexedDB Sync (Frontend)
- [ ] Task 11: SQL Workspace UI & Monaco Editor (Frontend)
- [ ] Task 12: AST (`sqlglot`) & EXPLAIN Grader (Backend)
- [ ] Task 13: Submission API (Backend)

### PHASE 4: AI Recommender Engine (Vertical Slice 3)
- [ ] Task 14: Cognitive Simulator Gym Env
- [ ] Task 15: RL Training & ONNX Export
- [ ] Task 16: Recommendation API
- [ ] Task 17: XAI UI & Progressive Hints

### PHASE 5: Anti-Cheat & Telemetry (Vertical Slice 4)
- [ ] Task 18: Telemetry Collection
- [ ] Task 19: Spot-Check API & Modal Lock

### PHASE 6: Polish & Dashboard
- [ ] Task 20: Admin Dashboard (Heatmap, Drift)
- [ ] Task 21: Mock Interview Mode
- [ ] Task 22: Performance Load Test & Deploy
