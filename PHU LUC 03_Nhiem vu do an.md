# TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT - ĐẠI HỌC ĐÀ NẴNG
## KHOA CÔNG NGHỆ SỐ
***

**CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM**  
**Độc lập - Tự do - Hạnh phúc**  

---

# NHIỆM VỤ ĐỒ ÁN TỐT NGHIỆP

* **Giảng viên hướng dẫn:** TS. Nguyễn Tấn Thuận  
* **Sinh viên thực hiện:** Diệp Văn Hiệu &emsp;&emsp; **Mã SV:** 22115053122316  

---

### 1. Tên đề tài:
**Hệ thống quản lý và khuyến nghị lộ trình học cá nhân hóa (Adaptive Learning) ứng dụng mô hình học tăng cường (Reinforcement Learning).**

---

### 2. Các số liệu, tài liệu ban đầu:

Toàn bộ tài liệu lý thuyết, tiêu chuẩn kỹ thuật và nguồn dữ liệu phục vụ nghiên cứu và triển khai đề tài được khảo cứu và trích dẫn từ các nguồn học thuật và công nghệ chính thống, có minh chứng xác thực:

1. **Giáo trình học thuật và Tiêu chuẩn Ngôn ngữ truy vấn CSDL:**
   - *Giáo trình cơ sở:* Silberschatz, A., Korth, H. F., & Sudarshan, S. (2019). *Database System Concepts* (7th Edition). McGraw-Hill Education (ISBN: 978-0078022159). Sử dụng làm chuẩn mực thiết kế 18 khái niệm trong Đồ thị tri thức (Knowledge Graph DAG) và các quy tắc đại số quan hệ.  
     *Minh chứng:* Website giáo trình quốc tế: https://www.db-book.com
   - *Tiêu chuẩn quốc tế:* Tiêu chuẩn *ISO/IEC 9075:2016 (Information technology — Database languages — SQL)* ban hành bởi Tổ chức Tiêu chuẩn hóa Quốc tế (ISO). Sử dụng để chuẩn hóa ngữ pháp và cú pháp câu lệnh truy vấn ANSI SQL.  
     *Minh chứng:* Trang tổng quan tiêu chuẩn SQL:2016 (ISO/IEC 9075): https://en.wikipedia.org/wiki/SQL:2016 và Cổng tiêu chuẩn ISO: https://standards.iso.org/
   - *Tài liệu đào tạo:* Giáo trình, Bài giảng và Đề cương chi tiết học phần Cơ sở dữ liệu – Khoa Công nghệ Số, Trường Đại học Sư phạm Kỹ thuật - Đại học Đà Nẵng.

2. **Bộ tài liệu Kỹ thuật SQLite Engine, Query Planner và WebAssembly (WASM):**
   - *Đặc tả kỹ thuật EQP:* Tài liệu đặc tả kỹ thuật SQLite Query Planner và cơ chế phân tích kế hoạch thực thi câu lệnh `EXPLAIN QUERY PLAN` bởi SQLite Consortium. Sử dụng làm cơ chế thuật toán lõi để chấm điểm tối ưu hóa chỉ mục (Index optimization).  
     *Minh chứng:* Tài liệu chính thức của SQLite: https://www.sqlite.org/eqp.html và https://www.sqlite.org/queryplanner.html
   - *Công nghệ SQLite Wasm:* Thư viện mã nguồn mở `sql.js` (SQLite compiled to WebAssembly) do Alon Zakai et al. phát triển cùng bản phân phối chính thức của SQLite. Sử dụng để xây dựng Sandbox client-side chạy cô lập và an toàn trong RAM trình duyệt của người học.  
     *Minh chứng:* Trang tài liệu tương tác chính thức `sql.js`: https://sql.js.org/ ; Kho mã nguồn GitHub: https://github.com/sql-js/sql.js ; Mục phân phối SQLite Wasm: https://www.sqlite.org/download.html

