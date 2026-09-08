# BỘ CÂU HỎI VÀ KỊCH BẢN TRẢ LỜI KHI BẢO VỆ ĐỀ CƯƠNG VỚI GVHD & BỘ MÔN
## Đề tài: Hệ thống Quản lý và Khuyến nghị Lộ trình Học Thích ứng (Adaptive Learning) cho môn SQL ứng dụng Học Tăng Cường (Reinforcement Learning)

> **Đối tượng trao đổi:** TS. Nguyễn Tấn Thuận (GVHD) & TS. Nguyễn Thị Hà Quyên (Phó Trưởng Bộ môn / Duyệt đề tài)  
> **Sinh viên:** Diệp Văn Hiệu (MSSV: 22115053122316 - Lớp: 22T3)  
> **Tài liệu đối chiếu:** `PHU LUC 02_De cuong DATN.md` & `PHU LUC 03_Nhiem vu do an.md`

---

## 🎯 CHIẾN LƯỢC TỔNG QUAN KHI GẶP THẦY / CÔ

Giảng viên hướng dẫn và Bộ môn khi duyệt đề cương ĐATN thường quan tâm đến **4 câu hỏi lớn nhất**:
1. **"Đề tài có quá sức với 1 sinh viên làm trong 15 tuần không?"** (Tính khả thi).
2. **"Tính mới, hàm lượng khoa học (AI/Toán) nằm ở đâu, hay chỉ là làm web thông thường?"** (Hàm lượng học thuật).
3. **"Lấy đâu ra dữ liệu để huấn luyện Reinforcement Learning?"** (Tính xác thực của mô hình AI).
4. **"Hệ thống có gì vượt trội so với các nền tảng học SQL hiện có (LeetCode, HackerRank, W3Schools)?"** (Giá trị thực tiễn).

Dưới đây là 10 câu hỏi "sát sườn" nhất kèm kịch bản trả lời mẫu chuẩn phong thái nghiên cứu sinh viên CNTT xuất sắc.

---

## NHÓM 1: QUY MÔ, PHẠM VI & TÍNH KHẢ THI (SOLO DEV TRONG 15 TUẦN)

### ❓ Câu hỏi 1: "Đề tài này có quá rộng không em? Vừa nghiên cứu Học tăng cường (RL), mô phỏng BKT, vừa làm Web LMS hoàn chỉnh, một mình em làm trong 15 tuần có kịp tiến độ không?"

* **Ý đồ của Thầy/Cô:** Kiểm tra xem sinh viên có bị "ảo tưởng quy mô" (scope creep) hay không, có kế hoạch quản lý rủi ro và phân bổ công việc thực tế hay không.
* **Cách trả lời chuẩn xác:**
  > *"Dạ thưa Thầy/Cô, em đã ý thức rất rõ về giới hạn 15 tuần của đồ án độc lập (Solo Project), do đó em đã chủ động áp dụng 3 chiến lược để đảm bảo 100% đúng tiến độ:*
  > 1. ***Phân kỳ 3 mốc rõ ràng (MVP Phasing):***
  >    - *Tuần 1 - 7 (Core MVP): Tập trung toàn lực vào Simulator nhận thức (`gymnasium`), huấn luyện mô hình RL đối chuẩn ra số liệu khoa học và Web LMS cơ bản.*
  >    - *Tuần 8 - 11: Mở rộng các tính năng chuyên sâu (chấm `EXPLAIN QUERY PLAN`, Telemetry chống gian lận, Dashboard).*
  >    - *Tuần 12 - 15: Thử nghiệm người dùng thực tế và hoàn thiện báo cáo.*
  > 2. ***Tận dụng tối đa các thư viện chuẩn công nghiệp:***
  >    - *Mô phỏng RL: Dùng `Gymnasium` và `Stable-Baselines3` (không viết lại thuật toán PPO từ đầu).*
  >    - *Chấm SQL: Tích hợp `sql.js` (SQLite WebAssembly) và parser `sqlglot` đã trưởng thành.*
  >    - *Frontend: Dùng Monaco Editor và thư viện vẽ đồ thị node `@xyflow/react`.*
  > 3. ***Thiết lập Danh sách Dứt khoát KHÔNG LÀM (Not-Doing List):***
  >    - *Không chạy container RDBMS riêng trên server cho từng người học để tránh quá tải hạ tầng.*
  >    - *Không huấn luyện RL trực tuyến (online) trên người thật từ con số 0; mà dùng mô hình đã huấn luyện offline trên môi trường giả lập (offline pre-trained policy).*
  >    - *Phạm vi chỉ gói gọn trong 18 khái niệm cốt lõi của môn Cơ sở dữ liệu và truy vấn SQL, không mở rộng sang các môn học khác.*
  > *Nhờ đó, khối lượng công việc hoàn toàn nằm trong tầm kiểm soát của em."*

