# Implementation Plan: Ascend LMS - "Rise above limits"

## Overview
Dự án LMS Cá nhân hóa với SQL (Đồ án 15 tuần). Kế hoạch đã được **điều chỉnh lại (Re-planned)** tuân thủ triệt để triết lý **Vertical Slicing** (cắt dọc tính năng) theo `planning-and-task-breakdown` skill, thay vì cắt ngang (Horizontal) như trước. Các rủi ro kỹ thuật (Phase 1) và Database (Task 5) đã hoàn tất. Phần còn lại sẽ được build end-to-end từng luồng. Kế hoạch bám sát 100% vào 13 bản đặc tả `.onion`.

## Architecture Decisions
- **Vertical Slicing (MỚI):** Nhóm các module Frontend, Backend, AI lại thành từng cụm tính năng hoàn chỉnh có thể test end-to-end ngay (Onboarding -> Workspace -> AI Recommender -> Anti-Cheat).
- **Thực thi SQL Client-Side:** Tránh hoàn toàn việc gọi Backend để chấm kết quả SQL.
- **Tránh PyTorch trên Backend:** Huấn luyện RL offline, export ra `.onnx` và load bằng `onnxruntime`.

## Task List

### Phase 1: Triệt Tiêu Rủi Ro (High-Risk Spikes) - [HOÀN THÀNH]
- [x] Task 1-4: Base Project, Docker, CI/CD, Spike WASM, Spike ONNX.
- [x] Task 5: Database Schema & Alembic Migrations.

### Phase 2: Onboarding & Knowledge Graph (Vertical Slice 1)
- [ ] Task 6: Knowledge Graph Parser & DAG Engine (Backend)
- [ ] Task 7: Diagnostic Propagation Algorithm (Backend)
- [ ] Task 8: Onboarding API & Guest Auth (Backend)
- [ ] Task 9: Onboarding UI & Visual Skill Tree (Frontend)

### Phase 3: Core Workspace & SQL Engine (Vertical Slice 2)
- [ ] Task 10: SQLite WASM Worker & IndexedDB Sync (Frontend)
- [ ] Task 11: SQL Workspace UI & Monaco Editor (Frontend)
- [ ] Task 12: AST & EXPLAIN Grader (Backend)
- [ ] Task 13: Submission API & Integration (Backend/Frontend)

### Phase 4: AI Recommender Engine (Vertical Slice 3)
- [ ] Task 14: Cognitive Simulator Gym Env (Backend)
- [ ] Task 15: RL Training & ONNX Export (Backend)
- [ ] Task 16: Recommendation API & XAI Rationale (Backend)
- [ ] Task 17: XAI UI & Progressive Hints Drawer (Frontend)

### Phase 5: Anti-Cheat & Telemetry (Vertical Slice 4)
- [ ] Task 18: Telemetry Collection & Paste Detection (Frontend/Backend)
- [ ] Task 19: Spot-Check Guard API & UI Lock (Frontend/Backend)

### Phase 6: Polish & Dashboard
- [ ] Task 20: Admin Dashboard (Heatmap & Model Drift)
- [ ] Task 21: Mock Technical Interview Mode
- [ ] Task 22: Performance LCP & Final Deploy

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Trễ deadline do UI quá phức tạp | Medium | Dùng sẵn `shadcn/ui` Tailwind để tránh sa đà vào CSS. |
| RL Training không hội tụ | High | Dùng MaskablePPO, action masking 162 actions chặn invalid moves. |
| Gian lận vượt rào Spot-Check | Medium | Spot-Check UI dùng z-index cao nhất, chặn tắt modal. |
