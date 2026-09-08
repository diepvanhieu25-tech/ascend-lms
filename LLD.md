# Low-Level Design (LLD): Hệ thống Ascend LMS - "Rise above limits"

> **Mục đích:** Tài liệu thiết kế chi tiết mức độ module, giải thuật toán học và cấu trúc mã nguồn. Phục vụ việc lập trình, viết kiểm thử (testing) và trình bày báo cáo kỹ thuật.
> **Dự án:** Hệ thống quản lý và khuyến nghị lộ trình học cá nhân hóa cho môn SQL/Database.

---

## 1. Phân Rã Module & Sự Phụ Thuộc (Module Boundaries)

Hệ thống được chia nhỏ thành 6 Sub-modules chuyên biệt. Sơ đồ phụ thuộc (Dependency Graph) định tuyến cách các thư viện liên kết:

```
[knowledge-graph] ──► [cognitive-simulator] ──► [rl-engine]
                                                      │
[sql-engine] ◄────────────────────────────────────────┘
     │
     └──► [lms-backend] ──► [lms-frontend]
```

---

## 2. Chi Tiết Thiết Kế Các Module Cốt Lõi

### 2.1. Knowledge Graph (Đồ thị tri thức)
- **Cấu trúc dữ liệu:** DAG (Directed Acyclic Graph) lưu dưới định dạng JSON, phân tích bằng thư viện `pydantic`.
- **Logic cốt lõi:** Quét toàn bộ 18 concepts (ví dụ: `sql_select`, `sql_where`, `sql_inner_join`). Đảm bảo đồ thị không có chu trình (Cycle Detection bằng thuật toán DFS/Topological Sort).
- **Ứng dụng:** Định nghĩa Masking Action cho hệ thống RL và giao diện Cây kỹ năng phía Frontend.

### 2.2. Cognitive Simulator (Môi trường giả lập nhận thức)
Môi trường `gymnasium.Env` (`SQLStudentEnv`) mô phỏng 3 tập người học (Fast, Average, Struggling) qua 2 phương trình toán học cốt lõi:
1. **Bayesian Knowledge Tracing (BKT):**
   - Tính toán xác suất thông hiểu $P(L_{t+1})$ sau mỗi lượt tương tác (Dựa trên Prior, Guess rate, Slip rate và Transit rate).
2. **Đường cong quên lãng Ebbinghaus:**
   - Trí nhớ suy giảm theo hàm số mũ: $M(t) = e^{-\Delta t / S}$.
   - Nếu $M(t) < 0.6$, hệ thống kích hoạt yêu cầu ôn tập ngắt quãng (Spaced Repetition).

### 2.3. Reinforcement Learning Engine (Động cơ AI Khuyến nghị)
- **Thuật toán:** `MaskablePPO` (từ `sb3-contrib`).
- **Không gian Trạng thái (Observation Space):** Vector 41 chiều (Mastery, Memory, Lịch sử tương tác).
- **Không gian Hành động (Action Space):** 162 discrete actions (18 concepts $\times$ 3 difficulties $\times$ 3 modes).
- **Action Masking:** Khóa cứng (Mask = 0) những hành động vi phạm điều kiện tiên quyết (chưa mở khóa DAG) hoặc các bài tập đã thành thạo, chống Deadlock (kết thúc Episode khi hoàn thành 100% DAG).
- **Deploy:** Model được export ra định dạng **ONNX** để chạy inference cực nhẹ ($< 15$ms) bên trong luồng FastAPI mà không cần cài PyTorch.

### 2.4. SQL Engine (Trình Chấm Điểm và Thực Thi)
Chia làm 2 tầng rõ rệt:
1. **Thực thi (Client-side Web Worker):**
   - Nạp file `sql-wasm.wasm` vào Web Worker (luồng phụ của trình duyệt).
   - Nhận yêu cầu chứa câu SQL + schema + seed data (có bẫy NULL) $\to$ Trả về bảng dữ liệu (Dataframe ảo) dạng Diff-table.
2. **Chấm ngữ nghĩa AST (Backend):**
   - Sử dụng thư viện `sqlglot` để bóc tách Abstract Syntax Tree.
   - Quét tìm và cấm các hành vi gian lận (Hardcoding, dùng sai mệnh đề: vd Dùng `WHERE` thay vì `HAVING`).
   - Đọc kết quả `EXPLAIN QUERY PLAN` để khẳng định học viên có sử dụng Index hiệu quả hay đang Scan toàn bảng.

### 2.5. LMS Backend (Dịch vụ Điều phối)
- **Framework:** FastAPI (Python 3.11+).
- **Database ORM:** SQLAlchemy (AsyncPG) + Alembic migrations.
- **Hệ thống API RESTful:**
  - `POST /api/v1/auth/*`: Quản lý Token (Đăng ký, Đăng nhập, Convert Guest).
  - `GET /api/v1/recommendation/next`: Kích hoạt ONNX inference trả về bài tập và giải thích XAI.
  - `GET /api/v1/exercises/{id}`: API Hydration khôi phục trạng thái Web Worker khi Refresh (F5).
  - `POST /api/v1/exercises/{id}/submit`: Tiếp nhận bài nộp, kích hoạt BackgroundTasks để lưu Telemetry (số lần dán code, số lần đổi tab) nhằm chặn gian lận AI.

### 2.6. LMS Frontend (Giao diện Người dùng)
- **Framework:** Next.js 14 (App Router) + Tailwind CSS + Shadcn/ui.
- **Biểu đồ Cây kỹ năng:** Sử dụng thư viện `@xyflow/react` vẽ đồ thị tự động chuyển màu (Xanh/Vàng/Đỏ) theo vector BKT trả về từ backend.
- **Code Editor:** Tích hợp **Monaco Editor** hỗ trợ nhắc lệnh SQL, tự động Auto-save draft code vào LocalStorage mỗi 2 giây.

---

## 3. Kiến Trúc Security & Anti-Cheat

Đồ án ứng dụng kỹ thuật phòng thủ nhiều lớp trước kỷ nguyên GenAI:
- **Ngăn chặn SQL Injection:** Việc thực thi truy vấn do WASM Sandbox client-side đảm nhận (in-memory). Kẻ tấn công có DROP TABLE cũng chỉ hỏng RAM máy của chính họ, F5 là khôi phục.
- **Ngăn chặn dán code từ ChatGPT:** Dịch vụ Telemetry đo lường khoảng thời gian dán (Paste event 0ms) và tần suất chuyển tab. Nếu phát hiện bất thường, Backend trả về cờ `trigger_spot_check: true`, Frontend lập tức khóa màn hình và bắt học viên hoàn thành trắc nghiệm giải thích code trong 30 giây.