---

## NHÓM 2: HÀM LƯỢNG KHOA HỌC & MÔ HÌNH TOÁN / AI

### ❓ Câu hỏi 2: "Tại sao lại dùng Học tăng cường (Reinforcement Learning - RL) cho bài toán gợi ý bài tập? Dùng Rule-based (cây quyết định theo điểm) hoặc Collaborative Filtering (lọc cộng tác) không đơn giản hơn sao?"

* **Ý đồ của Thầy/Cô:** Kiểm tra xem sinh viên có dùng AI "đao to búa lớn" chỉ để trang trí hay thực sự hiểu bản chất ưu việt của giải thuật.
* **Cách trả lời chuẩn xác:**
  > *"Dạ thưa Thầy/Cô, việc học tập không phải là một chuỗi hành động độc lập tĩnh mà là một **Quá trình Quyết định Markov Tuần tự (Sequential Decision Process)**:*
  > 1. ***Hạn chế của Rule-based / Decision Tree:*** *Chỉ dựa trên điều kiện cứng nhắc (ví dụ: đúng làm bài khó hơn, sai làm bài dễ hơn), bị bùng nổ luật (rule explosion) khi số lượng khái niệm nhiều và không tính toán được hiệu ứng dài hạn như đường cong quên lãng.*
  > 2. ***Hạn chế của Collaborative Filtering:*** *Phụ thuộc vào dữ liệu tương đồng của hàng nghìn người học đi trước, gặp bài toán Khởi đầu lạnh (Cold-Start) nghiêm trọng và không tối ưu hóa theo quy luật sư phạm cá nhân.*
  > 3. ***Ưu thế của RL:*** *RL tối ưu hóa **Tổng phần thưởng tích lũy dài hạn (Cumulative Return)**. Mô hình RL Macro Agent sẽ học được chính sách sư phạm tối ưu: biết khi nào cần cho người học tiến lên Vùng phát triển gần (ZPD), khi nào cần ngắt quãng lặp lại (Spaced Repetition) để củng cố trí nhớ, và khi nào cần hạ độ khó để tránh làm học viên nản chí (Frustration). Đây là điều các phương pháp truyền thống không làm được."*

### ❓ Câu hỏi 3: "Reinforcement Learning cần hàng triệu lượt tương tác để hội tụ. Em lấy đâu ra dữ liệu người học thật để huấn luyện mô hình?"

