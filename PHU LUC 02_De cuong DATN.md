# TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT - ĐẠI HỌC ĐÀ NẴNG
## KHOA CÔNG NGHỆ SỐ
***

**CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM**  
**Độc lập - Tự do - Hạnh phúc**  

---

# ĐỀ CƯƠNG ĐỒ ÁN TỐT NGHIỆP

1. **Họ và tên sinh viên:** Diệp Văn Hiệu  
2. **Mã sinh viên:** 22115053122316 &emsp;&emsp; **Lớp:** 22T3  
3. **Họ và tên người hướng dẫn:** TS. Nguyễn Tấn Thuận  
4. **Đề tài:**  
   * **Tên đề tài:** Hệ thống quản lý và khuyến nghị lộ trình học cá nhân hóa (Adaptive Learning) ứng dụng mô hình học tăng cường (Reinforcement Learning).  
   * **Thời gian thực hiện:** Từ ngày 31/08/2026 đến ngày 20/12/2026 (~15 tuần).  

---

### 5. Mục tiêu của đề tài

* **Mục tiêu tổng quát:**  
  Nghiên cứu, thiết kế và xây dựng một nền tảng học tập thích ứng (Adaptive Learning Platform) hoàn chỉnh cho môn Cơ sở dữ liệu và truy vấn SQL; ứng dụng mô hình Học tăng cường 2 tầng (Two-Stage Reinforcement Learning) kết hợp mô hình hóa nhận thức người học (Bayesian Knowledge Tracing & Đường cong quên lãng Ebbinghaus) nhằm tự động phát hiện lỗ hổng tri thức, chống hiện tượng học vẹt/mau quên và tối ưu hóa tốc độ thành thạo kỹ năng của người học.

* **Mục tiêu cụ thể:**  
  1. *Nghiên cứu lý thuyết học thuật:* Mô hình hóa bài toán khuyến nghị lộ trình học tập thích ứng dưới dạng Quá trình Quyết định Markov (MDP); kết hợp mô hình nhận thức BKT và lý thuyết suy giảm trí nhớ ngắt quãng Ebbinghaus.
  2. *Môi trường mô phỏng & Đánh giá giải thuật:* Xây dựng môi trường giả lập người học ảo (`SQLStudentEnv`) chuẩn Gymnasium; huấn luyện mô hình RL (MaskablePPO) và chứng minh sự vượt trội có ý nghĩa thống kê ($p < 0.05$) so với các phương pháp cơ sở (Fixed Linear, Leitner Spaced Repetition, Rule-based).
  3. *Bộ đánh giá năng lực đầu vào (Adaptive Placement Diagnostic):* Giải quyết triệt để bài toán Khởi đầu Lạnh (Cold-Start Problem) bằng cơ chế kiểm tra chẩn đoán thích ứng nhanh (5-7 câu tại các nút giao DAG) hoặc tự chọn profile có câu hỏi xác thực phản xạ (Calibration Mini-Check 30s) kết hợp thuật toán lan truyền tiên quyết (Prerequisite Propagation) để khởi tạo chính xác vector trạng thái $s_0$, đưa người học vào đúng Vùng phát triển gần (ZPD) ngay từ bước đầu tiên.
  4. *Phân tích & Thiết kế hệ thống toàn diện:* Xây dựng mô hình ca sử dụng (Use Cases), mô hình kiến trúc C4 (Context, Container, Component), biểu đồ tuần tự (Sequence Diagrams), mô hình dữ liệu (ERD) và hệ thống hợp đồng API RESTful chuẩn mực.
  5. *Phát triển sản phẩm phần mềm thực tế:* Xây dựng hệ thống Web LMS hoàn chỉnh với trải nghiệm người dùng không ma sát (Zero-Friction UX): Trình soạn thảo Monaco Editor, Sandbox thực thi SQLite WebAssembly (WASM) an toàn trong RAM trình duyệt (độ trễ < 20ms), Bộ chấm điểm bản chất bằng phân tích cú pháp AST (`sqlglot`) kết hợp chấm kế hoạch `EXPLAIN QUERY PLAN`, Cây kỹ năng mạng lưới trực quan (`@xyflow/react`), Thẻ giải thích lý do sư phạm (XAI), và Chế độ Phỏng vấn Kỹ thuật thử nghiệm (Mock Technical Interview).
  6. *Cơ chế phòng thủ gian lận AI (Anti-Ghost Mastery):* Tích hợp trợ lý Socratic AI Tutor nội bộ dẫn dắt gợi mở, bộ phân tích Telemetry nhận diện dán code 0ms và câu hỏi phản xạ nhanh Spot-Check 30s để đảm bảo người học thực sự hiểu bản chất.
  7. *Thiết kế & Triển khai hạ tầng (DevOps & Infrastructure):* Đóng gói Docker đa tầng cho toàn bộ hệ thống (FastAPI, Next.js, PostgreSQL), thiết lập CI/CD pipeline tự động hóa kiểm thử, triển khai môi trường Production với Reverse Proxy Caddy/Nginx (SSL/TLS), và tích hợp Dashboard giám sát 2 tầng (Kỹ thuật: RED metrics & Sư phạm: Frustration Heatmap, Model Drift).

