# Ascend LMS - "Rise above limits" (Reinforcement Learning)

Hệ thống quản lý và khuyến nghị lộ trình học tập cá nhân hóa (Adaptive Learning) cho môn SQL/Database ứng dụng mô hình Học tăng cường (Reinforcement Learning).

> **Mục tiêu:** Đồ án tốt nghiệp CNTT đạt chuẩn xuất sắc (Học thuật toán/AI vững chắc + Sản phẩm Web LMS thực tế + UX Zero-Friction).

---

## Cấu trúc Thư mục

- `.onion/`: Tài liệu đặc tả, tuyên ngôn mục tiêu (Intent), phân tích toán học và kế hoạch thực hiện.
- `ai/`: Môi trường giả lập người học (Gymnasium + BKT + Ebbinghaus), mô hình RL (DQN), kịch bản đối chuẩn (Baselines).
- `backend/`: FastAPI Web API, Two-stage Recommender, Database lưu trữ tiến độ & telemetry.
- `frontend/`: Web App (React + Vite/Next.js, Monaco Editor, SQLite WASM sandbox `sql.js`, Cây kỹ năng trực quan, XAI cards).
- `data/`: Đồ thị tri thức SQL `knowledge_graph.json`, ngân hàng bài tập mẫu.