* **Ý đồ của Thầy/Cô:** Bắt bài toán "Thiếu dữ liệu huấn luyện RL" – một bẫy kinh điển trong các đề tài ứng dụng AI.
* **Cách trả lời chuẩn xác:**
  > *"Dạ thưa Thầy/Cô, trong giáo dục, chúng ta **không thể dùng người học thật để huấn luyện RL từ đầu** vì điều đó vi phạm đạo đức sư phạm (thuật toán thử-sai sẽ đưa ra những bài tập vô lý gây ức chế cho sinh viên). Do đó, em tiếp cận theo chuẩn mực quốc tế hiện nay:*
  > 1. *Xây dựng **Môi trường mô phỏng nhận thức người học ảo (`SQLStudentEnv`)** theo chuẩn `gymnasium.Env`.*
  > 2. *Môi trường này được toán học hóa bằng 2 mô hình nhận thức kinh điển:*
  >    - ***Bayesian Knowledge Tracing (BKT)*** *của Corbett & Anderson (CMU) để mô phỏng xác suất chuyển giao tri thức.*
  >    - ***Đường cong quên lãng Ebbinghaus*** *để mô phỏng sự suy giảm trí nhớ theo thời gian.*
  > 3. *Em cấu hình **3 nhóm Personas ảo** (học nhanh, trung bình, tiếp thu chậm) để huấn luyện mô hình RL ngoại tuyến (offline training) qua 100.000 episodes cho đến khi chính sách hội tụ.*
  > 4. *Sau khi mô hình đạt chuẩn, em xuất bản thành dạng suy luận tĩnh (Inference Policy via ONNX/stateless weights) để tích hợp vào Web LMS phục vụ người dùng thật một cách an toàn và có độ trễ cực thấp (< 15ms)."*

### ❓ Câu hỏi 4: "Khi một học viên mới toanh vào hệ thống, mô hình RL làm sao biết trình độ của họ để gợi ý? (Bài toán Cold-Start)"

* **Ý đồ của Thầy/Cô:** Kiểm tra xem sinh viên có nghĩ đến trải nghiệm người dùng thực tế ở bước đầu tiên hay không.
* **Cách trả lời chuẩn xác:**
  > *"Dạ thưa Thầy/Cô, em đã thiết kế cấu phần **Adaptive Placement Diagnostic (Bộ đánh giá năng lực đầu vào)** để giải quyết triệt để bài toán Cold-Start ngay tại Tuần 8 của đề cương:*
  > 1. *Học viên được lựa chọn 2 luồng: Hoặc làm **Bài kiểm tra thích ứng ngắn 5-7 câu** tại các nút giao then chốt trên Đồ thị tri thức (DAG), hoặc tự chọn nhóm trình độ.*
  > 2. *Nếu tự chọn trình độ (ví dụ chọn Intermediate), hệ thống sẽ kích hoạt **1 câu hỏi xác thực phản xạ 30 giây (Calibration Mini-Check)** để kiểm tra độ tin cậy, tránh hiện tượng tự tin thái quá (hiệu ứng Dunning-Kruger).*
  > 3. *Kết quả bài kiểm tra được chạy qua **Thuật toán lan truyền tiên quyết (Prerequisite Propagation)** trên DAG để tính toán vector trạng thái ban đầu $s_0 \in \mathbb{R}^{41}$. Nhờ đó, người học được đưa ngay vào đúng Vùng phát triển gần (ZPD) từ bài tập đầu tiên."*

---

## NHÓM 3: KIẾN TRÚC KỸ THUẬT, AN TOÀN & CHẤM ĐIỂM BẢN CHẤT

### ❓ Câu hỏi 5: "Học viên viết code SQL rồi bấm chạy thì thực thi ở đâu? Nếu có 100-500 sinh viên cùng làm bài thì server có bị treo hoặc bị tấn công SQL Injection phá database không?"

* **Ý đồ của Thầy/Cô:** Kiểm tra kiến trúc hạ tầng và tư duy an ninh phần mềm.
* **Cách trả lời chuẩn xác:**
  > *"Dạ thưa Thầy/Cô, đây là điểm đột phá kiến trúc của đề tài em:*
  > 1. ***Thực thi 100% tại Client-side qua WebAssembly (WASM):*** *Em tích hợp thư viện `sql.js` (SQLite compiled to WASM) chạy trong Web Worker của trình duyệt. Database mẫu (Northwind, Sakila) được nạp trực tiếp vào RAM trình duyệt của sinh viên.*
  > 2. ***Server không bao giờ bị nghẽn:*** *Khi sinh viên chạy thử hay debug câu lệnh, 100% tài nguyên CPU/RAM là của máy người học (độ trễ < 20ms). Server FastAPI chỉ nhận nộp bài (submission) và truy vấn nhẹ $\to$ Một VPS nhỏ (2 vCPU, 4GB RAM) có thể gánh mượt mà **500 - 1.000 sinh viên truy cập đồng thời**.*
  > 3. ***Miễn nhiễm hoàn toàn với tấn công phá hoại CSDL:*** *Vì SQLite chạy cô lập trên RAM máy khách, kể cả học viên cố tình viết `DROP TABLE` hay injection thì cũng chỉ ảnh hưởng phiên làm việc trên trình duyệt của chính họ; chỉ cần F5 là CSDL tự khôi phục, không thể chạm tới PostgreSQL của hệ thống."*