3. **Tài liệu Học thuật về Mô hình hóa Nhận thức Người học (Cognitive Modeling):**
   - *Mô hình Bayesian Knowledge Tracing (BKT):* Công trình khoa học nền tảng: Corbett, A. T., & Anderson, J. R. (1994). *Knowledge tracing: Modeling the acquisition of procedural knowledge*. User Modeling and User-Adapted Interaction, 4(4), 253–278. Sử dụng để xây dựng 4 tham số nhận thức ($P(L_0), P(T), P(G), P(S)$) cập nhật xác suất làm chủ tri thức của người học sau mỗi lượt làm bài.  
     *Minh chứng:* Bài báo xuất bản trên Springer Nature: https://link.springer.com/article/10.1007/BF01099821 (Định danh DOI: https://doi.org/10.1007/BF01099821)
   - *Mô hình Quên lãng Ebbinghaus:* Nghiên cứu nguồn của Hermann Ebbinghaus (1885) cùng công trình tái lập thực nghiệm định lượng hiện đại: Murre, J. M., & Dros, J. (2015). *Replication and Analysis of Ebbinghaus’ Forgetting Curve*. PLOS ONE, 10(7), e0132110. Sử dụng để thiết lập công thức suy giảm trí nhớ ngắt quãng $R(t) = e^{-\frac{\Delta t}{S}}$.  
     *Minh chứng (Open Access toàn văn):* Tạp chí khoa học PLOS ONE: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0132110 (DOI: https://doi.org/10.1371/journal.pone.0132110)

4. **Tài liệu Học thuật và Thư viện Chuẩn về Học tăng cường (Reinforcement Learning):**
   - *Giáo trình lý thuyết:* Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd Edition). The MIT Press, Cambridge, MA (ISBN: 978-0262039246). Sử dụng làm cơ sở lý thuyết mô hình hóa Quá trình Quyết định Markov (MDP), hàm giá trị và chính sách tối ưu.  
     *Minh chứng:*  
     + Bản toàn văn học thuật lưu trữ tại ĐH Stanford: https://web.stanford.edu/class/psych209/Readings/SuttonBartoIPRLBook2ndEd.pdf  
     + Kho mã nguồn thuật toán chính thức của sách trên GitHub: https://github.com/ShangtongZhang/reinforcement-learning-an-introduction  
     + Hồ sơ sách tại Google Books: https://books.google.com/books?id=uWV0DwAAQBAJ
   - *Thuật toán PPO:* Công trình nghiên cứu gốc của OpenAI: Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). *Proximal Policy Optimization Algorithms*. arXiv:1707.06347.  
     *Minh chứng (Open Access toàn văn):* Báo cáo khoa học arXiv: https://arxiv.org/abs/1707.06347
   - *Môi trường mô phỏng Gymnasium:* Thư viện chuẩn hóa môi trường mô phỏng củng cố bởi Farama Foundation. Sử dụng để phát triển môi trường nhận thức `SQLStudentEnv`.  
     *Minh chứng:* Tài liệu Gymnasium: https://gymnasium.farama.org
   - *Thư viện giải thuật SB3-Contrib:* Module triển khai thuật toán `MaskablePPO` kết hợp Action Masking trên không gian hành động hợp lệ của DAG: Raffin et al. (2021). *Stable-Baselines3: Reliable Reinforcement Learning Implementations*. JMLR, 22(268), 1–8.  
     *Minh chứng:* GitHub: https://github.com/Stable-Baselines-Team/stable-baselines3-contrib và Bài báo JMLR: https://jmlr.org/papers/v22/20-1364.html

5. **Tài liệu Phân tích Cú pháp Trừu tượng (AST) và Kiểm thử Ngữ nghĩa:**
   - *Thư viện phân tích AST:* `sqlglot` (Python SQL Parser, Transpiler, Optimizer & Engine) phát triển bởi Toby Mao et al. Sử dụng để bóc tách câu lệnh SQL của học viên thành cây cú pháp trừu tượng (AST), kiểm tra các quy tắc ngữ nghĩa (bắt buộc dùng JOIN, cấm subquery hardcode, phân tích độ phức tạp).  
     *Minh chứng:* Kho mã nguồn GitHub: https://github.com/tobymao/sqlglot và Tài liệu chính thức: https://sqlglot.com

