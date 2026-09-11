# Spec: Module `sql-engine`

> **Module ID:** `sql-engine`  
> **Trạng thái:** Đặc tả chi tiết (Approved Specification)  
> **Tài liệu cha:** [Capability Map](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/capability-map.md) | [SPEC: knowledge-graph](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/SPEC-knowledge-graph.md)  
> **Phiên bản:** 1.0.0

---

## 1. Objective (Mục Tiêu & Trách Nhiệm Cốt Lõi)

Module `sql-engine` phụ trách **toàn bộ quy trình thực thi, phân tích cú pháp và chấm điểm bài tập SQL đa tầng**, đảm bảo học viên thực sự hiểu bản chất câu lệnh và không thể "qua mặt" hệ thống bằng các mẹo hardcode:

1. **Trình Thực Thi Sandbox Khách Hàng (Client-Side SQLite WASM Runner):**
   - Chạy SQLite WebAssembly (`sql.js`) bên trong một **Web Worker độc lập** trên trình duyệt của người học.
   - Độ trễ thực thi $< 20$ms, không phụ thuộc vào mạng, không tốn tài nguyên máy chủ.
   - Đảm bảo an toàn tuyệt đối: Mỗi bài tập chạy trên 1 database in-memory riêng biệt, tự hủy và cấp mới khi đổi bài (Zero memory leak).
2. **Bộ Chấm Điểm Cú Pháp Bản Chất (AST Semantic Analyzer với `sqlglot`):**
   - Phân tích cây cú pháp trừu tượng (Abstract Syntax Tree) của câu truy vấn phía Backend.
   - Thẩm định các ràng buộc cấu trúc câu lệnh: Bắt buộc dùng đúng mệnh đề (`GROUP BY`, `HAVING`, `JOIN ... ON`), cấm các mệnh đề gian lận (ví dụ: cấm dùng `WHERE` khi bài yêu cầu luyện `HAVING`), kiểm tra số lượng bảng kết nối tối thiểu.
   - Chống gian lận Hardcode: Phát hiện và loại bỏ các câu truy vấn chỉ trả về hằng số cứng (ví dụ: `SELECT 150000000` hoặc hardcode mảng dữ liệu).
3. **Bộ Chấm Tối Ưu Hóa Kế Hoạch Thực Thi (`EXPLAIN QUERY PLAN` Grader):**
   - Phân tích kết quả `EXPLAIN QUERY PLAN` trong SQLite để chấm điểm tối ưu hóa truy vấn: Bắt buộc câu lệnh phải chuyển đổi từ quét toàn bảng (`SCAN TABLE`) sang tìm kiếm theo chỉ mục (`SEARCH TABLE ... USING INDEX`).
4. **Bộ So Sánh Bảng Kết Quả An Toàn (Safe Result Diff Matcher):**
   - So sánh bảng kết quả của học viên với kết quả mong đợi (`expected_output`).
   - Xử lý chính xác giá trị `NULL` (không nhầm lẫn giữa chuỗi rỗng `''`, số `0` và `NULL`).
   - Bỏ qua sự khác biệt không quan trọng về thứ tự dòng khi bài không yêu cầu `ORDER BY`.
   - Dung sai số thực (`tolerance = 1e-4`) cho các phép tính tổng hợp tiền tệ hoặc trung bình cộng (`AVG`, `SUM`).

---

## 2. Commands (Lệnh Thực Thi Chuẩn)

```bash
# Kiểm thử Bộ phân tích cú pháp AST và Diff Matcher phía Backend
cd backend && source .venv/bin/activate
pytest tests/test_sql_engine.py -v --durations=10

# Kiểm tra kiểu tĩnh và linting Backend
mypy app/domain/grader --strict
ruff check app/domain/grader tests/test_sql_engine.py

# Kiểm thử Web Worker SQLite WASM phía Frontend
cd ../frontend
npm test -- src/workers/__tests__/sqlite.worker.test.ts
npm run lint
```

---

## 3. Project Structure (Cấu Trúc Thư Mục Module)

