# Constraints (Hợp đồng Chất lượng Dự án)

Last reviewed: 2026-09-08 by @diepvanhieu

## Floor (Luôn luôn thực thi, không cần setup phức tạp)

- **Không dùng comment ẩn lỗi:** Tuyệt đối cấm sử dụng `@ts-ignore`, `eslint-disable`, `# noqa`, `# type: ignore`. Nếu linter/compiler báo lỗi, nhiệm vụ của chúng ta là sửa lỗi đó, không phải giấu nó đi.
- **Không có code "rỗng":** Cấm để sót các khối `try...catch {}` nuốt lỗi mà không log, các hàm rỗng `pass`, hoặc ném `throw new Error("Not implemented")` trong code đã merge.
- **Không gian lận Test:** Không được phép dùng `.skip` hoặc tự ý xóa Unit Test để cho thanh CI xanh. Nếu cần skip, phải có comment giải thích lý do cụ thể.
- **Không lộ Secret:** Tuyệt đối không hardcode DB password, JWT Secret hay API keys vào source code.
- **Tính bất khả xâm phạm:** File `CONSTRAINTS.md` này không bao giờ được phép chỉnh sửa nới lỏng (weaken) chỉ để cố vượt qua lỗi khi build.

## Enforced with numbers (Các ràng buộc chặn cứng bằng con số)

| Dimension | Rule / Threshold | Checked by | Runs at |
|-----------|------|-----------|---------|
| **Type Safety (FE)** | 0 lỗi TypeScript | `npm run type-check` (tsc) | every edit (`Check:fast` < 5s) |
| **Type Safety (BE)** | 0 lỗi kiểu dữ liệu | `mypy app/` | every edit (`Check:fast` < 5s) |
| **Linting** | 0 lỗi linter | `eslint` (FE) & `ruff check` (BE) | every edit (`Check:fast` < 5s) |
| **Bảo mật (Secrets)** | 0 secret bị lộ | `gitleaks detect --redact` | every edit (`Check:fast` < 5s) |
| **Test Coverage** | Code thay đổi (diff) $\ge 80\%$ | `vitest` & `pytest --cov` | task end (`Check:task` ~90s) |
| **RL Inference** | Thời gian chạy model ONNX $< 20$ms | `pytest` perf benchmark | task end (`Check:task` ~90s) |
| **Backend API** | Response Time $< 100$ms | Kịch bản Load Test cục bộ | CI (Pre-commit / Push) |
| **Bảo mật (Code/Deps)** | 0 lỗi High/Critical | `semgrep` & `osv-scanner` | CI (Pre-commit / Push) |
| **Accessibility (WCAG)**| 0 lỗi Critical hoặc Serious | `axe-core` | CI / preview |
| **Web Vitals (LCP)** | LCP $\le 2500$ms, CLS $\le 0.1$ | `lighthouse` | CI / preview |

> **Quy định chạy kịch bản thời gian:**
> - `Check:fast` (< 5s): Chạy liên tục mỗi khi nhấn Save file (Types, Lint, Gitleaks).
> - `Check:task` (~90s): Chỉ chạy khi bạn hoàn thành một module/task (Coverage, Local Perf).
> - CI / Pre-commit: Các bài kiểm tra nặng (Semgrep, Lighthouse, Axe) sẽ đẩy qua lúc commit hoặc trên Github Actions.

## Measured, not yet enforced (Ghi nhận đo lường - Cơ chế Bánh cóc/Ratchet)

Luật Bánh cóc: Các con số này có thể thấp ở ngày đầu tiên, nhưng **chỉ được phép tăng lên hoặc giữ nguyên, tuyệt đối không được phép tụt xuống**.

| Metric | Today | Direction |
|--------|-------|-----------|
| Project overall coverage | 0% | Must not fall (Không được giảm) |
| Frontend bundle size (JS) | TBD | Must not grow unnaturally (Không tăng đột biến) |

## Exceptions (Ngoại lệ tạm thời)

| ID | Rule | Path | Reason | Owner | Expires |
|----|------|------|--------|-------|---------|
| W1 | `no-explicit-any` | `frontend/src/legacy/` | Mặc định không dùng `any`, ngoại trừ khi gọi hàm Web Worker thô | @diepvanhieu | N/A |
