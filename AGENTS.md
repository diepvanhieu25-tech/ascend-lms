# AGENTS.md

## 🧅 Hướng Dẫn Sử Dụng Onion Agents (Dành cho AI & Lập trình viên)

File này đóng vai trò là "Hiến pháp" (Master Constitution) quy định cách thức giao tiếp và kích hoạt các quy trình chuẩn kỹ thuật phần mềm của hệ sinh thái **Onion Agents** trong dự án này. 

Do Antigravity CLI hiện không hỗ trợ trực tiếp việc tạo custom slash commands (như `/build`, `/spec`), chúng ta sẽ sử dụng phương pháp **Gắn thẻ Kỹ năng (Skill Tagging)** trong câu lệnh (prompt) để thay thế.

---

## 1. Cú pháp kích hoạt bằng Prompt

Thay vì dùng slash command, bạn hãy yêu cầu AI bằng cách nhắc đến tên của skill hoặc quy trình muốn thực hiện. AI khi đọc file này sẽ tự động hiểu và nạp đúng quy trình đó để thực thi.

**Cú pháp khuyến nghị:**
> *"Hãy [yêu cầu công việc], tuân thủ quy trình của skill `[tên-skill]`."*

### Các ví dụ thực tế (Thay thế Slash Commands):

| Lệnh Command cũ | Cách gõ Prompt tương ứng (Skill Tagging) | Chức năng |
| :--- | :--- | :--- |
| `/spec` | *"Hãy phân tích yêu cầu này và viết đặc tả theo skill `spec-driven-development`."* | Viết tài liệu đặc tả (SPEC) chi tiết trước khi code. |
| `/planning` | *"Hãy chia nhỏ công việc của tính năng này dựa theo skill `planning-and-task-breakdown`."* | Lên kế hoạch chi tiết thành các task nhỏ (tasks/plan.md). |
| `/build` | *"Hãy code task tiếp theo, áp dụng `incremental-implementation` và `test-driven-development`."* | Code từng phần nhỏ gọn, an toàn và có test bảo vệ. |
| `/test` | *"Hãy viết test cho tính năng/bug này theo chuẩn `test-driven-development`."* | Đảm bảo mọi tính năng/bug fix đều tuân thủ Prove-It pattern. |
| `/constraints`| *"Hãy rà soát và thiết lập tiêu chuẩn dự án qua skill `constraint-driven-development`."* | Thiết lập bộ luật `CONSTRAINTS.md` (chất lượng mã nguồn). |
| `/review` | *"Hãy audit lại file này bằng cách đóng vai `code-reviewer`."* | Review code toàn diện 5 khía cạnh (5-axis audit). |
| `/ship` | *"Đã code xong, hãy chạy quy trình `shipping-and-launch` để kiểm tra trước khi release."* | Rà soát checklist cuối cùng trước khi đưa lên production. |
| *(Tự động)* | *"Hãy đánh giá yêu cầu sau và tự quyết định dùng skill nào phù hợp qua `using-onion-skills`."* | Để AI tự động phân tích và chọn quy trình Onion tối ưu nhất. |

---

## 2. Quy Tắc Bắt Buộc Dành Cho AI (Agent Constitution)

Khi được yêu cầu làm việc trong dự án này, AI Agent **BẮT BUỘC** phải tuân thủ các nguyên tắc sau:

1. **Skill-First (Ưu tiên Kỹ năng):** Nếu yêu cầu của user khớp với một trong các skill của Onion, AI phải tự động nạp và thực thi toàn bộ quy trình của skill đó trước khi viết dòng code đầu tiên.
2. **Không Nhảy Cóc (No Invisible Leaps):** Tuyệt đối không viết mã nguồn (code) ngay lập tức nếu chưa có các tài liệu tiền đề rõ ràng (như Spec -> Plan -> TDD).
3. **Luật Beyonce (Test-Driven):** Mọi sự thay đổi về behavior (sửa lỗi, thêm tính năng) đều phải có một failing test (test đỏ) tương ứng được viết và chứng minh trước khi sửa code thực tế.
4. **Không Thỏa Hiệp:** Luôn đọc và tôn trọng file `CONSTRAINTS.md` (nếu có). Không được phép bypass các bài test, lạm dụng `@ts-ignore` hoặc hạ thấp tiêu chuẩn dự án chỉ để hoàn thành task cho nhanh.

---

## 3. Bản Đồ Kỹ Năng (Intent -> Skill Mapping)

Nếu user không chỉ định rõ skill trong câu lệnh, AI hãy dùng bản đồ sau để tự động ánh xạ và quyết định:

- Gặp Idea/Yêu cầu mơ hồ -> gọi `interview-me`
- Cần viết API/Interfaces -> gọi `api-and-interface-design`
- Xây dựng UI/Frontend -> gọi `frontend-ui-engineering`
- Tối ưu hóa hiệu năng/Tốc độ -> gọi `performance-optimization`
- Refactor code cho dễ đọc hơn -> gọi `code-simplification`
- Cần đánh giá bảo mật, check lỗ hổng -> gọi `security-and-hardening`
- Debug lỗi khó hiểu/Lỗi production -> gọi `debugging-and-error-recovery`
- Review kiến trúc, cập nhật tài liệu -> gọi `documentation-and-adrs`
- Cấu trúc Git, tạo commit -> gọi `git-workflow-and-versioning`

> **Lưu ý cho AI:** Hãy luôn rà soát các tài liệu hiện có trong dự án (như `SPEC.md`, `tasks/plan.md`, `CONSTRAINTS.md`) trước khi hỏi người dùng những câu hỏi đã có sẵn câu trả lời.

