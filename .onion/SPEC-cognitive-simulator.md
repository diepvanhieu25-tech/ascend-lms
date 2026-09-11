# Spec: Module `cognitive-simulator`

> **Module ID:** `cognitive-simulator`  
> **Trạng thái:** Bản thảo đề xuất (Draft Proposal for Review)  
> **Tài liệu cha:** [Capability Map](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/capability-map.md) | [SPEC: knowledge-graph](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/SPEC-knowledge-graph.md)  
> **Phiên bản:** 1.0.0

---

## 1. Objective (Mục Tiêu)

Xây dựng môi trường mô phỏng nhận thức người học học thuật chuẩn **`gymnasium.Env`** mang tên **`SQLStudentEnv`**. 

Môi trường này là trung tâm của phần nghiên cứu khoa học trong đồ án tốt nghiệp:
- Tích hợp mô hình hóa nhận thức thực tế: **Bayesian Knowledge Tracing (BKT)** (cập nhật xác suất thành thạo qua quan sát) và **Đường cong quên lãng Ebbinghaus** (suy giảm trí nhớ theo thời gian nếu không ôn tập).
- Cung cấp 3 hồ sơ người học ảo (Personas: Fast, Average, Struggling) với các tham số nhận thức khác nhau để kiểm tra tính thích ứng của mô hình.
- Tích hợp 3 thuật toán đối chuẩn (Baselines: Fixed Linear, Leitner Spaced Repetition, Rule-Based Heuristic) làm thước đo so sánh.
- Phục vụ trực tiếp cho module `rl-engine` huấn luyện chính sách tối ưu và xuất số liệu thực nghiệm chứng minh tính vượt trội khoa học cho báo cáo tốt nghiệp.

---

## 2. Commands (Lệnh Thực Thi Chuẩn)

```bash
# Kích hoạt môi trường backend
cd backend && source .venv/bin/activate

# Chạy toàn bộ test kiểm định môi trường Gymnasium & các mô hình toán
pytest tests/test_cognitive_simulator.py -v

# Chạy test kiểm tra tính tương thích chuẩn Gymnasium (Check Env)
pytest tests/test_gym_compatibility.py -v

# Chạy script chạy thử nghiệm 100 bước mô phỏng và in trạng thái
python -m app.domain.simulator.demo_run --steps 100 --persona average
```

---

## 3. Project Structure (Cấu Trúc Thư Mục Module)

```text
backend/
├── app/
│   └── domain/
│       └── simulator/
│           ├── __init__.py
│           ├── env.py               # Gymnasium environment class: SQLStudentEnv
│           ├── bkt.py               # Bayesian Knowledge Tracing engine (P(L), P(T), P(G), P(S))
│           ├── ebbinghaus.py        # Ebbinghaus forgetting & memory strength updates
│           ├── personas.py          # FastLearner, AverageLearner, StrugglingLearner parameter profiles
│           ├── reward.py            # Hàm thưởng cân bằng: Mastery + Retention + ZPD - Frustration - Time
│           ├── baselines.py         # 3 baseline policies: FixedLinearAgent, LeitnerAgent, RuleBasedAgent
│           └── spaces.py            # Observation & Action space definitions + Action Masking logic
└── tests/
    ├── test_cognitive_simulator.py  # Unit tests cho BKT update, Ebbinghaus decay, reward calculation
    └── test_gym_compatibility.py   # Kiểm định tuân thủ gymnasium.utils.env_checker.check_env
```

---

## 4. Mô Hình Hóa Toán Học & Code Snippet (Math & Code Style)

### 4.0. Bảng Tham Số Nhận Thức Cho 3 Nhóm Người Học Ảo (Personas Profiles)

| Tham số nhận thức | Fast Learner (Tiếp thu nhanh) | Average Learner (Bình thường) | Struggling Learner (Cần hỗ trợ) |
|---|:---:|:---:|:---:|
| **$P(L_0)$ (Xác suất biết từ đầu)** | $0.20$ | $0.10$ | $0.05$ |
| **$P(T)$ (Xác suất học được sau 1 bài)** | $0.35$ | $0.18$ | $0.08$ |
| **$P(G)$ (Xác suất đoán mò đúng)** | $0.15$ | $0.20$ | $0.25$ |
| **$P(S)$ (Xác suất làm ẩu dù đã hiểu)** | $0.05$ | $0.10$ | $0.15$ |
| **$S_{\text{base}}$ (Độ bền trí nhớ Ebbinghaus)** | $5.0$ bước | $3.0$ bước | $1.5$ bước |
| **Tốc độ tăng $F_t$ khi làm sai** | $+0.1$ | $+0.2$ | $+0.35$ |

