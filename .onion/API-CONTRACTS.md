# API Contracts: FastAPI Backend & Next.js Frontend

> **Tài liệu đặc tả giao tiếp (Interface Contracts):** Quy định các endpoint RESTful, cấu trúc Request/Response, mã trạng thái và schema kiểu dữ liệu giữa Backend (FastAPI) và Client (Next.js 14+).  
> **Thời gian tạo:** 2026-09-07 | **Phiên bản:** v1.0  
> **Tài liệu liên quan:** [Capability Map](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/capability-map.md)

---

## 1. Nguyên Tắc Thiết Kế API (API Conventions)

- **Base URL:** `/api/v1`
- **Định dạng dữ liệu:** `application/json` (UTF-8)
- **Chuẩn mã hóa lỗi (Error Envelope):**
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_SQL_SYNTAX",
      "message": "Cú pháp SQL không hợp lệ gần 'WHER'",
      "details": { "line": 1, "column": 14 }
    }
  }
  ```
- **Xác thực:** Bearer JWT Token gửi qua Header `Authorization: Bearer <token>` (hoặc Anonymous Session Cookie cho chế độ trải nghiệm nhanh).

---

## 2. Danh Sách Endpoints Chi Tiết

### 2.1. Quản lý Phiên Học, Định Danh & Xác Thực (Auth & Identity Management)

#### `POST /api/v1/auth/guest-session`
Khởi tạo phiên học ẩn danh tức thì (Zero-friction, học viên không bắt buộc phải đăng ký để vào học ngay).

- **Request Body:** `{ "device_fingerprint": "optional_string" }`
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "student_id": "stu_98a7bc",
      "is_guest": true,
      "created_at": "2026-09-07T12:00:00Z"
    }
  }
  ```

#### `POST /api/v1/auth/register`
Đăng ký tài khoản học viên mới hoàn toàn.

- **Request Body:** 
  ```json
  {
    "email": "student@example.com",
    "password": "strong_password_123",
    "display_name": "Nguyen Van A"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "student_id": "stu_12345",
      "is_guest": false
    }
  }
  ```

#### `POST /api/v1/auth/login`
Đăng nhập vào tài khoản đã tồn tại.

- **Request Body:** 
  ```json
  {
    "email": "student@example.com",
    "password": "strong_password_123"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "student_id": "stu_12345",
      "is_guest": false
    }
  }
  ```

#### `POST /api/v1/auth/convert-guest`
Định danh tài khoản cho Guest Session hiện tại. Endpoint này nhận token của Guest qua header, yêu cầu Email và Password, sau đó cập nhật thông tin user, chuyển trạng thái `is_guest = false` và giữ nguyên 100% vector nhận thức cũng như lịch sử học tập.

- **Headers:** `Authorization: Bearer <guest_token>`
- **Request Body:** 
  ```json
  {
    "email": "student@example.com",
    "password": "strong_password_123",
    "display_name": "Nguyen Van A"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi... (new token)",
      "student_id": "stu_98a7bc",
      "is_guest": false,
      "message": "Đã đồng bộ toàn bộ lịch sử học tập vào tài khoản chính thức."
    }
  }
  ```

#### `GET /api/v1/auth/me`
Lấy thông tin hồ sơ (profile) của học viên đang đăng nhập.

- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "student_id": "stu_98a7bc",
      "email": "student@example.com",
      "display_name": "Nguyen Van A",
      "is_guest": false,
      "frustration_index": 0.15,
      "created_at": "2026-09-07T12:00:00Z",
      "last_active_at": "2026-09-08T20:30:00Z"
    }
  }
  ```

---

### 2.2. Đánh Giá Năng Lực Đầu Vào (Onboarding Diagnostic Placement Test)

#### `GET /api/v1/diagnostic/placement-test`
Lấy bộ câu hỏi chẩn đoán nhanh (5-7 câu hỏi then chốt tại các nút giao DAG) để xác định trình độ người học ban đầu.

- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "total_questions": 5,
      "estimated_minutes": 5,
      "questions": [
        {
          "question_id": "diag_q1_filter_aggregate",
          "target_concept_id": "sql_having",
          "prerequisite_chain": ["sql_select_basic", "sql_where_filter", "sql_group_by"],
          "question_text": "Câu lệnh nào sau đây dùng để lọc ra các phòng ban có tổng lương trên 100 triệu?",
          "options": [
            "SELECT dept_id FROM emp WHERE SUM(salary) > 100000000;",
            "SELECT dept_id FROM emp GROUP BY dept_id HAVING SUM(salary) > 100000000;",
            "SELECT dept_id FROM emp GROUP BY dept_id WHERE SUM(salary) > 100000000;",
            "SELECT dept_id FROM emp HAVING salary > 100000000;"
          ]
        },
        {
          "question_id": "diag_q2_join_null",
          "target_concept_id": "sql_left_join",
          "prerequisite_chain": ["sql_inner_join"],
          "question_text": "Khi bảng bên phải không có bản ghi khớp, kết quả của LEFT JOIN tại các cột đó sẽ là gì?",
          "options": ["0", "Chuỗi rỗng ''", "NULL", "Bỏ qua dòng đó"]
        }
      ]
    }
  }
  ```