---

## 4. Công Thức Viết Prompt "Đúng Trọng Tâm"

Để AI hiểu ngay lập tức và không làm sai ý, hãy cấu trúc câu lệnh của bạn theo công thức 3 phần sau:
`[Hành động cụ thể] + [Ràng buộc/Ngữ cảnh] + [Gọi Skill Onion]`

**Ví dụ:**
- ❌ **Prompt Kém:** *"Làm cho tôi tính năng đăng nhập."*
- ✅ **Prompt Chuẩn:** *"Hãy tạo API đăng nhập bằng JWT cho user. Đảm bảo validate dữ liệu đầu vào. Hãy áp dụng skill `api-and-interface-design` để thiết kế interface và dùng `test-driven-development` để viết test trước khi code."*

**Ví dụ khác:**
- ❌ **Prompt Kém:** *"Giao diện bị giật, sửa đi."*
- ✅ **Prompt Chuẩn:** *"Trang Dashboard đang bị render lại quá nhiều lần. Hãy dùng skill `performance-optimization` để rà soát lỗi N+1 rendering và sửa nó."*

---

## 5. Danh Sách 25 Kỹ Năng (Skills) Của Onion Agents

Dưới đây là toàn bộ các kỹ năng AI đã được trang bị, chia theo các giai đoạn phát triển phần mềm:

### Giai đoạn Khởi tạo & Phân tích (Define & Plan)
1. **`using-onion-skills`**: Kỹ năng gốc, để AI tự động khám phá và điều phối các kỹ năng khác sao cho phù hợp.
2. **`interview-me`**: Đóng vai trò phỏng vấn viên, liên tục hỏi bạn từng câu một để làm rõ một ý tưởng còn đang rất mơ hồ.
3. **`idea-refine`**: Tinh chỉnh các ý tưởng thô sơ thành các khái niệm rõ ràng, khả thi.
4. **`spec-driven-development`**: Phân tích yêu cầu và viết thành tài liệu đặc tả kỹ thuật (`SPEC.md`) rõ ràng trước khi code.
5. **`constraint-driven-development`**: Thiết lập bộ tiêu chuẩn chất lượng mã nguồn (lưu vào `CONSTRAINTS.md`) và nghiêm cấm AI tự ý hạ chuẩn.
6. **`planning-and-task-breakdown`**: Chia nhỏ một tính năng lớn thành các task nhỏ tuần tự (lưu vào `tasks/plan.md`).

### Giai đoạn Phát triển (Build & Implement)
7. **`incremental-implementation`**: Triển khai code theo từng phần nhỏ, đảm bảo an toàn, chia nhỏ commit dễ dàng rollback.
8. **`test-driven-development`**: Bắt buộc viết bài test (báo lỗi đỏ) trước, sau đó mới viết code để sửa cho test pass (xanh).
9. **`api-and-interface-design`**: Thiết kế giao tiếp API, boundary giữa Frontend/Backend đảm bảo chuẩn mực.
10. **`frontend-ui-engineering`**: Code UI/UX cho frontend chuẩn Production, responsive và đạt chuẩn accessibility (WCAG).
11. **`source-driven-development`**: Dựa vào tài liệu chính thức của thư viện/framework để code thay vì dùng các pattern cũ/lỗi thời.
12. **`doubt-driven-development`**: Chủ động hoài nghi và audit chéo lẫn nhau đối với các quyết định kỹ thuật rủi ro cao.
13. **`context-engineering`**: Tối ưu hóa việc đọc ngữ cảnh, giúp AI duy trì độ chính xác khi session làm việc kéo dài.

### Giai đoạn Kiểm thử & Gỡ lỗi (Verify & Debug)
14. **`debugging-and-error-recovery`**: Tìm lỗi một cách có hệ thống, truy vết nguyên nhân gốc rễ (root-cause) thay vì đoán mò.
15. **`browser-testing-with-devtools`**: Kiểm thử trực tiếp trên trình duyệt thông qua Chrome DevTools để bắt lỗi DOM, network, console.

### Giai đoạn Đánh giá chất lượng (Review & Audit)
16. **`code-review-and-quality`**: Review code 5 chiều (đúng đắn, dễ đọc, kiến trúc, bảo mật, hiệu năng) trước khi merge.
17. **`code-simplification`**: Đơn giản hóa các đoạn code phức tạp, khó đọc mà không làm thay đổi logic (behavior).
18. **`security-and-hardening`**: Quét và phòng thủ các lỗ hổng bảo mật (OWASP), xác thực, phân quyền.
19. **`performance-optimization`**: Tối ưu hóa hiệu năng, cải thiện tốc độ tải trang, sửa lỗi N+1 queries.

### Giai đoạn Triển khai & Quản lý vòng đời (Ship & Maintain)
20. **`git-workflow-and-versioning`**: Quản lý lịch sử commit, chia nhánh, versioning chuẩn mực.
21. **`ci-cd-and-automation`**: Thiết lập luồng Automation, CI/CD pipeline tự động.
22. **`deprecation-and-migration`**: Xử lý an toàn việc chuyển đổi dữ liệu, loại bỏ code cũ (zombie code) mà không gây gián đoạn.
23. **`documentation-and-adrs`**: Ghi chép tài liệu kỹ thuật, lưu trữ các quyết định kiến trúc (Architecture Decision Records).
24. **`observability-and-instrumentation`**: Gắn telemetry, logs, metrics để giám sát hệ thống trên Production.
25. **`shipping-and-launch`**: Rà soát checklist tổng thể cuối cùng trước khi đưa tính năng lên môi trường Production.