6. **Nguồn Dữ liệu Bài tập, Bẫy biên Thực tế và Phương pháp Đối chuẩn Đánh giá:**
   - *Ngân hàng bài tập thực tế:* Tổng hợp và chuẩn hóa 100+ bài tập truy vấn SQL từ cơ bản đến nâng cao (có phân loại bẫy biên NULL, Duplicate, Aggregation) đối chiếu từ các nền tảng đánh giá kỹ thuật quốc tế:
     + LeetCode Database Problemset: https://leetcode.com/problemset/database
     + HackerRank SQL Domain: https://www.hackerrank.com/domains/sql
     + StrataScratch SQL Interview Questions: https://www.stratascratch.com
   - *Bộ Cơ sở dữ liệu mẫu chuẩn công nghiệp:* Schema và dữ liệu mẫu `Northwind Database` (Microsoft Open Source) và `Sakila Sample Database` (MySQL/PostgreSQL/SQLite) được nạp trực tiếp vào SQLite WASM làm môi trường thực thi thực tế.  
     *Minh chứng:* Northwind SQLite: https://github.com/jpwhite3/northwind-SQLite3 ; Sakila Database: https://dev.mysql.com/doc/sakila/en/
   - *Phương pháp luận đối chuẩn Pre-test & Post-test:* Công trình nghiên cứu về Chỉ số Tăng trưởng Kiến thức Chuẩn hóa (Normalized Gain $g = \frac{\text{Post} - \text{Pre}}{100 - \text{Pre}}$): Hake, R. R. (1998). *Interactive-engagement versus traditional methods: A six-thousand-student survey of mechanics test data*. American Journal of Physics, 66(1), 64–74. Sử dụng làm phương pháp luận khoa học để đánh giá hiệu quả sư phạm ở Chương 4.  
     *Minh chứng (Open Access toàn văn):* Thư viện số Vật lý & Giáo dục ComPADRE: https://www.compadre.org/portal/items/detail.cfm?ID=2662 (Định danh DOI: https://doi.org/10.1119/1.18809)

---

### 3. Nội dung chính của đồ án:
Đồ án tập trung nghiên cứu, thiết kế, phát triển và triển khai hệ thống với các nội dung trọng tâm sau:

* **Mở đầu:**  
  Trình bày bối cảnh nghiên cứu, tính cấp thiết của bài toán học tập thích ứng cá nhân hóa cho môn SQL, xác định rõ mục tiêu, đối tượng, phạm vi nghiên cứu và phương pháp tiếp cận.

* **Chương 1: Cơ sở lý thuyết:**  
  - Nghiên cứu tổng quan về Hệ thống dạy học thông minh (ITS) và phương pháp khuyến nghị thích ứng.  
  - Nghiên cứu mô hình Đồ thị tri thức (Knowledge Graph DAG) và mô hình hóa nhận thức BKT kết hợp đường cong quên lãng Ebbinghaus.  
  - Nghiên cứu lý thuyết Quá trình Quyết định Markov (MDP) và thuật toán Học tăng cường PPO/MaskablePPO.  
  - Nghiên cứu công nghệ phân tích cú pháp AST và chạy code an toàn trên trình duyệt qua SQLite WASM.  

* **Chương 2: Phân tích thiết kế hệ thống:**  
  - Phân tích yêu cầu chức năng (Use Cases cho Học viên, Giảng viên, AI Agent) và yêu cầu phi chức năng (Độ trễ < 50ms, độ tin cậy, an toàn sandbox).  
  - Thiết kế kiến trúc tổng thể phần mềm theo mô hình C4 (Context, Container, Component).  
  - Thiết kế Đồ thị tri thức SQL (18 khái niệm cốt lõi) và ngân hàng bài tập kèm bẫy biên (NULL, duplicates).  
  - Thiết kế Bộ đánh giá năng lực đầu vào (Adaptive Diagnostic Placement Test & Calibration Mini-Check 30s) và thuật toán lan truyền tiên quyết trên DAG giải quyết bài toán Khởi đầu Lạnh (Cold-Start).  
  - Thiết kế mô hình toán học MDP: Không gian trạng thái $s_t \in \mathbb{R}^{41}$, không gian hành động rời rạc 162 actions với Action Masking, và hàm phần thưởng đa mục tiêu cân bằng (Mastery, Retention, ZPD, Penalty).  
  - Thiết kế mô hình dữ liệu (ERD) và cơ sở dữ liệu quan hệ PostgreSQL.  
  - Thiết kế biểu đồ tuần tự (Sequence Diagrams) cho các luồng tương tác cốt lõi (Onboarding, Recommendation, Submission, Telemetry).  
  - Thiết kế hợp đồng giao tiếp API RESTful v1 và giao diện người dùng không ma sát (Zero-Friction UI/UX).  

