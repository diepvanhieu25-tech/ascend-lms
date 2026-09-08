# Idea Refinement One-Pager: Nền Tảng Adaptive Learning SQL Ứng Dụng Reinforcement Learning

> **Trạng thái:** Đã tinh chỉnh & Thống nhất (Refined via `/onion-agents:idea-refine`)  
> **Thời gian:** 2026-09-06 | **Thời hạn hoàn thành:** 20/12/2026 (~15 tuần)  
> **Hình thức:** Đồ án Tốt nghiệp CNTT độc lập (Solo)

---

## 1. Tuyên Ngôn Bài Toán (Problem Statement)

> **"Làm thế nào để xây dựng một nền tảng học SQL thích ứng không ma sát (Zero-Friction LMS), sử dụng mô hình Học tăng cường (Two-Stage RL) để khắc phục triệt để lỗ hổng 'học vẹt, nhầm lẫn bản chất và mau quên' cho người luyện phỏng vấn/đi làm — vừa chứng minh được tính ưu việt học thuật thông qua môi trường nhận thức giả lập (BKT + Ebbinghaus), vừa có cơ chế phòng thủ trước hiện tượng gian lận AI (Ghost Mastery) trong kỷ nguyên GenAI?"**

---

## 2. Đối Tượng Trọng Tâm & Điểm Nghẽn Cốt Lõi (Target & Core Pain Point)

* **Đối tượng người học cốt lõi (Nhóm 2):** Sinh viên ngành CNTT/Khoa học dữ liệu và người chuyển ngành đang luyện thi, luyện phỏng vấn kỹ thuật (Data Analyst, Backend Dev, Database Engineer).
* **Đặc điểm nhận thức:** Đã biết cú pháp cơ bản (`SELECT`, `WHERE`), nhưng chưa có tư duy tập hợp sâu, hay nhầm lẫn bản chất ở các bài toán thực tế phức tạp (`JOIN` nhiều bảng, `NULL`, `GROUP BY/HAVING`, `Subquery`, `Window Functions`), dễ bị trôi/quên kiến thức theo thời gian và mắc bẫy "ảo giác năng lực" khi học vẹt.
* **Đối tượng đánh giá (Hội đồng tốt nghiệp):** Cần một công trình hội đủ hai yếu tố: chiều sâu nghiên cứu toán học/AI (đối chuẩn thực nghiệm có ý nghĩa thống kê) và sản phẩm phần mềm hoàn chỉnh, chạy thực tế với độ trễ tối thiểu.

---

## 3. Định Hướng Giải Pháp Đã Chốt (Recommended Direction)

1. **Kiến trúc RL 2 tầng (Two-Stage RL Architecture):**
   - *Tầng vĩ mô (Macro RL Agent):* Đưa ra tuple sư phạm chiến lược $\langle \text{Khái niệm } c_k, \text{Độ khó } d_m, \text{Mục đích sư phạm } (\text{Học mới / Ôn tập / Chẩn đoán}) \rangle$.
   - *Tầng LMS (Micro Delivery):* Truy vấn bài tập tương ứng trong Database và cung cấp cho người học.
2. **Môi trường Giả lập Người học Nhận thức (Cognitive Simulator):**
   - Xây dựng theo chuẩn `Gymnasium` kết hợp **Bayesian Knowledge Tracing (BKT)** và **Đường cong quên lãng Ebbinghaus** để huấn luyện mô hình RL ngoại tuyến an toàn, đánh bại các baseline (Fixed Linear, Leitner, Rule-based) trước khi nạp vào web.
3. **Cơ chế Kiểm tra "Hiểu Bản Chất" Đa Lớp:**
   - **Sandbox chạy tức thì:** SQLite WebAssembly (`sql.js`) chạy ngay trong RAM trình duyệt (độ trễ < 20ms, an toàn 100%).
   - **Chấm cú pháp bản chất (AST Analysis):** Dùng thư viện `sqlglot` kiểm tra cấu trúc câu truy vấn thay vì chỉ nhìn kết quả bảng.
   - **Chấm tối ưu hóa thực chiến:** Chấm kế hoạch thực thi `EXPLAIN QUERY PLAN` (bắt buộc chuyển từ `SCAN TABLE` sang `SEARCH USING INDEX`).
   - **Bài tập chẩn đoán & Bẫy biên (Edge-case Traps):** Dữ liệu test luôn chứa giá trị `NULL`, dòng trùng lặp để loại bỏ hoàn toàn việc "đoán mò".
4. **Phòng thủ chống gian lận AI (Anti-Ghost Mastery):**
   - **AI Socratic Tutor nội bộ:** Cung cấp trợ lý gợi mở từng bước, triệt tiêu động lực mở ChatGPT bên ngoài.
   - **Telemetry hành vi:** Nhận diện sự kiện Copy đề $\to$ Chuyển tab $\to$ Dán code 0ms.
   - **Thử thách phản xạ chẩn đoán (Spot-Check 30s):** Kích hoạt câu hỏi ngắn giải thích logic câu lệnh khi phát hiện dấu hiệu bất thường.
5. **Chế độ Phỏng vấn Mô phỏng (Mock Technical Interview):**
   - Đóng gói toàn bộ các bài tập truy vấn, tối ưu và câu hỏi tình huống thành một buổi phỏng vấn thử thực tế với AI.
6. **Trung tâm Giám sát 2 Tầng (Admin / Lecturer Dashboard):**
   - Theo dõi độ trễ hệ thống, Bản đồ nhiệt nản lòng (Frustration Heatmap) và Độ trôi mô hình AI (Model Drift).