```text
adaptive-learning-sql/
├── backend/
│   ├── app/
│   │   └── domain/
│   │       └── grader/
│   │           ├── __init__.py
│   │           ├── ast_analyzer.py      # Bộ phân tích cú pháp trừu tượng bằng sqlglot
│   │           ├── explain_analyzer.py  # Phân tích EXPLAIN QUERY PLAN (Index vs Scan)
│   │           ├── diff_matcher.py      # So sánh bảng kết quả, NULL safety, tolerance
│   │           └── evaluator.py         # Service hợp nhất chấm điểm: AST + Result + Plan
│   └── tests/
│       ├── test_sql_engine.py          # Unit tests cho AST violations, NULL diffs
│       └── test_explain_grader.py       # Unit tests cho EXPLAIN QUERY PLAN
└── frontend/
    └── src/
        └── workers/
            ├── sqlite.worker.ts         # Web Worker chạy sql.js (SQLite WASM)
            ├── wasm_loader.ts          # Tải và khởi tạo file binary sql-wasm.wasm
            └── __tests__/
                └── sqlite.worker.test.ts # Vitest cho Web Worker execution
```

---

## 4. Code Triển Khai Minh Họa & Logic Chấm AST

### 4.1. Bộ Phân Tích Cú Pháp AST bằng `sqlglot` (`ast_analyzer.py`)

```python
from typing import List, Dict, Any, Optional
import sqlglot
from sqlglot import exp
from pydantic import BaseModel, Field

class ASTViolation(BaseModel):
    rule_type: str
    message: str

class ASTCheckResult(BaseModel):
    passed: bool
    violations: List[ASTViolation] = Field(default_factory=list)
    clauses_found: List[str] = Field(default_factory=list)

class ASTAnalyzer:
    def __init__(self, dialect: str = "sqlite"):
        self.dialect = dialect

    def analyze(self, sql_query: str, ast_constraint: dict) -> ASTCheckResult:
        violations: List[ASTViolation] = []
        clauses_found: List[str] = []

        try:
            expressions = sqlglot.parse(sql_query, read=self.dialect)
            if len(expressions) > 1:
                return ASTCheckResult(
                    passed=False, 
                    violations=[ASTViolation(rule_type="MULTIPLE_STATEMENTS", message="Chỉ được phép thực thi 1 câu lệnh SQL duy nhất.")]
                )
            expression = expressions[0]
        except Exception as e:
            return ASTCheckResult(
                passed=False, 
                violations=[ASTViolation(rule_type="SYNTAX_ERROR", message=f"Lỗi cú pháp SQL: {str(e)}")]
            )

        # 1. Phát hiện các mệnh đề xuất hiện trong câu truy vấn
        if expression.find(exp.Group):
            clauses_found.append("GROUP BY")
        if expression.find(exp.Having):
            clauses_found.append("HAVING")
        if expression.find(exp.Join):
            clauses_found.append("JOIN")
        if expression.find(exp.Order):
            clauses_found.append("ORDER BY")
        if expression.find(exp.Where):
            clauses_found.append("WHERE")
        if expression.find(exp.CTE):
            clauses_found.append("WITH CTE")

        # 2. Kiểm tra các mệnh đề bắt buộc (Required Clauses)
        required_clauses = ast_constraint.get("required_clauses", [])
        for req in required_clauses:
            if req not in clauses_found:
                violations.append(ASTViolation(
                    rule_type="MISSING_REQUIRED_CLAUSE",
                    message=f"Bài tập này bắt buộc phải sử dụng mệnh đề '{req}'."
                ))

        # 3. Kiểm tra các mệnh đề bị cấm (Forbidden Clauses)
        forbidden_clauses = ast_constraint.get("forbidden_clauses", [])
        for forb in forbidden_clauses:
            if forb in clauses_found:
                violations.append(ASTViolation(
                    rule_type="FORBIDDEN_CLAUSE_USED",
                    message=f"Bài tập này cấm sử dụng mệnh đề '{forb}' để đảm bảo rèn luyện đúng kỹ năng."
                ))

        # 4. Chống hardcode: Không cho phép SELECT danh sách toàn số/chuỗi cứng mà không trỏ vào bảng
        from_clause = expression.find(exp.From)
        if not from_clause:
            violations.append(ASTViolation(
                rule_type="NO_FROM_CLAUSE",
                message="Truy vấn không có mệnh đề FROM, không được phép hardcode kết quả."
            ))

        return ASTCheckResult(
            passed=len(violations) == 0,
            violations=violations,
            clauses_found=clauses_found
        )
```

### 4.2. Chấm Kế Hoạch Thực Thi `EXPLAIN QUERY PLAN`

