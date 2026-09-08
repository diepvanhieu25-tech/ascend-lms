# SPEC: Quy Trình Quản Lý Mã Nguồn (Git Workflow & Versioning)

## 1. Mục Tiêu (Intent)
Thiết lập kỷ luật phiên bản (Version Control Discipline) cho dự án cá nhân, đảm bảo lịch sử mã nguồn (Git History) đóng vai trò như một tài liệu sống (Living Documentation). Hỗ trợ tối đa việc gỡ lỗi, báo cáo bảo vệ đồ án, và khả năng quay lui khẩn cấp (Rollback) mà không bị mất dấu.

## 2. Chiến Lược Phân Nhánh: Trunk-Based Development
Do đây là dự án solo 15 tuần với tốc độ cao, tuyệt đối **KHÔNG** sử dụng mô hình GitFlow cồng kềnh. Chúng ta áp dụng **Trunk-Based Development**:

- Trục chính `main` luôn trong trạng thái có thể deploy (Always deployable).
- Mọi tính năng, lỗi đều được làm trên **Short-lived Feature Branches** (Nhánh ngắn hạn, tuổi thọ tối đa 1-2 ngày) và merge lại `main` ngay.
- Nếu tính năng chưa hoàn thiện nhưng cần merge để tránh "thiu" code (Merge conflict), ẩn nó sau **Feature Flags** trên UI, chứ không ngâm nhánh.

Quy ước đặt tên nhánh:
- `feat/ten-chuc-nang` (VD: `feat/wasm-worker`)
- `fix/ten-loi` (VD: `fix/deadlock-rl-env`)
- `chore/ten-cau-hinh` (VD: `chore/setup-husky`)

## 3. Atomic Commits & Conventional Commits
Mỗi commit chỉ chứa **MỘT** thay đổi logic duy nhất. Cấm dồn code nguyên ngày vào 1 commit khổng lồ (Giant Commit) với thông báo `"Update code"`. 

Áp dụng chuẩn **Conventional Commits**:
```text
<type>: <Tiêu đề ngắn gọn mô tả thay đổi>

<Nội dung giải thích TẠI SAO (Why), không phải LÀM GÌ (What) vì diff đã thể hiện>
```

Các Types bắt buộc:
- `feat:` Thêm tính năng mới (Có thể có break-change báo qua dấu `!`).
- `fix:` Sửa lỗi.
- `refactor:` Tái cấu trúc (Không thay đổi tính năng, chỉ đổi cách viết).
- `test:` Thêm/sửa unit tests.
- `chore:` Thay đổi cấu hình (lint, tool, package).
- `docs:` Cập nhật tài liệu (như file `.md`).

**Ví dụ một commit xuất sắc:**
```text
feat: Tích hợp cơ chế Hydration cho SQLite WASM

Sửa lỗi mất dữ liệu khi học viên bấm F5. State hiện tại được 
lưu vào localStorage và gửi qua postMessage lúc init.
```

## 4. Branch Hygiene (Vệ sinh mã nguồn) & Pre-commit
- Không bao giờ mix (trộn) việc Fix Bug và Refactor vào cùng 1 commit/nhánh.
- Không commit các file tự động sinh, file local (`.env`, `node_modules/`, `__pycache__/`, `dist/`). File `.gitignore` là bắt buộc từ phút đầu tiên.
- **Vệ sinh tự động (Pre-commit Hook):** Tích hợp `husky` và `lint-staged`. Trước khi `git commit`, hệ thống tự động:
  1. Xóa khoảng trắng thừa (Prettier).
  2. Báo lỗi Lint (ESLint/Ruff).
  3. Báo lỗi kiểu (tsc/mypy).
  4. Quét rò rỉ (Gitleaks).
  *(Phải pass hết mới cho phép commit).*

## 5. Đánh Dấu Phiên Bản (Semantic Versioning & Tags)
- Sử dụng chuẩn `MAJOR.MINOR.PATCH` (VD: `v1.0.0`).
- Khi báo cáo giữa kỳ (Mid-term), đánh tag Release (VD: `v0.5.0-beta`).
- Duy trì 1 file `CHANGELOG.md` viết cho người dùng đọc (phân nhóm theo Added, Fixed, Deprecated), không phải là nơi dump (đổ đống) lại lịch sử commit.