---

### 6. Nội dung chính của đề cương

Nội dung đồ án được tổ chức thành 4 chương chính:

* **MỞ ĐẦU:**  
  - Tính cấp thiết của đề tài và thực trạng đào tạo SQL/Database hiện nay.  
  - Mục tiêu, đối tượng và phạm vi nghiên cứu của đồ án.  
  - Phương pháp nghiên cứu và cấu trúc luận văn.  

* **CHƯƠNG 1: CƠ SỞ LÝ THUYẾT VÀ TỔNG QUAN CÔNG NGHỆ**  
  - Tổng quan về Hệ thống giáo dục thông minh (Intelligent Tutoring Systems - ITS) và Học tập thích ứng (Adaptive Learning).  
  - Các mô hình biểu diễn tri thức người học: Đồ thị tri thức (Knowledge Graph DAG) và Bayesian Knowledge Tracing (BKT).  
  - Cơ chế suy giảm trí nhớ Ebbinghaus và kỹ thuật lặp lại ngắt quãng (Spaced Repetition).  
  - Lý thuyết Học tăng cường (Reinforcement Learning), Quá trình Quyết định Markov (MDP) và thuật toán Proximal Policy Optimization (PPO / MaskablePPO).  
  - Phân tích cú pháp trừu tượng (Abstract Syntax Tree - AST) trong kiểm thử truy vấn SQL và công nghệ WebAssembly (WASM).  

* **CHƯƠNG 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG**  
  - Phân tích yêu cầu chức năng (Use Case Analysis) cho 3 tác nhân: Người học, Giảng viên/Quản trị viên, và Mô hình RL Agent.  
  - Phân tích yêu cầu phi chức năng (Chỉ số hiệu năng < 50ms, tính sẵn sàng, độ tin cậy và an toàn sandbox).  
  - Thiết kế kiến trúc hệ thống tổng thể theo mô hình C4 (Context, Container, Component, Code).  
  - Thiết kế Đồ thị tri thức SQL (Ontology 18 concepts cốt lõi) và ngân hàng bài tập kèm bẫy biên (NULL, duplicate).  
  - Thiết kế Bộ đánh giá năng lực đầu vào (Diagnostic Placement Test) và thuật toán lan truyền tiên quyết trên DAG để giải quyết bài toán Cold-Start.  
  - Thiết kế mô hình toán học RL: Không gian trạng thái $s_t \in \mathbb{R}^{41}$, không gian hành động 162 discrete actions kèm Action Masking, và hàm phần thưởng đa mục tiêu cân bằng (Mastery, Retention, ZPD, Frustration Penalty).  
  - Thiết kế mô hình dữ liệu thực thể - liên kết (ERD) và lược đồ cơ sở dữ liệu quan hệ PostgreSQL.  
  - Thiết kế luồng nghiệp vụ chi tiết (Sequence Diagrams cho luồng đánh giá đầu vào, luồng học thích ứng, luồng nộp bài & chấm AST/WASM, luồng Telemetry).  
  - Thiết kế kiến trúc giao tiếp API RESTful v1 và giao diện người dùng (UI/UX Zero-Friction).  

* **CHƯƠNG 3: XÂY DỰNG CHƯƠNG TRÌNH VÀ TRIỂN KHAI HẠ TẦNG**  
  - Xây dựng Môi trường mô phỏng nhận thức `SQLStudentEnv` theo chuẩn `gymnasium.Env`.  
  - Huấn luyện mô hình RL Macro Agent (MaskablePPO) và xuất bản chính sách suy luận tối ưu (ONNX/stateless inference engine).  
  - Xây dựng Module Đánh giá năng lực đầu vào và Bộ khởi tạo trạng thái nhận thức $s_0$.  
  - Xây dựng Bộ chấm điểm SQL đa lớp: Client-side SQLite WASM runner, Bộ phân tích AST ngữ nghĩa (`sqlglot`), và Chấm tối ưu hóa `EXPLAIN QUERY PLAN`.  
  - Phát triển dịch vụ Backend (FastAPI, SQLAlchemy, PostgreSQL, Telemetry Ingestion, Socratic AI Tutor).  
  - Phát triển ứng dụng Web Frontend (Next.js 14, Monaco Editor, `@xyflow/react` Visual Skill Tree, XAI Cards, Mock Technical Interview).  
  - Thiết kế và triển khai Hạ tầng (Docker, Docker Compose, Nginx Reverse Proxy, SSL, CI/CD Pipeline GitHub Actions).  
  - Tích hợp Trung tâm quan sát 2 tầng: Dashboard Kỹ thuật và Giám sát Sư phạm (Frustration Heatmap & Model Drift).  

