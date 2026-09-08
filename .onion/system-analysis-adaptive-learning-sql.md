# Phân Tích Kỹ Thuật Chi Tiết: Hệ Thống Adaptive Learning SQL Ứng Dụng Reinforcement Learning

> **Tài liệu tham chiếu kiến trúc & thiết kế toán học**  
> **Dự án:** Hệ thống quản lý và khuyến nghị lộ trình học cá nhân hóa cho môn SQL/Database  
> **Mục tiêu:** Đồ án tốt nghiệp đạt chuẩn xuất sắc (Học thuật vững chắc + Sản phẩm thực tế hoàn thiện + UX Zero-Friction)

---

## 1. Mô Hình Hóa Toán Học (MDP Formulation)

Bài toán khuyến nghị lộ trình học được mô hình hóa dưới dạng **Quá trình Quyết định Markov (Markov Decision Process - MDP)**: $\langle \mathcal{S}, \mathcal{A}, \mathcal{P}, \mathcal{R}, \gamma \rangle$.

### 1.1. Không gian Trạng thái (State Space $\mathcal{S}$)
Vector trạng thái $s_t$ đại diện cho người học tại bước $t$:
$$s_t = \left[ K_t, M_t, H_t, F_t \right]$$

1. **Vector Độ Thành Thạo Khái Niệm ($K_t \in [0, 1]^N$):**
   - $N$ là số lượng khái niệm trong Đồ thị tri thức SQL ($N \approx 15-20$ node: `SELECT`, `WHERE`, `ORDER_BY`, `GROUP_BY`, `HAVING`, `JOIN_INNER`, `JOIN_LEFT`, `SUBQUERY`, `WINDOW_FUNC`,...).
   - Được cập nhật liên tục qua mô hình **Bayesian Knowledge Tracing (BKT)**:
     $$P(L_{t+1}) = P(L_t | \text{Obs}_t) + (1 - P(L_t | \text{Obs}_t)) \cdot P(T)$$
     Trong đó:
     - $P(L_0)$: Xác suất đã biết từ đầu (Prior Knowledge)
     - $P(T)$: Xác suất chuyển đổi/học được sau 1 tương tác (Transition)
     - $P(G)$: Xác suất đoán mò đúng (Guess)
     - $P(S)$: Xác suất trượt chân/làm ẩu dù đã hiểu (Slip)
2. **Vector Mức Độ Ghi Nhớ ($M_t \in [0, 1]^N$):**
   - Tính theo phương trình suy giảm trí nhớ Ebbinghaus:
     $$M_i(t) = e^{-\frac{\Delta t_i}{S_i}}$$
     - $\Delta t_i$: Khoảng thời gian hoặc số bước học kể từ lần cuối tương tác với khái niệm $i$.
     - $S_i$: Độ bền trí nhớ (Memory Strength), tăng theo cấp số nhân khi người học làm đúng trong các lần ôn tập ngắt quãng (Spaced Repetition).
3. **Lịch sử & Hành vi Gần Đây ($H_t$):**
   - Tỷ lệ đúng trong 5 bài gần nhất (Recent Accuracy Rate).
   - Tần suất sử dụng gợi ý (Hint Usage Frequency $\in [0, 1]$).
   - Thời gian hoàn thành trung bình so với thời gian dự kiến (Time Deviation).
4. **Chỉ số Nản lòng / Quá tải ($F_t \in [0, 1]$):**
   - Tăng khi người học làm sai liên tục $\ge 3$ lần hoặc thời gian dừng quá lâu ở một bài tập, báo hiệu nguy cơ bỏ cuộc (Drop-off Risk).

---

### 1.2. Không gian Hành động 2 Tầng (Two-Stage Action Space $\mathcal{A}$)
Để tránh bùng nổ không gian tìm kiếm và cho phép cập nhật ngân hàng đề mà không phải train lại mô hình:

* **Tầng 1 (RL Macro Agent):** Đưa ra quyết định sư phạm chiến lược:
  $$a_t = \langle c_k, d_m, \text{mode} \rangle$$
  - $c_k \in \{1, \dots, N\}$: Chọn khái niệm/kỹ năng cần tác động.
  - $d_m \in \{\text{Easy}, \text{Medium}, \text{Hard}\}$: Mức độ khó của bài tập.
  - $\text{mode} \in \{\text{Learn\_New}, \text{Practice\_Review}, \text{Diagnostic\_Quiz}\}$: Mục tiêu sư phạm (Học khái niệm mới, Ôn tập phục hồi trí nhớ, hoặc Kiểm tra đánh giá).