#### `POST /api/v1/diagnostic/submit`
Nộp bài đánh giá năng lực đầu vào, kích hoạt thuật toán Lan truyền Tiên quyết trên DAG (Prerequisite Propagation) để khởi tạo $s_0 = [K_0, M_0, H_0, F_0]$.

- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "responses": [
      { "question_id": "diag_q1_filter_aggregate", "selected_option_index": 1 },
      { "question_id": "diag_q2_join_null", "selected_option_index": 2 }
    ],
    "declared_profile": "INTERMEDIATE"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "pre_test_score": 85.0,
      "inferred_level": "INTERMEDIATE",
      "initial_mastery": {
        "sql_select_basic": 0.95,
        "sql_where_filter": 0.92,
        "sql_group_by": 0.88,
        "sql_having": 0.85,
        "sql_inner_join": 0.80,
        "sql_left_join": 0.75,
        "sql_window_ranking": 0.10
      },
      "first_recommended_concept": "sql_window_ranking",
      "message": "Đã thiết lập lộ trình học tập cá nhân hóa thành công!"
    }
  }
  ```

#### `GET /api/v1/diagnostic/calibration-question`
Lấy 1 câu hỏi bẫy bản chất (30s) ứng với trình độ tự chọn của học viên để kiểm chứng tính chuẩn xác trước khi gán lộ trình.

- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `profile` $\in \{\text{BEGINNER}, \text{INTERMEDIATE}, \text{ADVANCED}\}$
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "question_id": "calib_q_intermediate_01",
      "target_profile": "INTERMEDIATE",
      "time_limit_seconds": 30,
      "question_text": "Mệnh đề nào có thể sử dụng hàm tổng hợp (SUM, COUNT) trong điều kiện lọc?",
      "options": ["WHERE", "HAVING", "ORDER BY", "FROM"],
      "hint_on_fail": "Lưu ý rằng WHERE lọc từng dòng trước khi gom nhóm, còn HAVING lọc sau khi đã gom nhóm."
    }
  }
  ```

#### `POST /api/v1/diagnostic/self-declare-verify`
Nộp đáp án câu hỏi xác thực. Nếu làm đúng $\to$ cấp lộ trình theo profile; nếu làm sai $\to$ tự động hạ xuống nấc an toàn kế dưới (Adjusted Profile) để tránh gây ngợp.

- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "declared_profile": "INTERMEDIATE",
    "question_id": "calib_q_intermediate_01",
    "selected_option_index": 1
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "is_verified": true,
      "final_profile": "INTERMEDIATE",
      "initial_mastery": {
        "sql_select_basic": 0.85,
        "sql_where_filter": 0.82,
        "sql_group_by": 0.80,
        "sql_having": 0.75,
        "sql_inner_join": 0.40
      },
      "message": "Xác nhận năng lực thành công! Bắt đầu lộ trình tại kỹ năng: sql_inner_join"
    }
  }
  ```

---

### 2.3. Bản Đồ Tri Thức & Cây Kỹ Năng (Skill Tree)

#### `GET /api/v1/student/skill-tree`
Lấy toàn bộ dữ liệu đồ thị tri thức kèm trạng thái năng lực hiện tại của người học (dùng render Cây kỹ năng `@xyflow/react`).

- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "nodes": [
        {
          "id": "sql_select_basic",
          "name": "Mệnh đề SELECT cơ bản",
          "bloom_level": 1,
          "status": "MASTERED",
          "mastery_prob": 0.94,
          "retention_strength": 0.88,
          "is_unlocked": true
        },
        {
          "id": "sql_inner_join",
          "name": "Kết nối bảng INNER JOIN",
          "bloom_level": 3,
          "status": "NEEDS_REVIEW",
          "mastery_prob": 0.82,
          "retention_strength": 0.58,
          "is_unlocked": true
        },
        {
          "id": "sql_window_ranking",
          "name": "Hàm xếp hạng Window Functions",
          "bloom_level": 5,
          "status": "LOCKED",
          "mastery_prob": 0.05,
          "retention_strength": 0.0,
          "is_unlocked": false
        }
      ],
      "edges": [
        { "source": "sql_select_basic", "target": "sql_where_filter" },
        { "source": "sql_where_filter", "target": "sql_inner_join" }
      ]
    }
  }
  ```