* **Chương 3: Xây dựng chương trình và Triển khai hạ tầng:**  
  - Xây dựng Môi trường mô phỏng nhận thức `SQLStudentEnv` theo chuẩn `gymnasium.Env`.  
  - Huấn luyện mô hình RL Macro Agent (MaskablePPO) và xuất bản chính sách suy luận tối ưu.  
  - Xây dựng Module Đánh giá năng lực đầu vào và Bộ khởi tạo vector trạng thái nhận thức $s_0$.  
  - Xây dựng Bộ chấm điểm SQL đa lớp: SQLite WASM client-side runner, Bộ phân tích cú pháp AST (`sqlglot`) và Chấm kế hoạch `EXPLAIN QUERY PLAN`.  
  - Phát triển hệ thống Backend (FastAPI, PostgreSQL, Socratic AI Tutor, Telemetry Ingestion).  
  - Phát triển ứng dụng Web Frontend (Next.js 14, Monaco Editor, `@xyflow/react` Visual Skill Tree, XAI Cards, Mock Technical Interview).  
  - Thiết kế và triển khai Hạ tầng DevOps: Đóng gói Docker đa tầng, thiết lập CI/CD Pipeline GitHub Actions, cấu hình Reverse Proxy Nginx/SSL và triển khai Production.  
  - Tích hợp Trung tâm quan sát 2 tầng: Dashboard Kỹ thuật và Giám sát Sư phạm (Frustration Heatmap & Model Drift).  

* **Chương 4: Thực nghiệm và Đánh giá kết quả:**  
  - Thiết lập kịch bản thực nghiệm đối chuẩn ngoại tuyến trên 100.000 episodes với 3 nhóm học sinh ảo (Fast, Average, Struggling).  
  - Phân tích thống kê đối chuẩn mô hình RL với 3 Baselines (Fixed Linear, Leitner, Rule-based) thông qua kiểm định giả thuyết $t$-test ($p < 0.05$).  
  - Đánh giá hiệu năng kỹ thuật hệ thống (độ trễ inference, thời gian chạy truy vấn client-side, mức tiêu thụ tài nguyên).  
  - Thử nghiệm người dùng thực tế đánh giá độ hài lòng UX và hiệu quả sư phạm thông qua đối chuẩn Pre-test vs Post-test (Normalized Gain $g$).  

* **Kết luận và hướng phát triển:**  
  Tổng kết các đóng góp học thuật và sản phẩm kỹ thuật của đề tài; chỉ ra các hạn chế và đề xuất hướng mở rộng trong tương lai.

---

### 4. Các sản phẩm dự kiến:
1. **Báo cáo đồ án tốt nghiệp:** Quyển báo cáo đóng bìa và slide thuyết trình chuẩn chỉnh theo mẫu quy định của Nhà trường.
2. **Bộ mã nguồn phần mềm hoàn chỉnh:**
   - Mã nguồn môi trường mô phỏng nhận thức `SQLStudentEnv` chuẩn Gymnasium.
   - Mã nguồn mô hình RL (MaskablePPO) và pipeline thực nghiệm đối chuẩn.
   - Bộ mã nguồn Backend FastAPI và Frontend Next.js (bao gồm Bộ đánh giá năng lực đầu vào, Monaco Editor, WASM sandbox, AST grader, Visual Skill Tree, và Mock Interview).
   - Bộ cấu hình triển khai hạ tầng Docker, Docker Compose, Nginx và CI/CD GitHub Actions.
3. **Báo cáo đối chuẩn mô hình AI:** Bảng số liệu, biểu đồ hội tụ reward và kết quả kiểm định thống kê $t$-test ($p < 0.05$).
4. **Hệ thống Web LMS hoạt động trực tiếp:** Nền tảng chạy thực tế trên môi trường Production phục vụ học tập thích ứng môn SQL.

---

### 5. Ngày giao đồ án: 30/08/2026
### 6. Ngày nộp đồ án: 20/12/2026

---

*Đà Nẵng, ngày 13 tháng 09 năm 2026*

| PHÓ TRƯỞNG BỘ MÔN | NGƯỜI HƯỚNG DẪN | SINH VIÊN THỰC HIỆN |
|:---:|:---:|:---:|
| *(Ký và ghi rõ họ tên)* | *(Ký và ghi rõ họ tên)* | *(Ký và ghi rõ họ tên)* |
| <br><br>**TS. Nguyễn Thị Hà Quyên** | <br><br>**TS. Nguyễn Tấn Thuận** | <br><br>**Diệp Văn Hiệu** |