*Ý nghĩa sư phạm:* Mô hình RL bắt buộc phải học được các chiến lược khác nhau cho từng Persona: Với Fast Learner, đẩy nhanh tiến độ sang bài khó; với Struggling Learner, chia nhỏ bước, lặp lại các bài tập giàn giáo (Scaffolding) và hạ độ khó ngay khi $F_t$ chạm ngưỡng $0.5$.

### 4.1. Không gian Trạng thái (Observation Space $\mathcal{S}$)

Với $N = 18$ khái niệm SQL:
$$s_t = \left[ K_t \in [0, 1]^N, \; M_t \in [0, 1]^N, \; H_t \in [0, 1]^4, \; F_t \in [0, 1] \right] \in \mathbb{R}^{2N + 5} = \mathbb{R}^{41}$$

1. $K_t$: Vector xác suất thành thạo từng concept theo BKT.
2. $M_t$: Vector mức độ ghi nhớ theo Ebbinghaus ($M_i(t) = e^{-\Delta t_i / S_i}$).
3. $H_t$: Lịch sử hành vi gần đây:
   - $H_{t, 0}$: Tỷ lệ giải đúng trong 5 lượt gần nhất.
   - $H_{t, 1}$: Tỷ lệ dùng gợi ý trong 5 lượt gần nhất.
   - $H_{t, 2}$: Thời gian trung bình giải bài (chuẩn hóa về $[0, 1]$).
   - $H_{t, 3}$: Tỷ lệ bài tập chẩn đoán vượt qua.
4. $F_t$: Chỉ số ức chế/nản lòng (Frustration index, tăng khi sai $\ge 3$ lần liên tiếp, giảm khi làm đúng).

### 4.2. Không gian Hành động (Action Space $\mathcal{A}$)

Hành động là tuple sư phạm vĩ mô:
$$a_t = \langle c_k, d_m, \text{mode} \rangle$$
- Concept index $c_k \in \{0, 1, \dots, N-1\}$ (18 concepts).
- Difficulty $d_m \in \{0: \text{EASY}, 1: \text{MEDIUM}, 2: \text{HARD}\}$.
- Mode $\in \{0: \text{LEARN\_NEW}, 1: \text{PRACTICE\_REVIEW}, 2: \text{DIAGNOSTIC\_QUIZ}\}$.

Tổng không gian rời rạc: $18 \times 3 \times 3 = 162$ discrete actions.

**Action Masking ($M(s_t) \in \{0, 1\}^{162}$):**
- Hành động bị vô hiệu hóa ($Mask = 0$) nếu:
  1. $c_k$ có điều kiện tiên quyết mà $K_{\text{prereq}} < 0.7$ (Chưa mở khóa kiến thức nền).
  2. Mode là `LEARN_NEW` nhưng $K_{c_k} \ge 0.85$ (Đã thành thạo rồi thì không thể "học mới").
  3. Mode là `PRACTICE_REVIEW` nhưng chưa từng học $c_k$ ($K_{c_k} \le P(L_0)$).
- **Chống Deadlock (Terminal State):** Khi toàn bộ $N$ concepts đều đạt $K_i \ge 0.85$ và $M_i \ge 0.9$, tập action mới hết giá trị. Tránh infinite loop, cấu hình `max_steps_per_episode` để ngắt.

### 4.3. Hàm Phần Thưởng (Reward Function $\mathcal{R}$)

$$\mathcal{R}_t = w_1 \cdot \Delta \text{Mastery} + w_2 \cdot \Delta \text{Retention} + w_3 \cdot \mathcal{R}_{\text{ZPD}} - w_4 \cdot \text{Penalty}_{\text{Frustration}} - w_5 \cdot \text{Penalty}_{\text{Step}}$$

