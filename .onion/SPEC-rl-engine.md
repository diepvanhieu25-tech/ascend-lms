# Spec: Module `rl-engine`

> **Module ID:** `rl-engine`  
> **Trạng thái:** Đặc tả chi tiết (Approved Specification)  
> **Tài liệu cha:** [Capability Map](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/capability-map.md) | [SPEC: cognitive-simulator](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/SPEC-cognitive-simulator.md)  
> **Phiên bản:** 1.0.0

---

## 1. Objective (Mục Tiêu & Trách Nhiệm Cốt Lõi)

Module `rl-engine` là **trái tim học thuật và trí tuệ nhân tạo** của toàn bộ đề tài tốt nghiệp:
1. **Thuật toán Học tăng cường (Reinforcement Learning):** Huấn luyện mô hình RL Macro Recommender ứng dụng thuật toán **`MaskablePPO`** (từ `sb3-contrib` dựa trên nền tảng `Stable-Baselines3`) tương tác trực tiếp với môi trường giả lập nhận thức `SQLStudentEnv`.
2. **Cơ chế Action Masking Động ($M(s_t) \in \{0, 1\}^{162}$):** Ngăn chặn hoàn toàn việc Agent gợi ý các kỹ năng nhảy cóc khi chưa mở khóa tiên quyết trên Đồ thị tri thức DAG, hoặc gợi ý học mới một kỹ năng mà học viên đã thành thạo ($K_i \ge 0.85$).
3. **Thực nghiệm Đối chuẩn Khoa học (Benchmarking Pipeline):**
   - Chạy mô phỏng 100.000 episodes trên 3 nhóm học viên ảo (Fast, Average, Struggling Learner).
   - So sánh trực tiếp mô hình RL với 3 Baselines: **Fixed Linear** (Lộ trình cố định truyền thống), **Leitner Spaced Repetition** (Ôn tập chu kỳ cố định), và **Rule-Based Heuristic** (Đúng lên lớp, sai lặp lại).
   - Kiểm định giả thuyết thống kê bằng **Student's $t$-test** và chỉ số **$p$-value ($p < 0.05$)**, tính kích thước hiệu ứng **Cohen's $d$** để đưa vào Chương 4 Luận văn tốt nghiệp.
4. **Đóng gói Suy luận Tốc độ cao (Production Policy Export):**
   - Chuyển đổi mô hình PyTorch đã huấn luyện sang định dạng **ONNX (`rl_policy_ppo.onnx`)**.
   - Cung cấp dịch vụ suy luận phi trạng thái (Stateless Inference) chạy trên CPU với độ trễ $< 20$ms để tích hợp trực tiếp vào `lms-backend`.

---

## 2. Commands (Lệnh Thực Thi Chuẩn)

```bash
# Kích hoạt môi trường backend
cd backend && source .venv/bin/activate

# 1. Chạy huấn luyện mô hình MaskablePPO (100.000 timesteps)
python -m app.ai.rl.train --timesteps 100000 --seed 42 --save-path models/ppo_student_agent.zip

# 2. Chạy pipeline đối chuẩn thực nghiệm (RL vs 3 Baselines) & xuất báo cáo thống kê
python -m app.ai.rl.benchmark --episodes 1000 --output-dir reports/benchmark_results/

# 3. Export mô hình đã train sang định dạng ONNX phục vụ backend
python -m app.ai.rl.export_onnx --input models/ppo_student_agent.zip --output models/rl_policy_ppo.onnx

# 4. Chạy toàn bộ test kiểm định mô hình RL và ONNX parity
pytest tests/test_rl_engine.py -v --durations=10

# 5. Kiểm tra kiểu tĩnh và linting
mypy app/ai/rl --strict
ruff check app/ai/rl tests/test_rl_engine.py
```

---

## 3. Project Structure (Cấu Trúc Thư Mục Module)