---

## 4. Tech Stack Tối Ưu Cho 15 Tuần Solo

* **Backend & AI Engine:** **Python (FastAPI)** — Đơn khối tinh gọn, tích hợp trực tiếp `Gymnasium`, `Stable-Baselines3` (PPO/DQN), và `sqlglot` (SQL AST Parser).
* **Frontend:** **Next.js (React / TypeScript) + Tailwind CSS + Shadcn/ui** — Tích hợp **Monaco Editor**, **`sql.js` (SQLite WASM)** và **`@xyflow/react`** (Cây kỹ năng).
* **CSDL Hệ Thống:** **PostgreSQL** lưu trữ người dùng, bài tập và telemetry.

---

## 5. Giả Định Sống Còn & Kế Hoạch Kiểm Chứng (Key Assumptions & Test Plans)

- [ ] **Giả định 1 (Học thuật - Must Be True):** Mô hình Two-Stage RL có thể hội tụ trên môi trường giả lập Gymnasium và vượt trội hơn các Baseline (Fixed Linear, Leitner) ít nhất $15-20\%$ về tốc độ đạt thành thạo và độ lưu giữ trí nhớ dài hạn.
  - *Kế hoạch kiểm chứng:* Chạy mô phỏng 100.000 episodes với 3 nhóm học sinh ảo (Fast, Average, Struggling), vẽ biểu đồ hội tụ reward và kiểm định giả thuyết thống kê t-test / p-value.
- [ ] **Giả định 2 (Kỹ thuật Sandbox - Must Be True):** SQLite WASM (`sql.js`) và bộ phân tích cú pháp AST (`sqlglot`) hoạt động ổn định trên trình duyệt với thời gian phản hồi $< 50$ms mà không gây tràn bộ nhớ.
  - *Kế hoạch kiểm chứng:* Dựng prototype Web Worker chạy 50 truy vấn phức tạp liên tục kèm `EXPLAIN QUERY PLAN` để đo benchmark độ trễ và tiêu thụ RAM.
- [ ] **Giả định 3 (Sư phạm - Anti-Ghost Mastery):** Bộ phát hiện telemetry dán code kết hợp với Spot-Check 30s có thể phân loại chính xác giữa người tự làm và người chép bài từ AI.
  - *Kế hoạch kiểm chứng:* Thử nghiệm trên một nhóm nhỏ sinh viên (5 bạn dùng ChatGPT ngoài vs 5 bạn tự giải) để đo độ chính xác (Precision/Recall) của cảnh báo.

---

## 6. Phân Kỳ Triển Khai 15 Tuần (MVP Phasing Roadmap)

```
Tuần 1 - 7: Lõi Sống Còn (Core MVP)
├── Xây dựng Gymnasium Simulator (BKT + Ebbinghaus)
├── Huấn luyện RL Model (PPO/DQN) & Chốt số liệu đối chuẩn Baselines
└── Web LMS cơ bản: FastAPI + Next.js + SQLite WASM + Monaco Editor + AST Parser

Tuần 8 - 11: Thực Chiến & Chống Gian Lận (Advanced Engineering)
├── Chấm tối ưu hóa bằng EXPLAIN QUERY PLAN (Index vs Scan)
├── Telemetry gõ phím/dán code + Câu hỏi phản xạ Spot-Check (Chống Ghost Mastery)
└── Dashboard Quản trị: Bản đồ nhiệt nản lòng (Frustration Heatmap) & Model Drift

Tuần 12 - 15: Đột Phá Phỏng Vấn & Thử Nghiệm (Mock Interview & Polish)
├── Tích hợp Chế độ Phỏng vấn Mô phỏng (Mock Technical Interview với Socratic AI)
├── Thử nghiệm người dùng thật (Pre-test vs Post-test)
└── Hoàn thiện tài liệu báo cáo tốt nghiệp và slide bảo vệ
```

---

## 7. Danh Sách Dứt Khoát KHÔNG Làm (Mandatory Not-Doing List)

1. ❌ **KHÔNG chạy container database nặng (PostgreSQL/MySQL) trên server cho từng người học:** Toàn bộ thực hành 100% bằng SQLite WASM client-side để đảm bảo an toàn tuyệt đối và zero độ trễ mạng.
2. ❌ **KHÔNG huấn luyện RL online từ đầu trên người dùng thật:** Tránh cold-start và gợi ý lung tung gây nản lòng học viên; chỉ dùng offline pre-trained policy.
3. ❌ **KHÔNG nạp dữ liệu môn học khác ngoài SQL:** Giữ nguyên thiết kế mở ở tầng interface, nhưng trong 15 tuần này chỉ tập trung hoàn thiện 100% cho SQL.
4. ❌ **KHÔNG làm tính năng mạng xã hội / diễn đàn / chat P2P:** Giữ tập trung tối đa cho vòng lặp tương tác giữa người học và AI.

---

## 8. Câu Hỏi Mở Cần Chuẩn Bị Tiếp Theo (Open Questions)

1. Cấu trúc template prompt chuẩn cho LLM để sinh bộ bài tập SQL chuẩn hóa (gồm schema, seed data có bẫy NULL/dupes, và AST rules) như thế nào?
2. Ngưỡng thời gian và sự kiện cụ thể nào (ví dụ: paste > 3 dòng trong < 100ms) sẽ kích hoạt Spot-Check chẩn đoán?