* **CHƯƠNG 4: THỰC NGHIỆM VÀ ĐÁNH GIÁ KẾT QUẢ**  
  - Thiết lập kịch bản thực nghiệm đối chuẩn ngoại tuyến trên 100.000 episodes với 3 nhóm học viên ảo (Fast, Average, Struggling).  
  - Phân tích thống kê đối chuẩn mô hình RL với 3 Baselines (Fixed Linear, Leitner, Rule-based) thông qua kiểm định giả thuyết $t$-test ($p < 0.05$).  
  - Đánh giá hiệu năng kỹ thuật hệ thống (độ trễ inference, thời gian chạy truy vấn client-side, mức tiêu thụ tài nguyên).  
  - Thử nghiệm người dùng thực tế đánh giá độ hài lòng UX và hiệu quả sư phạm thông qua đối chuẩn Pre-test vs Post-test (Normalized Gain $g$).  

* **KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN:**  
  - Tóm tắt các kết quả học thuật và kỹ thuật đã đạt được của đề tài.  
  - Phân tích các hạn chế và đề xuất hướng nghiên cứu tiếp theo (mở rộng đa môn học, học tăng cường trực tuyến an toàn).  

---

### 7. Kết quả dự kiến đạt được (Sản phẩm dự kiến)

1. **Báo cáo tốt nghiệp & Slide bảo vệ:** Đạt chuẩn quy định của Nhà trường, có chiều sâu toán học/AI và giá trị ứng dụng thực tiễn cao.  
2. **Môi trường mô phỏng học thuật:** Mã nguồn module `SQLStudentEnv` chuẩn Gymnasium tích hợp BKT và Ebbinghaus có thể tái lập thí nghiệm 100%.  
3. **Báo cáo đối chuẩn mô hình AI:** Bộ số liệu thực nghiệm, biểu đồ hội tụ reward, bảng so sánh thống kê $t$-test chứng minh tính ưu việt của RL.  
4. **Nền tảng Web LMS hoàn chỉnh:** Đã được đóng gói, cấu hình CI/CD và triển khai thực tế trên môi trường Production với đầy đủ các tính năng:
   - Bộ đánh giá năng lực đầu vào thích ứng (Adaptive Placement Diagnostic) giải quyết bài toán Cold-Start.
   - Cây kỹ năng trực quan dạng mạng lưới phản ánh trình độ thực tế.
   - Trình soạn thảo Monaco Editor kết hợp SQLite WASM sandbox chạy ngay trên RAM trình duyệt.
   - Bộ chấm điểm bản chất bằng AST và kế hoạch thực thi câu lệnh.
   - Thẻ giải thích quyết định đề xuất sư phạm (XAI Card).
   - Cơ chế phòng chống gian lận AI (Anti-Ghost Mastery Telemetry & Spot-Check 30s).
   - Chế độ phỏng vấn kỹ thuật giả lập (Mock Technical Interview).
   - Dashboard quản trị và giám sát sư phạm (Frustration Heatmap & Model Drift).  
5. **Bộ mã nguồn và tài liệu kỹ thuật:** Lưu trữ trên GitHub kèm tài liệu thiết kế hệ thống, tài liệu API, hướng dẫn triển khai Docker và cấu hình CI/CD tự động.

---

### 8. Tiến độ thực hiện (15 tuần: Từ 31/08/2026 đến 20/12/2026)