### ❓ Câu hỏi 6: "Các trang như LeetCode thường chỉ so sánh kết quả bảng đầu ra (Output Matching). Tại sao em lại cần phân tích AST (`sqlglot`) và chấm `EXPLAIN QUERY PLAN`?"

* **Ý đồ của Thầy/Cô:** Kiểm tra tiêu chí "Hiểu bản chất" của đề tài có thực chất hay không.
* **Cách trả lời chuẩn xác:**
  > *"Dạ thưa Thầy/Cô, cách chấm Output Matching truyền thống có lỗ hổng rất lớn: Sinh viên có thể 'ăn gian' bằng cách hardcode kết quả (ví dụ dùng `UNION ALL SELECT 'John', 25`), hoặc dùng cú pháp sai bản chất (ví dụ bài yêu cầu `JOIN` nhưng lại dùng tích Descartes `FROM A, B WHERE...` hoặc lạm dụng Subquery kém hiệu quả).*
  > *Hệ thống của em chấm điểm theo **3 lớp bảo đảm 'Hiểu Bản Chất'**:*
  > 1. ***Lớp 1 - Thực thi dữ liệu (Output Match):*** *So sánh dữ liệu đầu ra với bộ test case bẫy biên (NULL, duplicates, empty).*
  > 2. ***Lớp 2 - Phân tích Cú pháp Trừu tượng (AST Analysis qua `sqlglot`):*** *Bóc tách cây cú pháp để bắt buộc dùng đúng cấu trúc sư phạm yêu cầu (ví dụ: bắt buộc `INNER JOIN`, cấm hardcode, kiểm tra độ sâu truy vấn).*
  > 3. ***Lớp 3 - Chấm tối ưu hóa Kế hoạch thực thi (`EXPLAIN QUERY PLAN`):*** *Đánh giá xem sinh viên có dùng đúng Index không (hiển thị `SEARCH TABLE ... USING INDEX` thay vì `SCAN TABLE`). Điều này giúp sinh viên rèn luyện tư duy tối ưu hóa hiệu năng – kỹ năng cốt lõi khi đi làm doanh nghiệp."*

---

## NHÓM 4: CHỐNG GIAN LẬN TRONG THỜI ĐẠI AI (ANTI-GHOST MASTERY)

### ❓ Câu hỏi 7: "Bây giờ sinh viên ai cũng dùng ChatGPT / GitHub Copilot. Họ chỉ cần copy đề bài vào rồi paste code giải ra thì hệ thống thích ứng của em còn ý nghĩa gì nữa?"