---

### 2.4. Khuyến Nghị Lộ Trình Cá Nhân Hóa (Two-Stage Recommendation & XAI)

#### `GET /api/v1/recommendation/next`
Lấy bài tập tiếp theo được mô hình Two-Stage RL đề xuất, kèm thẻ giải thích lý do sư phạm (Explainable AI - XAI).

- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "exercise": {
        "id": "ex_inner_join_null_trap_01",
        "concept_id": "sql_inner_join",
        "concept_name": "Kết nối bảng INNER JOIN",
        "difficulty": "MEDIUM",
        "mode": "PRACTICE_REVIEW",
        "title": "Tìm danh sách đơn hàng kèm tên khách hàng có tài khoản kích hoạt",
        "description": "Viết truy vấn kết nối bảng `orders` và `customers`...",
        "schema_ddl": "CREATE TABLE customers (id INT, name TEXT, is_active INT);\nCREATE TABLE orders (id INT, customer_id INT, amount DECIMAL);",
        "seed_data_sql": "INSERT INTO customers VALUES (1, 'Alice', 1), (2, 'Bob', 0), (3, 'Charlie', NULL);\nINSERT INTO orders VALUES (101, 1, 50.0), (102, 3, 30.0), (103, 999, 10.0);",
        "expected_columns": ["id", "customer_name", "amount"],
        "expected_row_count": 1
      },
      "xai_card": {
        "pedagogical_mode": "PRACTICE_REVIEW",
        "headline": "Ôn tập củng cố trí nhớ dài hạn",
        "rationale_message": "Điểm ghi nhớ của bạn về INNER JOIN đang giảm còn 58% sau 3 ngày chưa thực hành. Bài tập này giúp kích hoạt lại trí nhớ ngắt quãng.",
        "target_metrics": {
          "current_retention": 0.58,
          "expected_retention_after": 0.95
        }
      }
    }
  }
  ```

---

### 2.5. Lấy Dữ Liệu Khôi Phục Bài Tập (Exercise Hydration)

#### `GET /api/v1/exercises/{exercise_id}`
Lấy chi tiết đề bài, schema DDL và seed data của một bài tập cụ thể. Cực kỳ quan trọng để Frontend khôi phục giao diện (Hydration) và khởi tạo lại SQLite WASM memory khi người dùng nhấn F5/Reload trang tại route `/learn/[exerciseId]`.

- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:** Trả về cấu trúc JSON tương tự như object `exercise` trong endpoint `recommendation/next`.
  ```json
  {
    "success": true,
    "data": {
      "id": "ex_inner_join_null_trap_01",
      "concept_id": "sql_inner_join",
      "difficulty": "MEDIUM",
      "mode": "PRACTICE_REVIEW",
      "title": "Tìm danh sách đơn hàng kèm tên khách hàng có tài khoản kích hoạt",
      "description": "Viết truy vấn kết nối bảng...",
      "schema_ddl": "CREATE TABLE customers...",
      "seed_data_sql": "INSERT INTO customers...",
      "expected_columns": ["id", "customer_name", "amount"]
    }
  }
  ```

---

### 2.6. Nộp Bài, Chấm AST & Ghi Nhận Hành Vi (Submission & Telemetry)

#### `POST /api/v1/exercises/{exercise_id}/submit`
Nộp lời giải SQL của người học. Backend chạy kiểm định AST, đối soát kết quả truy vấn, cập nhật BKT/Ebbinghaus và phân tích Telemetry xem có dấu hiệu dán code 0ms hay không.

- **Request Body:**
  ```json
  {
    "submitted_sql": "SELECT o.id, c.name, o.amount FROM orders o INNER JOIN customers c ON o.customer_id = c.id WHERE c.is_active = 1;",
    "telemetry": {
      "time_spent_seconds": 45,
      "keystroke_count": 128,
      "keystroke_events": [
        { "key": "S", "time_diff_ms": 120 },
        { "key": "E", "time_diff_ms": 110 }
      ],
      "paste_events": [
        { "timestamp_ms": 1240, "char_count": 50 }
      ],
      "tab_switches": 0
    }
  }
  ```
- **Response `200 OK` (Thành công):**
  ```json
  {
    "success": true,
    "data": {
      "is_correct": true,
      "ast_check": {
        "passed": true,
        "required_clauses_met": ["INNER JOIN"],
        "violations": []
      },
      "query_execution": {
        "execution_time_ms": 12,
        "row_count": 1
      },
      "student_state_update": {
        "concept_id": "sql_inner_join",
        "new_mastery": 0.89,
        "new_retention": 0.96,
        "frustration_index": 0.0
      },
      "trigger_spot_check": false
    }
  }
  ```
- **Response `200 OK` (Cảnh báo gian lận AI & Kích hoạt Spot-Check):**
  ```json
  {
    "success": true,
    "data": {
      "is_correct": true,
      "ast_check": { "passed": true, "violations": [] },
      "trigger_spot_check": true,
      "spot_check": {
        "question": "Tại sao câu lệnh này không trả về đơn hàng số 103 (customer_id = 999)?",
        "options": [
          "Vì bảng customers không có id = 999 nên INNER JOIN loại bỏ dòng này",
          "Vì amount của đơn hàng 103 nhỏ hơn 20",
          "Do SQLite bị lỗi bộ nhớ khi truy vấn NULL"
        ],
        "time_limit_seconds": 30
      }
    }
  }
  ```

#### `POST /api/v1/exercises/spot-check`
Nộp đáp án câu hỏi bẫy phản xạ (Spot-Check) để mở khóa tiếp lộ trình.

- **Request Body:**
  ```json
  {
    "spot_check_id": "spot_12345",
    "selected_option_index": 1,
    "time_spent_seconds": 12
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "is_correct": true,
      "message": "Xác thực thành công, tiếp tục học tập!"
    }
  }
  ```

---

### 2.6. Hệ Thống Gợi Ý 3 Cấp Độ (Progressive Hints)

#### `POST /api/v1/exercises/{exercise_id}/hints/{level}`
Yêu cầu mở khóa gợi ý cấp độ 1, 2, hoặc 3 (Hệ thống ghi nhận việc sử dụng gợi ý vào $H_t$ để điều chỉnh độ khó tương lai).

- **URL Params:** `level` $\in \{1, 2, 3\}$
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "level": 1,
      "hint_type": "CONCEPT_REMINDER",
      "content": "Hãy nhớ rằng INNER JOIN chỉ giữ lại các bản ghi có khóa ngoại khớp ở cả hai bảng. Điều kiện lọc `c.is_active = 1` cần đặt trong mệnh đề WHERE."
    }
  }
  ```

---

### 2.7. Bảng Điều Khiển Quản Trị & Giám Sát Sư Phạm (Admin & Analytics)

#### `GET /api/v1/admin/analytics/frustration-heatmap`
Xem bản đồ nhiệt các bài tập hoặc concept có tỷ lệ gây ức chế/bỏ cuộc cao nhất.

- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "concept_id": "sql_having",
        "concept_name": "Lọc nhóm HAVING",
        "struggle_rate": 0.42,
        "avg_attempts_before_success": 3.8,
        "most_common_ast_error": "USED_WHERE_INSTEAD_OF_HAVING_FOR_AGGREGATE"
      }
    ]
  }
  ```

#### `GET /api/v1/admin/analytics/model-drift`
Theo dõi độ trôi của mô hình BKT/RL: Đối soát xác suất dự đoán $P(\text{Correct})$ và tỷ lệ làm đúng thực tế của sinh viên.

- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "mean_absolute_error": 0.074,
      "sample_size": 1250,
      "bkt_predicted_accuracy": 0.78,
      "actual_student_accuracy": 0.75,
      "drift_status": "STABLE"
    }
  }
  ```