| TT | Thời gian | Nội dung công việc | Kết quả dự kiến đạt được |
|:---:|:---:|:---|:---|
| **1** | Tuần 1 (31/08 - 06/09) | Khảo sát bài toán, xác định phạm vi, hoàn thiện Đề cương chi tiết và Intent dự án. | Đề cương chi tiết (Phụ lục 02, 03) và Tuyên ngôn Intent được duyệt. |
| **2** | Tuần 2 (07/09 - 13/09) | Phân tích toán học (MDP, BKT, Ebbinghaus), thiết kế Đồ thị tri thức (18 SQL Concepts DAG), ngân hàng bài tập mẫu và bộ câu hỏi đánh giá đầu vào. | Tài liệu đặc tả toán học, file `knowledge_graph.json` và bộ bài tập mẫu bẫy biên kèm đề Diagnostic. |
| **3** | Tuần 3 (14/09 - 20/09) | Phân tích thiết kế hệ thống: Biểu đồ Use Case, C4 Model, ERD CSDL PostgreSQL, Sequence Diagrams (Onboarding & Rec Loop) và API Contracts. | Tài liệu Phân tích thiết kế hệ thống và bộ Schema Hợp đồng giao tiếp liên module. |
| **4** | Tuần 4 (21/09 - 27/09) | Xây dựng Môi trường mô phỏng nhận thức `SQLStudentEnv` theo chuẩn `gymnasium.Env`. | Module Simulator hoàn chỉnh, vượt qua bộ kiểm thử `check_env` của Gymnasium. |
| **5** | Tuần 5 (28/09 - 04/10) | Xây dựng 3 thuật toán đối chuẩn (Fixed Linear, Leitner, Rule-based) và thiết kế Action Masking cho RL. | Hoàn thiện 3 Baseline Agents và logic tạo mặt nạ hành động (Action Mask). |
| **6** | Tuần 6 (05/10 - 11/10) | Huấn luyện mô hình RL (MaskablePPO) trên Simulator; chạy đối chuẩn 100.000 episodes và xuất số liệu thống kê. | Mô hình RL hội tụ; bảng số liệu đối chuẩn thực nghiệm có ý nghĩa thống kê ($p < 0.05$). |
| **7** | Tuần 7 (12/10 - 18/10) | Xây dựng Bộ chấm điểm SQL: Tích hợp SQLite WASM (`sql.js`) in-memory và Bộ phân tích cú pháp AST (`sqlglot`). | Module `sql-engine` chạy kiểm thử thành công các truy vấn đúng/sai và bẫy AST. |
| **8** | Tuần 8 (19/10 - 25/10) | Phát triển Backend FastAPI: Dịch vụ Onboarding Diagnostic (suy diễn DAG), Two-Stage Recommender, XAI generator và CSDL PostgreSQL. | Dịch vụ Backend cốt lõi chạy ổn định, độ trễ khuyến nghị RL < 50ms. |
| **9** | Tuần 9 (26/10 - 01/11) | Phát triển Frontend Web LMS: Tích hợp Monaco Editor, Web Worker chạy SQLite WASM client-side và Diff Viewer. | Giao diện làm bài tập SQL Zero-Friction với độ trễ thực thi client-side < 20ms. |
| **10** | Tuần 10 (02/11 - 08/11) | Xây dựng Màn hình Onboarding Placement Test, Cây kỹ năng trực quan (`@xyflow/react`), Thẻ XAI và Progressive Hints Drawer. | Giao diện học tập trực quan hoàn chỉnh, liên kết trạng thái tri thức thời gian thực từ bước đầu vào. |
| **11** | Tuần 11 (09/11 - 15/11) | Phát triển cơ chế Chống gian lận AI (Anti-Ghost Mastery): Telemetry dán code 0ms + Spot-Check 30s + Chấm `EXPLAIN QUERY PLAN`. | Module an ninh nhận thức hoạt động chính xác; chấm điểm tối ưu Index thành công. |
| **12** | Tuần 12 (16/11 - 22/11) | Xây dựng Chế độ Phỏng vấn Kỹ thuật giả lập (Mock Technical Interview) và Dashboard Quản trị 2 tầng (Frustration & Drift). | Hoàn thiện tính năng phỏng vấn thử chân thực và Dashboard phân tích dữ liệu sư phạm. |
| **13** | Tuần 13 (23/11 - 29/11) | Thiết lập Hạ tầng DevOps: Đóng gói Docker đa tầng, thiết lập CI/CD GitHub Actions, cấu hình Nginx/SSL và Deploy Production. | Toàn bộ hệ thống được triển khai thành công trên máy chủ Production với CI/CD tự động. |
| **14** | Tuần 14 (30/11 - 06/12) | Thử nghiệm người dùng thực tế: Đánh giá hiệu quả học tập thông qua đối chuẩn Pre-test vs Post-test (Normalized Gain g); thu thập phản hồi và tối ưu hệ thống. | Dữ liệu thử nghiệm người dùng thật; báo cáo định lượng mức tăng trưởng tri thức và hiệu năng. |
| **15** | Tuần 15 (07/12 - 20/12) | Hoàn thiện toàn văn Luận văn tốt nghiệp, chuẩn bị Slide thuyết trình, quay video demo và nộp đồ án. | Cuốn báo cáo tốt nghiệp hoàn chỉnh, slide bảo vệ chuyên nghiệp sẵn sàng bảo vệ. |

---

*Đà Nẵng, ngày 13 tháng 09 năm 2026*

| BỘ MÔN DUYỆT | NGƯỜI HƯỚNG DẪN | SINH VIÊN THỰC HIỆN |
|:---:|:---:|:---:|
| *(Ký và ghi rõ họ tên)* | *(Ký và ghi rõ họ tên)* | *(Ký và ghi rõ họ tên)* |
| <br><br>**TS. Nguyễn Thị Hà Quyên** | <br><br>**TS. Nguyễn Tấn Thuận** | <br><br>**Diệp Văn Hiệu** |
