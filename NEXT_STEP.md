# Hướng Dẫn Tiếp Tục Phiên Làm Việc (Quick Resume Guide)

> **Dành cho:** Phiên làm việc tiếp theo  
> **Dự án:** Ascend LMS - Adaptive Learning SQL (Reinforcement Learning)

---

## 📋 Câu Lệnh Copy - Paste Để Khởi Động Phiên Mới

Khi mở phiên chat mới với Antigravity, bạn chỉ cần copy nguyên văn dòng dưới đây và gửi vào ô chat:

```text
@[SESSION_HANDOFF.md] Đọc file handoff để nắm toàn bộ ngữ cảnh dự án, các bài học kinh nghiệm cần tránh, và triển khai Task 6: Module Knowledge Graph & Lan truyền DAG theo đúng quy trình Git branch.
```

---

## 📌 Tóm Tắt Nhanh Điểm Dừng Hiện Tại (Checkpoint)

* **Trạng thái:** HOÀN THÀNH PHASE 1 & TASK 5 (PHASE 2).
  - 4 Docker containers (`caddy`, `backend`, `frontend`, `postgres`) đang chạy và `healthy`.
  - Database schema 10 bảng đã tạo lập bằng Alembic migration `9df090091b69`.
  - Hệ thống CI/CD GitHub Actions 5 Quality Gates đã vượt qua 100% (Run ID: `34342493670`).
  - Toàn bộ test suite (14 backend tests, frontend vitest) đều pass, coverage backend 97%.
* **Branch hiện tại:** `feat/task-5-db-schema` (đã merge đầy đủ vào `main`, working tree sạch).

---

## ⚠️ 3 Kỷ Luật Kỹ Thuật Bắt Buộc Tuân Thủ

1. **Tuyệt đối không hack code / bypass test:** Không tạo mock hay fixture tạo schema (`Base.metadata.create_all`) để lách luật. Mọi kiểm thử phải chạy trên schema di trú thật từ Alembic.
2. **Không tự ý báo hoàn thành khi chưa kiểm thử thực nghiệm (Zero Premature Completion):** Phải tự chạy container, curl API, kiểm tra UI thực tế trước khi xác nhận xong task.
3. **Kỷ luật Git Workflow:** Luôn tạo nhánh `feat/task-6-knowledge-graph`, cấm commit trực tiếp trên `main`.

---

## 🎯 Mục Tiêu Của Phiên Tiếp Theo: Task 6 (Module Knowledge Graph & Lan Truyền DAG)

1. Tạo nhánh: `git checkout -b feat/task-6-knowledge-graph`.
2. Tham chiếu đặc tả: [`.onion/SPEC-knowledge-graph.md`](file:///home/diepvanhieu/workspace/ascend-lms/.onion/SPEC-knowledge-graph.md).
3. Tạo file tri thức chuẩn `backend/app/knowledge/knowledge_graph.json` định nghĩa 18 SQL concepts, quan hệ tiên quyết và Bloom level.
4. Lập trình module DAG (`KnowledgeGraphManager`), kiểm tra chu trình (Cycle Detection), Topological Sort.
5. Lập trình thuật toán **Prerequisite Propagation** tính vector $s_0 \in [0, 1]^{18}$ từ kết quả Diagnostic Assessment (giải quyết bài toán Cold-Start).
6. Viết bộ unit test kiểm thử 100% các nhánh lan truyền tiên quyết.
7. Chạy full CI gates local (Ruff, Mypy, Pytest) -> commit -> merge `main` -> verify GitHub Actions.