```python
class ExplainPlanAnalyzer:
    @staticmethod
    def evaluate_plan(plan_rows: List[dict], require_index: bool = True) -> dict:
        """
        plan_rows: Output từ lệnh `EXPLAIN QUERY PLAN SELECT ...`
        Ví dụ SQLite trả về cột 'detail': 'SCAN TABLE orders' hoặc 'SEARCH TABLE orders USING INDEX idx_cust'
        """
        uses_index = False
        uses_scan = False

        for row in plan_rows:
            detail = row.get("detail", "").upper()
            if "USING INDEX" in detail or "SEARCH" in detail:
                uses_index = True
            if "SCAN TABLE" in detail and "USING INDEX" not in detail:
                uses_scan = True

        if require_index and not uses_index:
            return {
                "passed": False,
                "score": 0.5,
                "feedback": "Câu truy vấn đang quét toàn bảng (SCAN TABLE). Hãy tạo hoặc tận dụng INDEX để chuyển sang SEARCH TABLE. (Lưu ý: Nếu bảng < 10,000 dòng, bắt buộc phải dùng mệnh đề INDEXED BY để ép SQLite dùng Index)."
            }
        return {
            "passed": True,
            "score": 1.0,
            "feedback": "Tối ưu hóa thành công! Kế hoạch thực thi đã sử dụng Index hiệu quả."
        }
```

---

## 5. Testing Strategy (Chiến Lược Kiểm Thử)

1. **Bộ Test Chống Gian Lận Cú Pháp (Anti-Hardcode Tests):**
   - Nhập `SELECT 1, 'Alice', 50.0;` cho bài tập yêu cầu JOIN $\to$ Phải bị bắt lỗi `NO_FROM_CLAUSE` và `MISSING_REQUIRED_CLAUSE (JOIN)`.
   - Nhập truy vấn dùng `WHERE` cho bài tập yêu cầu lọc bằng `HAVING` $\to$ Bắt lỗi `FORBIDDEN_CLAUSE_USED (WHERE)`.
2. **Bộ Test Bẫy Biên & Dữ Liệu Cạnh (Edge-case NULL Traps):**
   - Seed data chứa `NULL` ở khóa ngoại và trường trạng thái `is_active`.
   - Viết test đối chiếu giữa `LEFT JOIN` và `INNER JOIN`: Kết quả phải khác biệt rõ rệt tại các dòng có `NULL`.
3. **Kiểm Thử Web Worker SQLite WASM Client-Side:**
   - Khởi tạo Web Worker, nạp DDL 3 bảng, nạp 1.000 dòng seed data.
   - Chạy 50 câu truy vấn phức tạp liên tiếp: Đo thời gian thực thi trung bình mỗi câu phải $< 15$ms.
   - Thực thi câu lệnh phá hoại: `DROP TABLE students;` $\to$ Đảm bảo chỉ phá hủy trong RAM ảo của Worker đó, nhấn nút "Làm mới" là khôi phục lại trong $< 10$ms.

---

## 6. Boundaries (Ranh Giới Phát Triển)

- **Always:**
  - Chạy `sql.js` bên trong Web Worker để giao diện người dùng chính (Main UI Thread) không bao giờ bị đơ (freeze) khi thực thi câu truy vấn nặng.
  - Phải kiểm tra cả 3 yếu tố trước khi công nhận bài giải đúng: Cú pháp AST hợp lệ + Kế hoạch thực thi đạt yêu cầu + Bảng kết quả khớp 100% (Diff Table sạch).
- **Ask first:**
  - Cho phép dung sai kích thước kết quả (mặc định: số dòng và số cột phải khớp chính xác).
  - Thêm các quy tắc kiểm tra AST phức tạp mới (như kiểm tra Subquery lồng 3 cấp).
- **Never:**
  - Cho phép chạy code SQL của học viên trên CSDL PostgreSQL chính của hệ thống.
  - Chấm điểm bài tập chỉ dựa trên việc "chạy ra số dòng giống nhau" mà không kiểm tra cấu trúc AST.

---

## 7. Success Criteria (Tiêu Chí Nghiệm Thu)

1. Module `ast_analyzer.py` bắt chính xác 100% các câu truy vấn gian lận (hardcode kết quả, dùng sai mệnh đề) trên bộ test 50 câu hỏi mẫu.
2. Web Worker SQLite WASM chạy ổn định trên trình duyệt (Chrome, Firefox, Safari) với thời gian phản hồi $< 20$ms cho các truy vấn trung bình.
3. Bộ so sánh kết quả `diff_matcher.py` phân biệt chính xác sự khác nhau giữa `NULL`, `0`, và chuỗi rỗng `""`.
