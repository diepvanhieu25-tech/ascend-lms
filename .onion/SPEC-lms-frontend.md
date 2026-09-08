# Spec: Module `lms-frontend`

> **Module ID:** `lms-frontend`  
> **Trạng thái:** Đặc tả chi tiết (Approved Specification)  
> **Tài liệu cha:** [Capability Map](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/capability-map.md) | [API Contracts](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/API-CONTRACTS.md) | [System Architecture](file:///home/diepvanhieu/workspace/adaptive-learning-sql/.onion/SYSTEM-ANALYSIS-ARCHITECTURE.md)  
> **Phiên bản:** 1.0.0

---

## 1. Objective (Mục Tiêu & Trách Nhiệm Cốt Lõi)

Module `lms-frontend` phụ trách **toàn bộ giao diện người dùng và trải nghiệm học tập không ma sát (Zero-Friction UX)**, được xây dựng trên nền tảng **Next.js 14+ (App Router), React, TypeScript, Tailwind CSS và Shadcn/ui**:

1. **Khởi Động Nhanh & Đánh Giá Năng Lực Đầu Vào (Onboarding & Calibration Screen):**
   - Hỗ trợ vào học tức thì qua Guest Session 1-chạm mà không bị gián đoạn bởi form đăng ký.
   - Giao diện làm bài kiểm tra thích ứng đầu vào (Adaptive Placement Test 5 phút) hoặc tự chọn profile kèm cửa sổ trắc nghiệm phản xạ 30s (Calibration Mini-Check).
2. **Cây Kỹ Năng Mạng Lưới Trực Quan (Interactive Skill Tree với `@xyflow/react`):**
   - Hiển thị toàn bộ Đồ thị tri thức DAG 18 concepts dạng mạng lưới trực quan.
   - Màu sắc node phản ánh động theo trạng thái BKT và Ebbinghaus thời gian thực:
     - **Màu Xanh lá:** Đã thành thạo ($K_i \ge 0.85$).
     - **Màu Vàng:** Đang học / Cần ôn tập ngắt quãng ($K_i < 0.85$ hoặc $M_i < 0.6$).
     - **Màu Đỏ Cam:** Đang gặp bế tắc / Tỷ lệ nản lòng cao ($F_t \ge 0.6$).
     - **Màu Xám:** Chưa mở khóa (Chưa đạt điều kiện tiên quyết $K_{\text{prereq}} < 0.7$).
3. **Không Gian Luyện Code 3 Cột Không Ma Sát (Three-Panel Workspace):**
   - **Cột Trái:** Đề bài, gợi ý bẫy dữ liệu và Bộ xem cấu trúc bảng tương tác (Interactive Schema Viewer - click vào tên cột/tên bảng là tự động copy chèn vào code).
   - **Cột Phải Trên:** Trình soạn thảo **Monaco Editor** hỗ trợ highlight cú pháp SQL, gợi ý phím tắt chuẩn `Ctrl + Enter` (hoặc `Cmd + Enter`), và tự động lưu nháp code mỗi 2s vào `localStorage`.
   - **Cột Phải Dưới:** Bộ chạy truy vấn tức thì qua Web Worker SQLite WASM ($< 20$ms) kèm **Trình so khớp kết quả Diff Table** trực quan (Xanh: khớp, Đỏ: dòng/cột thiếu hoặc thừa).
4. **Trợ Lý Socratic & Thẻ Giải Thích Minh Bạch (XAI Card & Progressive Hints):**
   - **Thẻ XAI (Explainable AI Card):** Minh bạch lý do sư phạm vì sao mô hình RL đề xuất bài tập này.
   - **Ngăn Kéo Gợi Ý 3 Cấp Độ (Progressive Hint Drawer):** Mức 1 (Ý tưởng/Mệnh đề) $\to$ Mức 2 (Khung điền chỗ trống) $\to$ Mức 3 (Lời giải chi tiết từng dòng).
5. **Giao Diện Phòng Thủ Gian Lận AI (Anti-Ghost Mastery UI):**
   - Bộ thu thập Telemetry chạy ngầm (lắng nghe sự kiện paste, gõ phím, chuyển tab).
   - Cửa sổ phản xạ ngắn **Spot-Check Modal 30s** với thanh đếm ngược thời gian kịch tính khi phát hiện dấu hiệu copy-paste bất thường.
6. **Chế Độ Phỏng Vấn Thử Giả Lập (Mock Technical Interview):**
   - Giao diện phòng phỏng vấn kỹ thuật có đồng hồ đếm ngược, tình huống bài toán thực tế kết hợp câu hỏi tối ưu hóa `EXPLAIN QUERY PLAN`.
7. **Bảng Điều Khiển Quản Trị & Giám Sát Sư Phạm (Admin Analytics Dashboard):**
   - Biểu đồ Bản đồ nhiệt nản lòng (Frustration Heatmap) và Theo dõi độ trôi mô hình (Model Drift).

---

## 2. Commands (Lệnh Thực Thi Chuẩn)

```bash
# Cài đặt thư viện phụ thuộc
cd frontend && npm install

# Khởi chạy ứng dụng Next.js môi trường phát triển (Dev)
npm run dev

# Kiểm thử đơn vị (Unit & Component Tests với Vitest)
npm run test

# Kiểm tra kiểu dữ liệu TypeScript (Strict Check)
npm run type-check

# Linter và format code
npm run lint

# Build bản phát hành Production
npm run build
```

---

## 3. Project Structure (Cấu Trúc Thư Mục Module)

```text
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root Layout, ThemeProvider, ToastProvider
│   │   ├── page.tsx                     # Landing page & 1-click Guest Entry
│   │   ├── onboarding/
│   │   │   └── page.tsx                 # Placement Test & Calibration Mini-check UI
│   │   ├── learn/
│   │   │   └── [exerciseId]/page.tsx    # 3-Panel Workspace chính (Editor + Diff + Schema)
│   │   ├── skill-tree/
│   │   │   └── page.tsx                 # Cây kỹ năng mạng lưới @xyflow/react
│   │   ├── interview/
│   │   │   └── page.tsx                 # Chế độ Mock Technical Interview
│   │   └── admin/
│   │       └── page.tsx                 # Dashboard Frustration Heatmap & Model Drift
│   ├── components/
│   │   ├── editor/
│   │   │   ├── MonacoSQLEditor.tsx      # Monaco Editor với phím tắt Ctrl+Enter & Auto-save
│   │   │   ├── SchemaViewer.tsx         # Click-to-insert table/column names
│   │   │   └── ResultDiffTable.tsx      # Bảng kết quả so sánh Diff màu sắc
│   │   ├── skill-tree/
│   │   │   ├── ConceptNode.tsx          # Custom node cho React Flow đổi màu theo BKT
│   │   │   └── SkillTreeFlow.tsx        # Container điều phối đồ thị DAG
│   │   ├── xai/
│   │   │   └── XAICard.tsx              # Thẻ giải thích lý do sư phạm của RL Agent
│   │   ├── hints/
│   │   │   └── ProgressiveHintDrawer.tsx# Drawer gợi ý 3 cấp độ
│   │   ├── modals/
│   │   │   ├── SpotCheckModal.tsx       # Modal bẫy phản xạ 30s chống Ghost Mastery
│   │   │   └── CalibrationModal.tsx     # Modal xác thực trình độ tự chọn 30s
│   │   └── ui/                          # Shadcn/ui primitives (Button, Dialog, Badge,...)
│   ├── hooks/
│   │   ├── useSQLiteWorker.ts           # Hook giao tiếp Web Worker chạy sql.js client-side
│   │   ├── useTelemetry.ts              # Hook bắt sự kiện gõ phím, dán code, chuyển tab
│   │   └── useAutoSaveDraft.ts          # Hook lưu nháp code vào localStorage mỗi 2s
│   ├── lib/
│   │   ├── api-client.ts                # Fetch wrapper gọi FastAPI Backend v1 kèm JWT
│   │   └── error-explainer.ts           # Dịch lỗi SQLite sang tiếng Việt thân thiện
│   └── workers/
│       ├── sqlite.worker.ts             # Web Worker chạy SQLite WebAssembly
│       └── sql-wasm.wasm                # SQLite compiled binary file
├── package.json
└── tsconfig.json
```

---

## 4. Code Triển Khai Mẫu: Web Worker Hook & Custom Skill Node

### 4.1. Hook Giao Tiếp Web Worker SQLite WASM (`useSQLiteWorker.ts`)

```typescript
import { useState, useEffect, useRef, useCallback } from 'react';

export interface QueryResult {
  columns: string[];
  values: any[][];
  executionTimeMs: number;
  error?: string;
}

export function useSQLiteWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Khởi tạo Web Worker chạy riêng biệt ngoài Main UI Thread
    workerRef.current = new Worker(
      new URL('../workers/sqlite.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (event) => {
      if (event.data.type === 'READY') {
        setIsReady(true);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const runQuery = useCallback(
    (sql: string, ddl: string, seedSql: string): Promise<QueryResult> => {
      return new Promise((resolve) => {
        if (!workerRef.current) {
          return resolve({ columns: [], values: [], executionTimeMs: 0, error: 'Worker chưa sẵn sàng' });
        }

        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'QUERY_RESULT') {
            workerRef.current?.removeEventListener('message', handleMessage);
            resolve(event.data.payload);
          }
        };

        workerRef.current.addEventListener('message', handleMessage);
        workerRef.current.postMessage({
          type: 'EXECUTE',
          payload: { sql, ddl, seedSql }
        });
      });
    },
    []
  );

  return { isReady, runQuery };
}
```

### 4.2. Custom Node React Flow Cho Cây Kỹ Năng (`ConceptNode.tsx`)

```typescript
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';

export interface ConceptNodeData {
  name: string;
  bloomLevel: number;
  masteryProb: number;
  retentionStrength: number;
  status: 'MASTERED' | 'NEEDS_REVIEW' | 'STRUGGLING' | 'LOCKED';
}

export const ConceptNode = memo(({ data }: { data: ConceptNodeData }) => {
  const getStatusStyle = () => {
    switch (data.status) {
      case 'MASTERED':
        return 'border-emerald-500 bg-emerald-950/40 text-emerald-300 shadow-emerald-500/20';
      case 'NEEDS_REVIEW':
        return 'border-amber-500 bg-amber-950/40 text-amber-300 shadow-amber-500/20 animate-pulse';
      case 'STRUGGLING':
        return 'border-rose-500 bg-rose-950/40 text-rose-300 shadow-rose-500/20';
      case 'LOCKED':
      default:
        return 'border-slate-700 bg-slate-900/60 text-slate-500 opacity-60';
    }
  };

  return (
    <div className={`px-4 py-3 rounded-xl border-2 shadow-lg backdrop-blur-md transition-all ${getStatusStyle()}`}>
      <Handle type="target" position={Position.Top} className="!bg-slate-500" />
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-sm">{data.name}</span>
        <Badge variant="outline" className="text-xs">Bloom L{data.bloomLevel}</Badge>
      </div>
      <div className="mt-2 text-xs flex items-center justify-between text-slate-400">
        <span>Thành thạo: {Math.round(data.masteryProb * 100)}%</span>
        <span>Ghi nhớ: {Math.round(data.retentionStrength * 100)}%</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-500" />
    </div>
  );
});
```

---

## 5. Testing Strategy (Chiến Lược Kiểm Thử Giao Diện)

1. **Kiểm Thử Tương Tác Trình Soạn Thảo (Monaco Editor Tests):**
   - Phím tắt `Ctrl + Enter` kích hoạt hàm `runQuery` thành công.
   - Nhập code $\to$ Kiểm tra `localStorage` ghi nhận chuỗi nháp sau 2 giây.
2. **Kiểm Thử Bảng Diff Viewer:**
   - Kết quả thừa dòng $\to$ Bảng bôi đỏ dòng thừa kèm nhãn rõ ràng.
   - Kết quả đúng toàn bộ $\to$ Bảng hiển thị thông báo chúc mừng màu xanh lá.
3. **Kiểm Thử Accessibility (A11y với `@axe-core`):**
   - Chạy kiểm thử tự động đảm bảo độ tương phản màu sắc đạt chuẩn WCAG 2.1 AA.
   - Các modal (Spot-Check, Calibration) hỗ trợ đóng/mở chuẩn bằng phím `Escape` và điều hướng bàn phím `Tab`.

---

## 6. Boundaries (Ranh Giới Phát Triển)

- **Always:**
  - Chạy toàn bộ câu truy vấn SQL trong Web Worker, tuyệt đối không chạy trên Main UI Thread.
  - Tự động lưu nháp code học viên vào `localStorage` để chống mất dữ liệu khi mất mạng hoặc reload trang. **Bắt buộc có cơ chế Hydration:** Khi F5/Reload, nếu có draft code, phải gửi lại `schema_ddl` và `seed_data_sql` cho Web Worker để tái tạo lại CSDL in-memory trước khi cho phép chạy code.
  - Hiển thị Thẻ giải thích XAI minh bạch mỗi khi có bài tập mới do AI đề xuất.
- **Ask first:**
  - Thay đổi thư viện Cây kỹ năng (Mặc định: `@xyflow/react`).
  - Thay đổi bố cục 3 cột của Workspace luyện tập.
- **Never:**
  - Để lộ đáp án bài tập hoặc seed bẫy dữ liệu ở mã nguồn client-side trước khi học sinh nộp bài.
  - Gây giật lag giao diện người dùng khi đồ thị Cây kỹ năng hiển thị nhiều node.

---

## 7. Success Criteria (Tiêu Chí Nghiệm Thu)

1. Chỉ số hiệu năng Lighthouse trên máy tính: **Performance $\ge 90$**, **Accessibility $\ge 95$**, **LCP $< 2.5$s**.
2. Thời gian thực thi truy vấn và render bảng kết quả qua Web Worker đạt $< 20$ms trên Chrome, Firefox và Edge.
3. Giao diện Cây kỹ năng `@xyflow/react` tương tác mượt mà (60 FPS) khi zoom, pan và chuyển đổi trạng thái node.
