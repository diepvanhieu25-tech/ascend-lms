# Implementation Plan: Ascend LMS - "Rise above limits"

## Overview
Dự án LMS Cá nhân hóa với SQL (Đồ án 15 tuần). Việc lập kế hoạch tuân thủ triết lý Vertical Slicing và Fail-fast: Xử lý triệt để các rủi ro kiến trúc lớn nhất ngay từ Tuần 1, sau đó phát triển dần các API và UI. Kế hoạch này bám sát 100% vào 8 bản đặc tả (Spec) của dự án.

## Architecture Decisions
- **Tránh PyTorch trên Backend:** Huấn luyện RL offline, export ra `.onnx` và load bằng `onnxruntime` trên FastAPI để đáp ứng RAM 4GB của VPS.
- **Thực thi SQL Client-Side:** Tránh hoàn toàn việc gọi Backend để chấm kết quả SQL.
- **Vertical Slicing:** Build tính năng từ Data Layer -> API -> Frontend UI để đảm bảo không bị nghẽn (Block) lẫn nhau.
- **Micro-Containerized Monolith:** Triển khai qua Docker Compose (Caddy + FastAPI + NextJS) với CI/CD tự động 5 cổng.

## Task List

### Phase 1: Triệt Tiêu Rủi Ro (High-Risk Spikes) - Tuần 1-2
- [x] Task 1: Khởi tạo Base Project, Git Workflow (Husky/Lint-staged) & `CONSTRAINTS.md`.
- [x] Task 2: Thiết lập Docker Compose & luồng CI/CD GitHub Actions (Quality Gates).
- [x] Task 3: Spike/PoC - Chạy `sql.js` bên trong Web Worker của React.
- [x] Task 4: Spike/PoC - API FastAPI load file `.onnx` và trả về kết quả Inference.

### Phase 2: Logic Lõi & Chấm Điểm (Tuần 3-5)
- [ ] Task 5: Dựng Database Schema & Alembic (Đầy đủ các bảng Telemetry, Diagnostic, SpotCheck).
- [ ] Task 6: Module parse đồ thị DAG & Thuật toán lan truyền tiên quyết ($s_0$).
- [ ] Task 7: Trình chấm điểm AST (`sqlglot`) và `EXPLAIN QUERY PLAN`.

### Phase 3: AI Simulator & Training (Tuần 6-9)
- [ ] Task 8: Lập trình môi trường Gymnasium (Toán BKT & Ebbinghaus).
- [ ] Task 9: Code Action Masking & Reward Function.
- [ ] Task 10: Train mô hình MaskablePPO & Export ra ONNX.

### Phase 4: LMS Backend API (Tuần 10-11)
- [ ] Task 11: CRUD Auth (Guest/Register/Login/Convert).
- [ ] Task 12: API Khuyến nghị, Chấm điểm (BKT Updater) & XAI Rationale.
- [ ] Task 13: API Onboarding Diagnostic (Adaptive Placement Test & Calibration).
- [ ] Task 14: Telemetry Background Tasks, Spot-Check Trigger & Socratic Hint.

### Phase 5: Next.js UI (Tuần 12-14)
- [ ] Task 15: Vẽ Skill Tree bằng `@xyflow/react`.
- [ ] Task 16: Editor Code bằng `Monaco` & Progressive Hints.
- [ ] Task 17: Màn hình Onboarding Placement Test & Dashboard học tập.
- [ ] Task 18: Tích hợp Telemetry Middleware & Modal Spot-Check 30s.
- [ ] Task 19: Admin Dashboard (Heatmap, Model Drift) & Mock Interview Mode.

### Phase 6: Benchmark & Báo cáo (Tuần 15)
- [ ] Task 20: Tối ưu LCP, Load test API & Triển khai Zero-Downtime lên VPS.
- [ ] Task 21: Cập nhật HLD, LLD & Finalize Báo cáo Word.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| ONNX Inference quá chậm ($>100$ms) | High | Đã đưa vào Phase 1 làm sớm. Khắc phục: Ép Float16 quantization. |
| Web Worker ăn RAM gây crash | High | Đã đưa vào Phase 1. Khắc phục: Ràng buộc Seed Data dưới 100 dòng. |
| CI/CD Pipeline lỗi gây nghẽn Merge | Medium | Xây dựng ngay từ Task 2, mock các test cases cơ bản để thông luồng. |
| Trễ deadline do UI quá phức tạp | Medium | Dùng sẵn `shadcn/ui` Tailwind để tránh sa đà vào CSS. |