* **Ý đồ của Thầy/Cô:** Nắm bắt vấn đề thời sự nhất hiện nay trong đào tạo CNTT.
* **Cách trả lời chuẩn xác:**
  > *"Dạ thưa Thầy/Cô, em xem đây là thách thức trọng tâm và đã thiết kế cơ chế **Phòng vệ Chống Gian lận Nhận thức (Anti-Ghost Mastery)** gồm 3 lớp:*
  > 1. ***Tích hợp trợ lý Socratic AI Tutor nội bộ:*** *Thay vì để sinh viên chạy sang ChatGPT hỏi đáp số, hệ thống tích hợp sẵn AI Tutor nhưng được cấu hình theo phương pháp Socratic: tuyệt đối không giải hộ code, chỉ đặt câu hỏi gợi mở từng bước dựa trên lỗi sai cú pháp.*
  > 2. ***Phân tích Telemetry hành vi soạn thảo (0ms paste detection):*** *Giao diện Monaco Editor ghi nhận nhịp gõ phím. Nếu toàn bộ khối code phức tạp xuất hiện tức thì trong 0ms (copy-paste từ ngoài vào) mà không có nhịp gõ phím tự nhiên, hệ thống sẽ gắn cờ cảnh báo.*
  > 3. ***Thử thách phản xạ nhanh (Calibration Spot-Check 30s):*** *Khi phát hiện bất thường hoặc khi sinh viên vượt qua một bài tập khó bất thường, hệ thống sẽ kích hoạt 1 câu hỏi phản xạ nhanh 30 giây (ví dụ: 'Nếu đổi LEFT JOIN thành INNER JOIN thì số dòng tăng hay giảm?'). Sinh viên thực sự tự làm sẽ trả lời được ngay; nếu copy AI sẽ bị lộ và hệ thống lập tức điều chỉnh điểm tin cậy kiến thức về mức thực tế."*

---

## NHÓM 5: ĐÁNH GIÁ THỰC NGHIỆM & ĐÓNG GÓP HỌC THUẬT (CHƯƠNG 4)

### ❓ Câu hỏi 8: "Ở Chương 4, em làm thế nào để chứng minh mô hình RL của em thực sự tốt hơn cách dạy học truyền thống hay các thuật toán khác?"

* **Ý đồ của Thầy/Cô:** Kiểm tra phương pháp luận nghiên cứu và tiêu chuẩn khoa học để chấm điểm Xuất sắc / Đạt giải.
* **Cách trả lời chuẩn xác:**
  > *"Dạ thưa Thầy/Cô, phần đánh giá ở Chương 4 của em được thiết kế chuẩn mực theo 2 trụ cột:*
  > 1. ***Đối chuẩn ngoại tuyến định lượng (Offline Benchmark trên 100.000 episodes):***
  >    - *Em so sánh mô hình MaskablePPO của mình với 3 phương pháp cơ sở (Baselines): **Fixed Linear** (lộ trình cố định theo sách), **Leitner System** (lặp lại ngắt quãng đơn giản) và **Rule-based heuristic**.*
  >    - *Tiến hành kiểm định giả thuyết thống kê **t-test độc lập**, chứng minh sự khác biệt có ý nghĩa thống kê với ngưỡng $p < 0.05$ trên các chỉ số: Số bước đạt thành thạo (Steps to Mastery), Độ duy trì tri thức (Retention rate) và Tỷ lệ học viên nản chí (Frustration rate).*
  > 2. ***Thử nghiệm người dùng thực tế (Pre-test vs Post-test):***
  >    - *Em tiến hành thử nghiệm trên nhóm sinh viên học thật, tính toán **Chỉ số Tăng trưởng Kiến thức Chuẩn hóa (Normalized Gain $g$)** theo công trình kinh điển của Hake (1998):*
  >      $$g = \frac{\text{Post-test} - \text{Pre-test}}{100 - \text{Pre-test}}$$
  >    - *Chỉ số $g$ này loại trừ hoàn toàn sai số về trình độ ban đầu của học viên, đem lại bằng chứng thực nghiệm khách quan nhất cho cuốn báo cáo."*

---

## NHÓM 6: CÁC CHI TIẾT CỤ THỂ TRONG 2 BẢN PHỤ LỤC

### ❓ Câu hỏi 9: "Trong Phụ lục 03, Thầy/Cô thấy em liệt kê rất nhiều tài liệu ban đầu từ MIT, CMU, ISO, PLOS ONE. Những tài liệu này có tra cứu được thực tế không hay chỉ ghi cho đẹp?"

