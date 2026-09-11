# Statement of Intent: Adaptive Learning for SQL/Database using Reinforcement Learning

> **Trạng thái:** Đã xác nhận (Confirmed via `/onion-agents:interview-me`)  
> **Thời gian tạo:** 2026-09-05  
> **Lĩnh vực:** Hệ thống giáo dục thông minh (Adaptive Learning) / Học máy (Reinforcement Learning) / Công nghệ phần mềm (Full-stack Web LMS)

---

## 1. Tuyên ngôn Mục tiêu (Core Intent)

* **Outcome:** Xây dựng nền tảng Web Adaptive Learning hoàn chỉnh, kiến trúc lõi độc lập môn học (Domain-Agnostic Core via Knowledge Graph & Pluggable Evaluators), triển khai thực tế và chuyên sâu cho môn SQL/Database với mô hình RL 2 tầng (Two-stage). Hệ thống tập trung tối đa vào **trải nghiệm người dùng thân thiện (Zero-Friction, không đánh đố, chống nản)**, tích hợp tính năng giải thích quyết định (Explainable AI - XAI), Bản đồ tri thức trực quan (Visual Knowledge Map), cùng Dashboard giám sát 2 tầng (Kỹ thuật & Độ trôi của mô hình AI) để đảm bảo tính ổn định và ứng dụng thực tế.
* **User:** 
  - *Người học SQL/Database:* Người học mọi cấp độ (sinh viên, người chuyển ngành) cần môi trường học trực quan, phản hồi khích lệ, thao tác 1 chạm và lộ trình cá nhân hóa không đánh đố.
  - *Quản trị viên / Giảng viên:* Theo dõi tiến độ học tập, điểm nghẽn kiến thức của học viên và kiểm soát độ ổn định của hệ thống / độ trôi mô hình AI.
  - *Hội đồng chấm đồ án tốt nghiệp CNTT:* Đánh giá tính khoa học của mô hình toán/RL và chất lượng kiến trúc phần mềm thực tế sẵn sàng sản xuất.
* **Why now:** Đồ án tốt nghiệp cần giải quyết đồng thời hai bài toán để đạt điểm xuất sắc: một sản phẩm phần mềm hoàn thiện thực tế (Web LMS + Sandbox gõ/chấm SQL trực tiếp, UX mượt mà) và nghiên cứu khoa học có chiều sâu (mô hình hóa MDP, giả lập người học chuẩn lý thuyết nhận thức, số liệu đối chuẩn thuyết phục).
* **Success Criteria:** 
  1. *UX & Sản phẩm:* Trải nghiệm người dùng không ma sát (chạy SQL bằng `Ctrl + Enter`, xem schema 1-click, diff kết quả trực quan, lỗi được dịch thân thiện, gợi ý 3 cấp độ không gây ức chế); giao diện minh bạch lý do gợi ý (XAI) và bản đồ tri thức trực quan.
  2. *Học thuật & Thuật toán:* Thuật toán RL (Two-stage) chứng minh sự vượt trội (tốc độ học nhanh hơn, độ lưu giữ kiến thức cao hơn, tránh quá tải/nản lòng) so với lộ trình cố định (Linear) và lộ trình theo luật (Rule-based) trên Simulator (xây dựng dựa trên Knowledge Graph + BKT + Ebbinghaus).
  3. *Độ ổn định & Mở rộng:* Giám sát chặt chẽ độ trễ gợi ý (< 200ms), tỷ lệ an toàn sandbox SQL, tỷ lệ sai lệch dự đoán; kiến trúc sẵn sàng cắm môn học mới mà không sửa core logic.
* **Constraint:** 
  - Ngân hàng bài tập và sandbox chạy code tập trung hoàn thiện 100% cho môn SQL/Database; các môn khác chuẩn bị ở tầng thiết kế kiến trúc (Interfaces & Schemas).
  - Mô hình RL được pre-train hoàn chỉnh trên Simulator trước khi đưa vào Backend để phục vụ suy luận thời gian thực (tránh cold-start và rủi ro trên người thật).
* **Out of scope (Phạm vi không làm):**
  - Không nạp dữ liệu bài tập cho các môn học khác ngoài SQL trong phạm vi đồ án lần này.
  - Không tự phát triển engine RDBMS riêng (dùng cơ chế sandbox an toàn trên SQLite WebAssembly / in-memory).
  - Không huấn luyện RL online từ số 0 trên người dùng thật. Bắt buộc dùng **Pre-trained Static RL Policy** (Huấn luyện hoàn tất trên Simulator trước khi deploy). Ở môi trường thực tế, hệ thống chỉ đo lường độ lệch (Model Drift) để chứng minh tính chuẩn xác của Simulator so với người thật.