- $\Delta \text{Mastery} = \sum_{i=1}^N (K_i(t+1) - K_i(t))$.
- $\Delta \text{Retention}$: Thưởng $+1.0$ khi ôn tập concept có $M_i(t) < 0.6$ và thành công phục hồi $M_i(t+1) \to 1.0$.
- $\mathcal{R}_{\text{ZPD}}$: Thưởng $+0.5$ nếu độ khó $d_m$ tương thích với trình độ học viên (tỷ lệ đúng kỳ vọng nằm trong $70\% - 85\%$).
- $\text{Penalty}_{\text{Frustration}}$: Phạt $-1.5 \times F_t$ nếu để học viên rơi vào nản lòng ($F_t > 0.6$).
- $\text{Penalty}_{\text{Step}}$: Phạt $-0.05$ mỗi bước để tối ưu hóa thời gian đạt trạng thái hoàn thành.

### 4.4. Code Triển Khai Minh Họa

```python
import gymnasium as gym
from gymnasium import spaces
import numpy as np

class SQLStudentEnv(gym.Env):
    metadata = {"render_modes": ["human"]}

    def __init__(self, kg_data: dict, persona_type: str = "average"):
        super().__init__()
        self.num_concepts = len(kg_data["concepts"])
        
        # State vector: [Mastery (N), Memory (N), History (4), Frustration (1)]
        self.observation_space = spaces.Box(
            low=0.0, high=1.0, shape=(self.num_concepts * 2 + 5,), dtype=np.float32
        )
        # Discrete action: 18 concepts * 3 difficulties * 3 modes = 162
        self.action_space = spaces.Discrete(self.num_concepts * 3 * 3)
        
    def step(self, action: int):
        concept_idx, diff_idx, mode_idx = self._decode_action(action)
        # Cập nhật BKT, Ebbinghaus và tính reward
        # ...
        return obs, reward, terminated, truncated, info
```

---

## 5. Testing Strategy (Chiến Lược Kiểm Thử)

1. **Gymnasium Compliance (`test_gym_compatibility.py`):**
   - Chạy hàm `gymnasium.utils.env_checker.check_env(env)` để kiểm tra 100% tuân thủ giao thức reset, step, observation/action space boundaries.
2. **BKT Monotonicity Test:**
   - Khi học viên trả lời đúng bài tập về concept $A$, xác suất $P(L_A)$ phải tăng đơn điệu.
   - Khi học viên trả lời sai, $P(L_A)$ phải giảm và tiệm cận về 0 (không bị chặn dưới bởi xác suất đoán mò $P(G)$).
3. **Ebbinghaus Decay Test:**
   - Trải qua 10 bước mô phỏng không tương tác với concept $A$, $M_A(t)$ phải suy giảm theo hàm mũ rõ rệt.
4. **Action Masking Integrity Test:**
   - Không một hành động nào vi phạm tiên quyết mà có $Mask = 1$.
5. **Baseline Agent Benchmark Runs:**
   - Fixed Linear Agent, Leitner Agent, và Rule-based Agent phải hoàn thành được 100 episodes kiểm thử không gặp exception.

---

## 6. Boundaries (Ranh Giới Phát Triển)

- **Always:**
  - Thiết lập random seed (`seed()`) nhất quán cho mọi thử nghiệm để bảo đảm kết quả đối chuẩn có thể tái lập 100% (Reproducibility).
  - Ghi log chi tiết từng episode (tổng reward, số bước đến khi đạt $K \ge 0.85$ toàn bộ concepts, số lần kích hoạt nản lòng).
- **Ask first:**
  - Thay đổi trọng số hàm thưởng $w_1, \dots, w_5$ (ảnh hưởng trực tiếp đến hành vi hội tụ của RL).
  - Thay đổi các hệ số BKT cơ bản của các nhóm Personas.
- **Never:**
  - Cho phép biến trạng thái vượt ngoài khoảng $[0.0, 1.0]$.
  - Để thuật toán rơi vào vòng lặp vô tận (bắt buộc cấu hình `max_steps_per_episode = 150`).

---

## 7. Success Criteria (Tiêu Chí Nghiệm Thu)

1. Vượt qua kiểm định chuẩn của Gymnasium (`check_env(SQLStudentEnv)` pass không cảnh báo).
2. Mô phỏng 10.000 episodes với 3 baseline agents diễn ra trong thời gian $< 30$ giây trên CPU.
3. Xuất ra được bảng so sánh thống kê sơ bộ giữa 3 Baselines về các chỉ số: Số bước hoàn thành trung bình (Steps to Mastery), Tỷ lệ duy trì trí nhớ (Retention Rate), và Tần suất nản lòng (Frustration Occurrences).