```text
backend/
├── app/
│   └── ai/
│       └── rl/
│           ├── __init__.py
│           ├── agent.py             # Wrapper cho MaskablePPO policy & Action Masking
│           ├── train.py             # Script huấn luyện với TensorBoard logging & checkpoints
│           ├── benchmark.py         # Chạy đối chuẩn 100k episodes (RL vs Linear/Leitner/Rule)
│           ├── stats.py             # Phân tích thống kê: t-test, p-value, Cohen's d, CI 95%
│           ├── export_onnx.py       # Chuyển đổi PyTorch Actor network sang ONNX model
│           └── inference.py        # Stateless ONNXRuntime session engine cho Backend (< 20ms)
├── models/
│   ├── ppo_student_agent.zip        # Checkpoint huấn luyện PyTorch SB3
│   └── rl_policy_ppo.onnx           # Lightweight ONNX artifact phục vụ production
├── reports/
│   └── benchmark_results/           # CSV và biểu đồ SVG/PNG hội tụ reward, steps to mastery
└── tests/
    └── test_rl_engine.py            # Unit tests cho Masking, Export parity, và Inference
```

---

## 4. Mô Hình Toán Học, Tham Số & Mã Nguồn Chuẩn Mực

### 4.1. Thuật Toán MaskablePPO & Hàm Mục Tiêu

Thuật toán tối ưu hóa chính sách cận biên với mặt nạ hành động (Action-Masked Proximal Policy Optimization):
$$L^{\text{CLIP}}(\theta) = \hat{\mathbb{E}}_t \left[ \min \left( r_t(\theta) \hat{A}_t, \; \text{clip}(r_t(\theta), 1 - \epsilon, 1 + \epsilon) \hat{A}_t \right) \right]$$

Trong đó:
- $r_t(\theta) = \frac{\pi_\theta(a_t | s_t)}{\pi_{\theta_{\text{old}}}(a_t | s_t)}$ là tỷ số xác suất chính sách.
- $\hat{A}_t$ là hàm lợi thế ước lượng qua Generalized Advantage Estimation (GAE).
- **Mặt nạ hành động (Invalid Action Masking):** Với vector nhị phân $M(s_t) \in \{0, 1\}^{162}$, xác suất của các hành động bị cấm được gán logits $= -\infty$ trước khi qua Softmax:
  $$\pi(a_i | s_t) = \frac{e^{z_i} \cdot M_i(s_t)}{\sum_{j=1}^{162} e^{z_j} \cdot M_j(s_t)}$$

### 4.2. Bảng Siêu Tham Số Huấn Luyện (Hyperparameters)

| Siêu tham số | Giá trị lựa chọn | Cơ sở lý luận / Rationale |
|---|---|---|
| **Thuật toán** | `MaskablePPO` (`sb3-contrib`) | Xử lý hoàn hảo không gian rời rạc có ràng buộc tiên quyết DAG |
| **Learning Rate ($\alpha$)** | $3 \times 10^{-4}$ (Linear decay) | Ổn định gradient, tránh phá vỡ policy ở các step đầu |
| **Discount Factor ($\gamma$)** | $0.99$ | Ưu tiên mục tiêu dài hạn (duy trì trí nhớ và hoàn thành toàn bộ môn) |
| **GAE Parameter ($\lambda$)** | $0.95$ | Giảm phương sai cho ước lượng hàm lợi thế |
| **Clip Range ($\epsilon$)** | $0.2$ | Ngăn chặn cập nhật chính sách quá lớn gây bất ổn định |
| **Entropy Coeff ($c_2$)** | $0.01$ | Khuyến khích khám phá không gian bài tập mới ở giai đoạn đầu |
| **Batch Size / n_steps** | $64$ / $2048$ | Cập nhật sau mỗi $2048$ tương tác trên mô phỏng |
| **Total Timesteps** | $100.000$ steps | Đủ để mô hình hội tụ trên cả 3 nhóm Persona |

### 4.3. Code Triển Khai Mẫu: Huấn Luyện & Xuất ONNX