* **Tầng 2 (LMS Content Delivery Layer):** 
  - Nhận tuple $\langle c_k, d_m, \text{mode} \rangle$ từ RL.
  - Query trong Database ngân hàng bài tập SQL để lấy ra bài tập phù hợp nhất chưa được làm (hoặc bài làm sai trước đó).

---

### 1.3. Hàm Phần Thưởng (Reward Function $\mathcal{R}$)
Thiết kế hàm thưởng cân bằng giữa hiệu quả học tập và tâm lý người học:
$$\mathcal{R}(s_t, a_t, s_{t+1}) = w_1 \cdot \Delta \text{Mastery} + w_2 \cdot \Delta \text{Retention} + w_3 \cdot \mathcal{R}_{\text{ZPD}} - w_4 \cdot \text{Penalty}_{\text{Frustration}} - w_5 \cdot \text{Penalty}_{\text{Time}}$$

- **$\Delta \text{Mastery}$ (Tăng trưởng kiến thức):** $\sum (K_{t+1} - K_t)$.
- **$\Delta \text{Retention}$ (Chống quên):** Thưởng khi Agent chọn ôn tập đúng thời điểm $M_i(t)$ rơi xuống dưới ngưỡng cảnh báo ($0.5 - 0.6$).
- **$\mathcal{R}_{\text{ZPD}}$ (Vùng phát triển gần - Zone of Proximal Development):** Thưởng khi bài tập có độ thử thách vừa vặn (xác suất giải đúng thực tế nằm trong khoảng lý tưởng $75\% - 85\%$).
- **$\text{Penalty}_{\text{Frustration}}$:** Phạt nặng nếu để người học rơi vào trạng thái nản lòng (sai $\ge 3$ lần mà không hạ độ khó).
- **$\text{Penalty}_{\text{Time}}$:** Phạt nhỏ ở mỗi bước để Agent tìm lộ trình tối ưu ngắn nhất, loại bỏ bài tập dư thừa.

---

## 2. Môi Trường Người Học Ảo (Simulated Learner Environment)

Được xây dựng theo chuẩn **Gymnasium (OpenAI Gym)** để huấn luyện mô hình RL trước khi đưa vào thực tế:

```
                  +-----------------------------------+
                  |           RL Policy Agent         |
                  |          (DQN / PPO Model)        |
                  +-----------------------------------+
                       | Action: <c_k, d_m, mode>
                       v
    +-------------------------------------------------------+
    |           Simulated Student Environment               |
    |                                                       |
    |  +-------------------------------------------------+  |
    |  | 1. Knowledge Graph: Quan hệ tiên quyết SQL       |  |
    |  +-------------------------------------------------+  |
    |  | 2. Cognitive State: BKT + Ebbinghaus Memory     |  |
    |  +-------------------------------------------------+  |
    |  | 3. Student Personas:                             |  |
    |  |    - Fast Learner (Tốc độ cao, ít quên)         |  |
    |  |    - Average Learner (Bình thường, dễ quên)     |  |
    |  |    - Struggling Learner (Cần chia nhỏ bước)     |  |
    |  +-------------------------------------------------+  |
    +-------------------------------------------------------+
                       | Observation (s_t+1), Reward (r_t), Done
                       v
                  +-----------------------------------+
                  |           Policy Update           |
                  +-----------------------------------+
```

### Kịch bản Đối chuẩn (Baselines) bảo vệ trước Hội đồng:
1. **Baseline 1 (Fixed Linear):** Học sinh học theo đúng thứ tự bài 1 $\to$ bài $N$ trong giáo trình truyền thống.
2. **Baseline 2 (Spaced Repetition / Leitner):** Ôn tập theo chu kỳ thời gian cố định, không điều chỉnh độ khó linh hoạt theo năng lực.
3. **Baseline 3 (Rule-Based Heuristic):** Luật cứng (đúng lên hạng khó hơn, sai lặp lại bài cũ).
*Tiêu chí chứng minh RL vượt trội:* Tốc độ đạt ngưỡng thành thạo ($K_i \ge 0.85$ toàn bộ), tổng thời gian học ít hơn $20-30\%$, tỷ lệ duy trì trí nhớ sau 30 bước mô phỏng cao hơn rõ rệt.

---

## 3. Kiến Trúc Hệ Thống Phần Mềm (Software Architecture)

