# Handoff Ngữ Cảnh Dự Án (Session Handoff & Quick Resume)

> **Mục đích:** File này đóng gói toàn bộ ngữ cảnh dự án Ascend LMS sau khi chốt các quyết định kiến trúc cốt lõi (Holland RIASEC, Scenario-based WASM...). Để đảm bảo phiên làm việc tiếp theo có thể tiếp tục ngay lập tức.
> **Thời gian cập nhật:** 2026-09-17 | **Trạng thái:** Tạm ngưng. Chờ User kiểm tra lại Bản tóm tắt ý tưởng dự án. Tạm thời CHƯA viết SPEC.

---

## 1. Tóm Tắt Ý Tưởng Cốt Lõi (Đã Chốt)

**Ascend LMS** là Hệ thống Quản lý Học tập Động (Dynamic IT Career Path LMS). 
Triết lý: Không dạy cú pháp chay, không giải đố thuật toán (No Leetcode style). Hệ thống đánh giá đúng tố chất và rèn luyện kỹ năng giải quyết bài toán thực tế của doanh nghiệp.

### Luồng Trải Nghiệm (User Journey)
1. **Khám phá Tố chất (Profiling):** Đầu vào bắt buộc sử dụng **Mô hình tâm lý Holland (RIASEC)** kết hợp kiểm tra **Tư duy Logic** để xuất ra "Hồ sơ năng lực" của User.
2. **Mai mối Lộ trình (AI/RL Macro Layer):** Dựa vào Hồ sơ năng lực, AI (Reinforcement Learning) đề xuất các Lộ trình nghề nghiệp (IT Paths) phù hợp nhất.
3. **Thực chiến Dự án (Micro Layer & Scenario-based WASM):** Môn học quản lý bằng sơ đồ DAG tĩnh (qua bài trước mở bài sau). Thực hành trên **WASM Sandbox** giả lập dự án thực tế (Troubleshooting, Thêm Feature, Xử lý Business Logic). Tự động chấm điểm bằng Integration Test của hệ thống, KHÔNG dùng AI chấm bài.
4. **Lưới an toàn (Fallback):** Nếu User rớt thảm hại bài Diagnostic Test đầu môn, hoặc kẹt quá lâu ở một node, môn học sẽ bị hủy (Aborted). Tín hiệu bắn về tầng Macro để RL gợi ý "Môn tiền đề" đắp nền kiến thức.

### Kiến Trúc 3 Trụ Cột
1. **CMS Core (Admin Power):** Nơi Admin thiết kế bài test Holland, tạo Lộ trình, vẽ DAG, soạn Test case WASM. Quản lý Versioning: Patch update (sửa lỗi trực tiếp, không mất tiến độ) & Major update (tạo version mới cho DAG thay đổi cấu trúc).
2. **AI/RL Navigator (Macro):** AI quản lý điều hướng lộ trình vĩ mô, dựa trên tín hiệu pass/fail/aborted từ môn học để tối ưu hành trình học của User.
3. **Strict DAG Engine (Micro):** Môi trường môn học tĩnh, kỷ luật, đóng gói hoàn chỉnh bằng luật lệ khắt khe.

---

## 2. Giải Quyết 4 Vấn Đề Kiến Trúc (Đã Chốt)
- **Macro ↔ Micro:** RL nhận tín hiệu (VD: Môn học bị Aborted) để điều hướng ở tầng vĩ mô. Sự hỗ trợ bên trong bài học do DAG/WASM tự lo liệu bằng các "Fallback nodes".
- **Diagnostic Test & Fallback:** Yếu quá thì trả về RL (trạng thái Aborted) để thêm môn tiền đề.
- **Giới hạn quyền lực RL:** RL chỉ chọn lộ trình có sẵn do Admin tạo, dựa vào dữ liệu từ bài test Holland/Logic ban đầu.
- **Versioning:** Hỗ trợ Patch (sửa lỗi đè trực tiếp) và Major (Tạo version DAG mới, user có quyền chọn Reset để theo bản mới).

---

## 3. Nhiệm Vụ Của Phiên Làm Việc Tiếp Theo

- **Tiếp tục: KIỂM TRA LẠI Ý TƯỞNG.** User cần thời gian review lại kỹ lưỡng bản tóm tắt ý tưởng.
- **Chưa chuyển sang bước viết SPEC.**

---

## 4. Hướng Dẫn Kích Hoạt Phiên Ngày Mai (Quick Resume Prompt)

Khi bạn quay lại vào ngày mai, hãy copy/paste nguyên câu lệnh dưới đây cho AI để lấy lại 100% trí nhớ:

```text
@[SESSION_HANDOFF.md] Đọc kỹ file handoff này để lấy lại ngữ cảnh dự án Ascend LMS. Hôm qua chúng ta đã dừng lại ở bước kiểm tra ý tưởng dự án. Tôi đã kiểm tra xong, dưới đây là nhận xét/chỉnh sửa của tôi cho bản tóm tắt (hoặc: Tôi đồng ý toàn bộ bản tóm tắt). Hãy xử lý và cho tôi biết bước tiếp theo.
```