```python
import numpy as np
import torch
import onnx
import onnxruntime as ort
from sb3_contrib import MaskablePPO
from sb3_contrib.common.maskable.utils import get_action_masks
from app.domain.simulator.env import SQLStudentEnv

class RLEngine:
    def __init__(self, model_path: str = "models/rl_policy_ppo.onnx"):
        self.ort_session = ort.InferenceSession(
            model_path, 
            providers=["CPUExecutionProvider"]
        )
        self.input_name = self.ort_session.get_inputs()[0].name
        self.output_name = self.ort_session.get_outputs()[0].name

    def predict_action(self, state_vector: np.ndarray, action_mask: np.ndarray) -> int:
        """
        Dự đoán hành động tối ưu với độ trễ < 15ms trên CPU.
        state_vector: shape (41,)
        action_mask: shape (162,)
        """
        # Chuẩn hóa đầu vào
        state_input = state_vector.astype(np.float32).reshape(1, -1)
        
        # Chạy inference ONNX
        logits = self.ort_session.run([self.output_name], {self.input_name: state_input})[0][0]
        
        # Áp dụng Action Masking: gán -inf cho hành động không hợp lệ
        masked_logits = np.where(action_mask == 1, logits, -1e9)
        
        # Chọn hành động có xác suất cao nhất (Greedy Policy for Production)
        action = int(np.argmax(masked_logits))
        return action
```

---

## 5. Testing Strategy (Chiến Lược Kiểm Thử & Nghiệm Thu)

1. **Kiểm tra Tính Toàn vẹn của Action Masking (`test_action_masking_integrity`):**
   - Khẳng định 100%: Agent **không bao giờ** chọn một hành động có $Mask = 0$.
   - Khi chạy 1000 bước với chính sách ngẫu nhiên có mask, không xuất hiện bất kỳ hành động nào vi phạm tiên quyết DAG.
2. **Kiểm tra Độ tương đương PyTorch vs ONNX (`test_onnx_parity`):**
   - Chạy 100 vector trạng thái ngẫu nhiên qua cả 2 mô hình (PyTorch gốc và ONNX export).
   - Độ lệch giá trị logits tối đa $\max |z_{\text{pytorch}} - z_{\text{onnx}}| < 10^{-5}$.
3. **Kiểm tra Tốc độ Suy luận CPU (`test_inference_speed`):**
   - Thực hiện 1.000 lượt suy luận liên tiếp trên CPU.
   - Thời gian xử lý trung bình mỗi lượt phải đạt $< 15$ms (ngưỡng chấp nhận $< 30$ms).
4. **Kiểm định Thống kê Vượt trội Khoa học (`test_benchmark_significance`):**
   - Kết quả đối chuẩn sau 1.000 episodes độc lập:
     - Số bước đạt thành thạo (Steps to Mastery) của MaskablePPO phải ít hơn Fixed Linear $\ge 20\%$.
     - Kiểm định giả thuyết hai mẫu $t$-test giữa RL và Heuristic phải có $p$-value $< 0.01$.

---

## 6. Boundaries (Ranh Giới Phát Triển)

- **Always:**
  - Cố định `random_seed = 42` trong mọi script huấn luyện và đánh giá đối chuẩn để bảo đảm khả năng tái lập kết quả khoa học 100%.
  - Luôn kiểm tra tính hợp lệ của Action Mask trước khi cho phép mô hình đưa ra quyết định.
  - Sử dụng ONNX Runtime CPU Provider cho production Backend, tuyệt đối không tải toàn bộ framework PyTorch nặng nề vào luồng API của FastAPI.
- **Ask first:**
  - Thay đổi kiến trúc mạng nơ-ron (Mặc định: MLP 2 lớp ẩn $[64, 64]$ với hàm kích hoạt Tanh).
  - Thay đổi định nghĩa không gian hành động rời rạc 162 actions.
- **Never:**
  - Huấn luyện trực tiếp online trên người dùng thật (chỉ dùng pre-trained policy từ mô phỏng).
  - Bỏ qua bước kiểm định $t$-test khi công bố kết quả đồ án.
  - Cho phép xuất file ONNX có kích thước vượt quá 50MB (mô hình tối ưu chỉ khoảng 1-2MB).

---

## 7. Success Criteria (Tiêu Chí Nghiệm Thu)

1. Mô hình `MaskablePPO` hoàn thành huấn luyện 100.000 timesteps mà không gặp lỗi phân kỳ gradient hay NaN.
2. File mô hình ONNX `models/rl_policy_ppo.onnx` được xuất thành công, dung lượng $< 5$MB, độ trễ suy luận $< 15$ms.
3. Xuất bản báo cáo đối chuẩn khoa học `reports/benchmark_results/summary.csv` với đầy đủ các cột: Model Name, Mean Steps to Mastery, Final Retention Rate, Frustration Rate, và $p$-value so với Baseline.
