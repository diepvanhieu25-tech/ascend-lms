# High-Level Design (HLD): Hệ thống Ascend LMS - "Rise above limits"

> **Mục đích:** Tài liệu thiết kế tổng thể hệ thống, cung cấp cái nhìn vĩ mô về kiến trúc phần mềm, mô hình dữ liệu, cơ sở hạ tầng và các luồng tương tác chính. Phục vụ trực tiếp cho quá trình báo cáo Đồ án tốt nghiệp.
> **Dự án:** Hệ thống quản lý và khuyến nghị lộ trình học cá nhân hóa cho môn SQL/Database.

---

## 1. Tổng Quan Kiến Trúc (Architecture Overview)

Hệ thống được thiết kế theo mô hình **Micro-Containerized Monolith**, tận dụng sự phân tách rõ ràng giữa Frontend (Client-side WASM) và Backend (API & AI Inference), giúp tối ưu hóa chi phí vận hành cho 1 nhà phát triển nhưng vẫn chịu tải được lượng truy cập lớn (500 - 1000 CCU).

### 1.1. Sơ Đồ Ngữ Cảnh (C4 Model - Level 1)

Hệ thống tương tác với 2 nhóm người dùng chính:
1. **Học viên:** Tương tác với không gian học SQL, nhận khuyến nghị cá nhân hóa, và thực thi truy vấn trực tiếp trên trình duyệt.
2. **Giảng viên / Admin:** Quản trị ngân hàng bài tập, theo dõi bản đồ nhiệt (Frustration Heatmap) và giám sát mô hình.

```mermaid
graph TD
    User["👤 Học viên"]
    Admin["👨‍🏫 Giảng viên"]
    
    System["📦 HỆ THỐNG ASCEND LMS<br/>- Nền tảng học thích ứng cá nhân hóa (Two-Stage RL)<br/>- Sandbox SQLite WASM client-side<br/>- Bộ chấm AST đa lớp"]
    
    User -->|Học tập, luyện code, phỏng vấn thử| System
    Admin -->|Theo dõi Heatmap, quản lý bài tập| System
```

### 1.2. Sơ Đồ Container (C4 Model - Level 2)

```mermaid
graph TB
    subgraph Client["Trình Duyệt Khách Hàng (Client Browser)"]
        SPA["Frontend SPA (Next.js 14 / React)<br/>- UI/UX, Cây kỹ năng, Monaco Editor"]
        WASM_Worker["Web Worker Sandbox (sql.js)<br/>- Thực thi truy vấn SQL (Client-side)"]
        SPA <-->|Message Channel| WASM_Worker
    end

    subgraph Infrastructure["Máy Chủ Ứng Dụng (Production Server)"]
        ReverseProxy["Reverse Proxy (Caddy)<br/>- Load Balancing, SSL, Caching"]
        
        API_App["Backend API (FastAPI)<br/>- BKT/Ebbinghaus Updater<br/>- RL Inference (ONNX)<br/>- AST Grader"]
        
        DB[("PostgreSQL 16<br/>- Lưu trữ User, Tiến độ, Log")]
    end

    SPA -->|HTTPS / REST API| ReverseProxy
    ReverseProxy -->|Proxy Pass :8000| API_App
    API_App -->|Async SQLAlchemy| DB
```

---

## 2. Kiến Trúc Dữ Liệu (Data Architecture)

Mô hình dữ liệu quan hệ (ERD) được thiết kế tập trung vào việc lưu vết lịch sử học tập (Telemetry) và trạng thái nhận thức (Cognitive State) của học viên.

```mermaid
erDiagram
    STUDENT ||--o{ COGNITIVE_STATE : has
    STUDENT ||--o{ SUBMISSION : submits
    STUDENT ||--o{ TELEMETRY_LOG : generates
    CONCEPT ||--o{ COGNITIVE_STATE : tracks
    CONCEPT ||--o{ EXERCISE : contains
    CONCEPT ||--o{ PREREQUISITE : requires
    EXERCISE ||--o{ SUBMISSION : evaluated_in

    STUDENT {
        uuid id PK
        string email
        string password_hash
        boolean is_guest
        float frustration_index
        timestamp last_active_at
    }

    COGNITIVE_STATE {
        uuid id PK
        uuid student_id FK
        string concept_id FK
        float mastery_prob
        float memory_strength
        float retention_score
    }

    EXERCISE {
        string id PK
        string concept_id FK
        string difficulty
        text schema_ddl
        text expected_sql
        jsonb ast_constraints
    }

    TELEMETRY_LOG {
        uuid id PK
        int paste_events_count
        boolean flagged_suspicious
    }
```

---

## 3. Luồng Nghiệp Vụ Cốt Lõi (Core Sequence Flows)

### 3.1. Luồng Khuyến Nghị Bài Tập (Recommendation Flow)
Sử dụng kiến trúc Two-Stage Recommendation:
1. **Macro Action:** Mô hình RL lấy vector nhận thức $s_t$ và quyết định chiến lược vĩ mô (Concept + Độ khó + Chế độ).
2. **Micro Action:** Database truy xuất bài tập cụ thể khớp với chiến lược vĩ mô.

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant BE as Backend (FastAPI)
    participant RL as RL Engine (ONNX)
    participant DB as PostgreSQL

    FE->>BE: GET /api/v1/recommendation/next
    BE->>DB: Truy xuất s_t = [K, M, H, F]
    DB-->>BE: s_t
    BE->>RL: predict(s_t, action_mask)
    RL-->>BE: Macro Action <Concept, Difficulty, Mode>
    BE->>DB: Lấy bài tập khớp điều kiện
    DB-->>BE: Dữ liệu Exercise & Schema
    BE-->>FE: Trả về Bài tập + XAI Card giải thích
```

### 3.2. Luồng Thực Thi & Chấm Điểm
Giảm tải tối đa cho Server bằng cách chạy SQL ngay trên trình duyệt (WASM).

```mermaid
sequenceDiagram
    participant Learner as Học viên
    participant FE as Frontend
    participant Worker as Web Worker (WASM)
    participant BE as Backend (AST Grader)

    Learner->>FE: Gõ SQL & Nhấn Run
    FE->>Worker: postMessage(sql, schema)
    Worker-->>FE: Trả về Bảng Kết Quả (< 20ms)
    
    Learner->>FE: Nhấn Nộp Bài (Submit)
    FE->>BE: POST /api/v1/exercises/.../submit
    BE->>BE: Phân tích AST (Bắt lỗi Hardcode)
    BE->>BE: Cập nhật BKT & Ebbinghaus (Background)
    BE-->>FE: Kết quả điểm số & Điểm nhận thức mới
```

---

## 4. Kiến Trúc Hạ Tầng & Triển Khai (Infrastructure Topology)

- **Công cụ Container:** Docker & Docker Compose.
- **Web Server / Proxy:** Caddy v2 (Tự động cấp phát chứng chỉ Let's Encrypt SSL, quản lý rate limit).
- **Backend:** Python 3.11 (FastAPI, Uvicorn, ONNX Runtime).
- **Frontend:** Node.js (Next.js 14 App Router, chạy chế độ Standalone).
- **Database:** PostgreSQL 16 (Volume persistence).
- **CI/CD:** GitHub Actions (Linting -> Testing -> Docker Build -> SSH Deploy).

Mô hình triển khai này đảm bảo hệ thống có thể self-host dễ dàng trên 1 VPS 2-core / 4GB RAM mà vẫn phục vụ mượt mà hàng trăm học viên cùng lúc nhờ khả năng offload quá trình chạy code xuống client-side WASM.
