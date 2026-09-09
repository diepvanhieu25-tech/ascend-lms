# Hướng Dẫn Tiếp Tục Phiên Làm Việc (Quick Resume Guide)

> **Dành cho:** Ngày làm việc tiếp theo  
> **Dự án:** Adaptive Learning SQL (Reinforcement Learning)

---

## 📋 Câu Lệnh Copy - Paste Cho Phiên Mới

Khi mở một phiên chat mới với Antigravity, bạn chỉ cần copy nguyên văn dòng dưới đây và gửi vào ô chat:

```text
@[SESSION_HANDOFF.md] Đọc file handoff để nắm toàn bộ ngữ cảnh dự án và xem file tasks/todo.md để thực thi Task tiếp theo.
```

---

## 📌 Tóm Tắt Nhanh Điểm Dừng Hiện Tại (Checkpoint)

* **Trạng thái:** HOÀN THIỆN ĐẶC TẢ & KẾ HOẠCH. Hệ thống đã có trọn bộ tài liệu Spec (bao gồm cả CI/CD, Git Workflow), ràng buộc chất lượng `CONSTRAINTS.md`, và danh sách công việc rõ ràng tại `tasks/todo.md`. Repository local đã được link với remote Github (`https://github.com/diepvanhieu25-tech/ascend-lms.git`).
* **Tài liệu cốt lõi đã hoàn thiện chuẩn xác 100%:**
  - File điều phối tổng & Handoff: [`SESSION_HANDOFF.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/SESSION_HANDOFF.md)
  - Hồ sơ Đề cương ĐATN chuẩn form: [`PHU LUC 02_De cuong DATN.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/PHU%20LUC%2002_De%20cuong%20DATN.md)
  - Hồ sơ Nhiệm vụ đồ án chuẩn form: [`PHU LUC 03_Nhiem vu do an.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/PHU%20LUC%2003_Nhiem%20vu%20do%20an.md)
  - Phân tích Hệ thống, C4, ERD, DevOps & Năng lực chịu tải: [`.onion/SYSTEM-ANALYSIS-ARCHITECTURE.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/SYSTEM-ANALYSIS-ARCHITECTURE.md)
  - Hợp đồng API RESTful v1: [`.onion/API-CONTRACTS.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/API-CONTRACTS.md)
  - Bản đồ năng lực: [`.onion/capability-map.md`](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/capability-map.md)
  - Trọn bộ 8 bản đặc tả kỹ thuật module & hạ tầng (`.onion/SPEC-*.md`).
  - Ràng buộc dự án: `CONSTRAINTS.md`.
  - Kế hoạch & Kanban: `tasks/plan.md`, `tasks/todo.md`.

---

## 🎯 Mục Tiêu Của Phiên Tiếp Theo: Thực Thi Phase 1 (High-Risk Spikes)

1. **Khởi động mã nguồn:** Thực thi **Task 1** trong `tasks/todo.md` (Setup Base Project, Git Workflow, Linter/Husky).
2. **PoC Web Worker SQL:** Thực thi **Task 2** để triệt tiêu rủi ro Frontend block UI.
3. **PoC ONNX Inference:** Thực thi **Task 3** để đảm bảo Backend chạy mô hình nhanh, nhẹ.