* **Cách trả lời chuẩn xác:**
  > *"Dạ thưa Thầy/Cô, 100% tài liệu và số liệu ban đầu trong Phụ lục 03 em đều đã xác thực đường dẫn và mã định danh quốc tế:*
  > - *Các sách giáo trình đều có mã chuẩn ISBN (như sách Silberschatz của McGraw-Hill và Sutton & Barto của MIT Press).*
  > - *Các bài báo khoa học đều có mã định danh số học thuật DOI hoặc link Open Access toàn văn (như bài báo BKT trên Springer Nature, bài báo Ebbinghaus trên tạp chí PLOS ONE, bài báo Hake trên Thư viện số ComPADRE).*
  > - *Mọi công cụ kỹ thuật (`sql.js`, `sqlglot`, `gymnasium`, `sb3-contrib`) đều là các thư viện mã nguồn mở có kho GitHub hoạt động sôi nổi và tài liệu chính thức.*
  > *Em đã kiểm tra thử từng đường link trên trình duyệt, các Thầy/Cô có thể nhấp vào tra cứu và kiểm chứng tức thì ạ."*

### ❓ Câu hỏi 10: "Em định hướng sản phẩm sau khi bảo vệ xong có thể đưa vào phục vụ sinh viên trong Khoa mình học tập thử nghiệm được không?"

* **Cách trả lời chuẩn xác:**
  > *"Dạ hoàn toàn được ạ! Đây chính là tâm huyết của em khi thực hiện đề tài. Hệ thống được đóng gói Docker toàn phần, cấu hình CI/CD và triển khai thực tế trên môi trường Production với tên miền và SSL bảo mật. Em đã tối ưu hóa kiến trúc client-side SQLite WASM để chi phí vận hành máy chủ gần như bằng 0 (chỉ cần 1 VPS nhỏ là đủ cho hàng trăm sinh viên Khoa mình cùng làm bài). Em rất mong sau khi hoàn thành sẽ được Bộ môn và Thầy/Cô cho phép triển khai thử nghiệm làm công cụ hỗ trợ thực hành cho học phần Cơ sở dữ liệu của Khoa mình ạ."*

---

## 💡 5 NGUYÊN TẮC VÀNG VỀ PHONG THÁI KHI GẶP THẦY / CÔ

1. **Phong thái tự tin nhưng cầu thị:** Giữ thái độ tôn trọng, lắng nghe góp ý của Thầy/Cô; nếu Thầy/Cô yêu cầu bổ sung hoặc giới hạn bớt một chi tiết nào đó, hãy vui vẻ ghi chép và cảm ơn Thầy/Cô vì đã giúp định hướng đề tài chặt chẽ hơn.
2. **Nói bằng số liệu và căn cứ học thuật:** Thay vì nói *"em nghĩ thuật toán này tốt hơn"*, hãy nói *"theo nghiên cứu của Corbett & Anderson và kiểm định t-test với p < 0.05..."*.
3. **Luôn nhấn mạnh ranh giới Not-Doing:** Nếu Thầy/Cô gợi ý thêm tính năng quá lớn (ví dụ: làm app mobile, làm mạng xã hội trao đổi, tích hợp Oracle/SQL Server), hãy khéo léo xin phép: *"Dạ ý tưởng của Thầy/Cô rất hay, em xin phép ghi nhận vào phần 'Hướng phát triển tương lai' trong Kết luận, còn trong phạm vi 15 tuần của đồ án em xin tập trung giải quyết xuất sắc lõi bài toán Adaptive Learning cho SQL để đảm bảo chất lượng cao nhất ạ"*.
4. **Chuẩn bị sẵn file:** Mang theo laptop đã mở sẵn 2 file `PHU LUC 02_De cuong DATN.md` và `PHU LUC 03_Nhiem vu do an.md` (hoặc bản in đẹp nếu Thầy/Cô yêu cầu xem bản cứng).
5. **Bộ từ khóa học thuật "đắt giá" nên dùng:** *Quá trình Quyết định Markov (MDP), Vùng phát triển gần (ZPD), Two-Stage Recommender, Bayesian Knowledge Tracing (BKT), SQLite WebAssembly (WASM), Phân tích cú pháp AST (`sqlglot`), Normalized Gain $g$ của Hake, Anti-Ghost Mastery Telemetry.*
