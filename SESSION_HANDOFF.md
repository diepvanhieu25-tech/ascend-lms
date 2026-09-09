# Handoff Ngữ Cảnh Dự Án (Session Handoff & Quick Resume)

> **Mục đích:** File này lưu trữ toàn bộ trạng thái, quyết định thiết kế, phân kỳ tiến độ và ngữ cảnh của dự án độc lập Adaptive Learning SQL.  
> **Thời gian cập nhật:** 2026-09-07 | **Hạn nộp đồ án:** 20/12/2026 (~15 tuần) | **Hình thức:** Solo Project

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
* **Tech Stack đã chốt (Tối ưu cho Solo Dev 15 tuần):**
  - **Backend & AI:** Python (FastAPI) monolith tích hợp `Gymnasium`, `Stable-Baselines3`, và `sqlglot`.
  - **Frontend:** Next.js (React / TypeScript) + Monaco Editor + `sql.js` (SQLite WASM) + `@xyflow/react`.
  - **Database:** PostgreSQL.
* **Phân kỳ lộ trình 15 tuần (Vertical Slicing & Fail-fast):**
  - *Phase 1 (Tuần 1 - 2):* Triệt Tiêu Rủi Ro (High-Risk Spikes) - Setup base project, PoC Web Worker SQL, PoC FastAPI ONNX.
  - *Phase 2 (Tuần 3 - 5):* Logic Lõi & Chấm Điểm - Database Schema, DAG, AST Grader (`sqlglot`).
  - *Phase 3 (Tuần 6 - 9):* AI Simulator & Training - Toán BKT/Ebbinghaus, Gym Env, Train MaskablePPO & Export ONNX.
  - *Phase 4 (Tuần 10 - 11):* LMS Backend API - Auth, Recommender, Telemetry Background Tasks.
  - *Phase 5 (Tuần 12 - 14):* Next.js UI - Cây kỹ năng, Monaco Editor, XAI Card.
  - *Phase 6 (Tuần 15):* Benchmark & Báo cáo - Load test, LCP, Finalize report.
* **Danh sách Dứt khoát KHÔNG LÀM (Not Doing):**
  - Không chạy RDBMS container (Postgres/MySQL) trên server cho từng người học.
  - Không huấn luyện RL online từ đầu trên người thật (chỉ dùng offline pre-trained policy).
  - Không nạp dữ liệu môn học khác ngoài SQL trong phạm vi 15 tuần.
  - Không làm mạng xã hội / diễn đàn thảo luận / chat P2P.

---

## 2. Các Tài Liệu Đã Được Lưu Trữ

1. **Statement of Intent (Tuyên ngôn mục tiêu chính thức):**  
   - File: [`.onion/intent-adaptive-learning-sql.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/intent-adaptive-learning-sql.md)
2. **Phân tích Kỹ thuật & Mô hình Toán học Chi tiết:**  
   - File: [`.onion/system-analysis-adaptive-learning-sql.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/system-analysis-adaptive-learning-sql.md)
3. **Phân Tích Hệ Thống, C4, ERD, DevOps & Năng Lực Chịu Tải:**  
   - File: [`.onion/SYSTEM-ANALYSIS-ARCHITECTURE.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/SYSTEM-ANALYSIS-ARCHITECTURE.md)
4. **Bản Đồ Năng Lực Hệ Thống (Capability Map):**  
   - File: [`.onion/capability-map.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/capability-map.md)
5. **Hợp Đồng Giao Tiếp API RESTful v1 (API Contracts):**  
   - File: [`.onion/API-CONTRACTS.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/API-CONTRACTS.md)
6. **Bộ 8 Bản Đặc Tả Module Chi Tiết & DevOps (Full Specifications):**  
   - Module 1: [`.onion/SPEC-knowledge-graph.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/SPEC-knowledge-graph.md)
   - Module 2: [`.onion/SPEC-cognitive-simulator.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/SPEC-cognitive-simulator.md)
   - Module 3: [`.onion/SPEC-rl-engine.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/SPEC-rl-engine.md)
   - Module 4: [`.onion/SPEC-sql-engine.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/SPEC-sql-engine.md)
   - Module 5: [`.onion/SPEC-lms-backend.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/SPEC-lms-backend.md)
   - Module 6: [`.onion/SPEC-lms-frontend.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/SPEC-lms-frontend.md)
   - DevOps 1: [`.onion/SPEC-git-workflow.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/SPEC-git-workflow.md)
   - DevOps 2: [`.onion/SPEC-infrastructure-cicd.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/SPEC-infrastructure-cicd.md)
7. **Hồ Sơ Đề Cương & Nhiệm Vụ Tốt Nghiệp Chuẩn:**  
   - File: [`PHU LUC 02_De cuong DATN.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/PHU%20LUC%2002_De%20cuong%20DATN.md)
   - File: [`PHU LUC 03_Nhiem vu do an.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/PHU%20LUC%2003_Nhiem%20vu%20do%20an.md)
8. **Kế Hoạch Thực Thi (Implementation Plan):**
   - File Plan: [`tasks/plan.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/tasks/plan.md)
   - File Todo Kanban: [`tasks/todo.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/tasks/todo.md)

---

## 3. Trạng Thái Hiện Tại & Điểm Dừng (Current Checkpoint)

- **Trạng thái:** HOÀN TẤT KẾ HOẠCH (Planning Complete). Toàn bộ 8 module specifications, hợp đồng cam kết chất lượng `CONSTRAINTS.md` và kế hoạch thực thi 6 phase (`tasks/plan.md`, `tasks/todo.md`) đã sẵn sàng. Mã nguồn đã được kết nối với repository Github.
- **Các điểm đột phá đã tích hợp:**
  1. Bộ đánh giá năng lực đầu vào (Adaptive Placement Test & Calibration Mini-Check 30s) giải quyết bài toán Cold-Start và Dunning-Kruger.
  2. Kiến trúc Sandbox SQLite WASM client-side tải 500-1.000 CCU không nghẽn Server.
  3. Mô hình MaskablePPO với Action Masking trên DAG và pipeline đối chuẩn khoa học $p < 0.05$.
  4. Cơ chế chống gian lận AI Telemetry dán code 0ms kết hợp Spot-Check 30s.
  5. Thiết lập tự động hoá mạnh mẽ với Trunk-Based Development, Husky, và CI/CD 5 cổng kiểm định nghiêm ngặt.
- **Bước kế tiếp:** Bắt đầu Giai đoạn Thực thi (Execution Phase). Tiến hành làm Task 1 trong file `tasks/todo.md` (Khởi tạo Base Project, Git Workflow & Lắp đặt CONSTRAINTS).