### 3.1. Thiết Kế Mở Rộng Đa Môn (Domain-Agnostic Core)
- **Knowledge Graph as Data:** Toàn bộ môn học được lưu dưới dạng file đồ thị `knowledge_graph.json`:
  ```json
  {
    "domain": "SQL",
    "concepts": [
      { "id": "sql_where", "name": "Mệnh đề WHERE", "prerequisites": ["sql_select"] },
      { "id": "sql_group_by", "name": "Gom nhóm GROUP BY", "prerequisites": ["sql_where"] },
      { "id": "sql_having", "name": "Lọc nhóm HAVING", "prerequisites": ["sql_group_by"] }
    ]
  }
  ```
  *Khi thêm môn Python hay Thuật toán, chỉ cần thay file đồ thị và ngân hàng bài tập, giữ nguyên core RL.*
- **Pluggable Grader Interface:**
  - `IExerciseEvaluator`:
    - `SQLEvaluator`: Chạy truy vấn SQL trên SQLite WASM / In-Memory, so sánh bảng kết quả (diff table).
    - `CodeEvaluator` (Tương lai): Chạy test case cho Python/JavaScript.
    - `QuizEvaluator`: Chấm trắc nghiệm lý thuyết.

### 3.2. Trình Thực Hành SQL Sandbox An Toàn & Tốc Độ Cao
- Sử dụng **SQLite compiled to WebAssembly (WASM / `sql.js`)**:
  - Chạy ngay trong trình duyệt của người học: **Độ trễ < 50ms**, không tốn tài nguyên server.
  - An toàn 100%: Dù người học chạy `DROP TABLE`, `DELETE`, hay vòng lặp, dữ liệu chỉ tồn tại trên RAM trình duyệt của chính họ, bấm *"Làm mới"* là phục hồi tức thì.
- **Diff Viewer tự động:**
  - Hiển thị bảng kết quả của người học song song với bảng kết quả mong đợi (Expected Output).
  - Tự động bôi màu xanh (đúng) và đỏ (dòng/cột thiếu hoặc sai).

### 3.3. Giám Sát 2 Tầng (Observability & Telemetry)
1. **Tầng Kỹ Thuật (System Health):**
    - API Inference Latency của RL Model (Mục tiêu < 200ms).
    - Tỷ lệ lỗi cú pháp SQL, tỷ lệ truy vấn bị Timeout.
2. **Tầng AI & Sư Phạm (Model Drift & Pedagogical Telemetry):**
    - **Prediction Drift:** So sánh xác suất làm đúng dự đoán của BKT so với kết quả nộp bài thật.
    - **Frustration Heatmap:** Phát hiện bài tập nào có tỷ lệ sinh viên làm sai $\ge 3$ lần cao bất thường để cảnh báo giảng viên xem xét lại độ khó hoặc lời gợi ý.

---

## 4. Trải Nghiệm Người Dùng: Zero-Friction & Anti-Frustration (UI/UX)

1. **Thao tác 1 chạm:**
    - Schema Viewer bên cạnh editor: Bấm vào tên bảng/tên cột là tự chèn vào code.
    - Phím tắt chuẩn: `Ctrl + Enter` (hoặc `Cmd + Enter`) để thực thi câu lệnh ngay lập tức.
2. **Không đánh đố khi gặp lỗi (Friendly Error Explainer):**
    - Chuyển ngữ các lỗi SQL trừu tượng thành hướng dẫn thực tế dễ hiểu kèm gợi ý vị trí sai.
3. **Gợi ý 3 cấp độ (Progressive Hints):**
    - Cấp 1: Gợi ý khái niệm cần dùng (`Cần dùng GROUP BY kết hợp với COUNT`).
    - Cấp 2: Khung câu lệnh điền chỗ trống (`SELECT dept_id, COUNT(*) FROM ... GROUP BY ...`).
    - Cấp 3: Mở đáp án chi tiết kèm giải thích cặn kẽ từng dòng.
4. **Minh bạch lý do gợi ý (Explainable AI - XAI Card):**
    - Mỗi bài tập AI gợi ý đều có nhãn: *"Gợi ý cho bạn vì: Điểm ghi nhớ của bạn về INNER JOIN đang giảm còn 62% sau 3 ngày chưa ôn tập."*
5. **Cây kỹ năng trực quan (Visual Skill Tree):**
    - Đồ thị tri thức dạng Node mạng lưới đổi màu theo năng lực (Xanh: Thành thạo, Vàng: Đang học, Đỏ: Cần ôn tập, Xám: Chưa mở khóa).
