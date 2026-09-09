'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSQLiteWorker, QueryResult } from '@/hooks/useSQLiteWorker';
import { Play, Database, Table, Sparkles, RefreshCw, Zap, Clock, Code2 } from 'lucide-react';

const MonacoSQLEditor = dynamic(
  () => import('@/components/editor/MonacoSQLEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-slate-900/50 text-slate-500 font-mono text-xs rounded-lg border border-slate-800">
        Đang nạp Monaco Editor...
      </div>
    ),
  }
);

const SAMPLE_DDL = `
CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  price REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS learners (
  id INTEGER PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  level TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INTEGER PRIMARY KEY,
  learner_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  score INTEGER,
  enrolled_at TEXT NOT NULL,
  FOREIGN KEY (learner_id) REFERENCES learners(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
`;

const SAMPLE_SEED = `
INSERT OR IGNORE INTO courses (id, title, category, difficulty, price) VALUES
  (1, 'SQL Cơ Bản Cho Người Mới', 'Database', 'BEGINNER', 0.0),
  (2, 'Truy Vấn Nâng Cao & Tối Ưu JOIN', 'Database', 'INTERMEDIATE', 49.99),
  (3, 'Thiết Kế CSDL & Indexing Chuyên Sâu', 'Database', 'ADVANCED', 99.0),
  (4, 'Phân Tích Dữ Liệu Với Window Functions', 'Data Analytics', 'ADVANCED', 79.5);

INSERT OR IGNORE INTO learners (id, full_name, email, level) VALUES
  (101, 'Nguyễn Văn An', 'an.nguyen@example.com', 'INTERMEDIATE'),
  (102, 'Trần Thị Bình', 'binh.tran@example.com', 'ADVANCED'),
  (103, 'Lê Hoàng Cường', 'cuong.le@example.com', 'BEGINNER'),
  (104, 'Phạm Minh Đức', 'duc.pham@example.com', 'INTERMEDIATE');

INSERT OR IGNORE INTO enrollments (id, learner_id, course_id, score, enrolled_at) VALUES
  (1, 101, 1, 95, '2026-09-01'),
  (2, 101, 2, 88, '2026-09-03'),
  (3, 102, 2, 92, '2026-09-04'),
  (4, 102, 3, 85, '2026-09-05'),
  (5, 103, 1, 78, '2026-09-02'),
  (6, 104, 2, 82, '2026-09-06'),
  (7, 104, 4, 90, '2026-09-08');
`;

interface SamplePreset {
  id: string;
  name: string;
  description: string;
  sql: string;
}

const PRESETS: SamplePreset[] = [
  {
    id: 'ping',
    name: '1. Ping & Kiểm tra tốc độ',
    description: 'Truy vấn SELECT 1 cơ bản để đo độ trễ Worker',
    sql: 'SELECT 1 AS status, "Web Worker SQLite WASM Đang Hoạt Động" AS message, CURRENT_TIMESTAMP AS server_time;',
  },
  {
    id: 'filter',
    name: '2. Lọc & Sắp xếp (WHERE + ORDER BY)',
    description: 'Lấy các khóa học có học phí <= 50 USD',
    sql: 'SELECT id, title, category, difficulty, price \nFROM courses \nWHERE price <= 50 \nORDER BY price ASC;',
  },
  {
    id: 'join',
    name: '3. Nối nhiều bảng (Multi-Table JOIN)',
    description: 'Xem thông tin học viên, tên khóa học và điểm số',
    sql: 'SELECT \n  l.full_name AS hoc_vien,\n  c.title AS khoa_hoc,\n  e.score AS diem_so,\n  e.enrolled_at AS ngay_hoc\nFROM enrollments e\nJOIN learners l ON e.learner_id = l.id\nJOIN courses c ON e.course_id = c.id\nORDER BY e.score DESC;',
  },
  {
    id: 'aggregate',
    name: '4. Thống kê gom nhóm (GROUP BY & AGGREGATE)',
    description: 'Đếm số học viên và tính điểm trung bình từng khóa',
    sql: 'SELECT \n  c.title AS khoa_hoc,\n  COUNT(e.id) AS tong_hoc_vien,\n  ROUND(AVG(e.score), 1) AS diem_trung_binh,\n  MAX(e.score) AS diem_cao_nhat\nFROM courses c\nLEFT JOIN enrollments e ON c.id = e.course_id\nGROUP BY c.id, c.title\nORDER BY tong_hoc_vien DESC;',
  },
  {
    id: 'explain',
    name: '5. Kế hoạch thực thi (EXPLAIN QUERY PLAN)',
    description: 'Phân tích cách SQLite duyệt bảng và quét dữ liệu',
    sql: 'EXPLAIN QUERY PLAN\nSELECT l.full_name, c.title\nFROM enrollments e\nJOIN learners l ON e.learner_id = l.id\nJOIN courses c ON e.course_id = c.id\nWHERE e.score >= 90;',
  },
];

const SCHEMA_DEFINITIONS = [
  {
    table: 'courses',
    columns: [
      { name: 'id', type: 'INTEGER (PK)' },
      { name: 'title', type: 'TEXT' },
      { name: 'category', type: 'TEXT' },
      { name: 'difficulty', type: 'TEXT' },
      { name: 'price', type: 'REAL' },
    ],
  },
  {
    table: 'learners',
    columns: [
      { name: 'id', type: 'INTEGER (PK)' },
      { name: 'full_name', type: 'TEXT' },
      { name: 'email', type: 'TEXT' },
      { name: 'level', type: 'TEXT' },
    ],
  },
  {
    table: 'enrollments',
    columns: [
      { name: 'id', type: 'INTEGER (PK)' },
      { name: 'learner_id', type: 'INTEGER (FK)' },
      { name: 'course_id', type: 'INTEGER (FK)' },
      { name: 'score', type: 'INTEGER' },
      { name: 'enrolled_at', type: 'TEXT' },
    ],
  },
];

export default function SQLitePoCPage() {
  const { isReady, runQuery } = useSQLiteWorker();
  const [sqlCode, setSqlCode] = useState(PRESETS[0].sql);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);

  // Initialize Sample Database (DDL + Seed Data) on mount when Worker is ready
  const initializeDatabase = useCallback(async () => {
    if (!isReady) return;
    setLoading(true);
    try {
      await runQuery(PRESETS[0].sql, SAMPLE_DDL, SAMPLE_SEED);
      setDbInitialized(true);
    } finally {
      setLoading(false);
    }
  }, [isReady, runQuery]);

  useEffect(() => {
    if (isReady && !dbInitialized) {
      initializeDatabase();
    }
  }, [isReady, dbInitialized, initializeDatabase]);

  const handleExecute = async () => {
    if (!sqlCode.trim()) return;
    setLoading(true);
    try {
      const res = await runQuery(sqlCode);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset: SamplePreset) => {
    setSqlCode(preset.sql);
  };

  const handleInsertColumn = (colName: string) => {
    setSqlCode((prev) => prev + ` ${colName}`);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide flex items-center gap-2">
              Ascend LMS <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">SQLite WASM Sandbox</span>
            </h1>
            <p className="text-xs text-slate-400">Trình thực thi SQL in-memory biệt lập qua Web Worker (Client-side Zero-Latency)</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700">
            <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
            <span>{isReady ? 'Web Worker: Ready' : 'Đang nạp WASM...'}</span>
          </div>

          <button
            onClick={initializeDatabase}
            disabled={!isReady || loading}
            title="Tái lập CSDL mẫu về mặc định"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reset Database</span>
          </button>
        </div>
      </header>

      {/* Main Workspace (3-Panel Grid) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Schema Explorer & Presets (Width: 320px) */}
        <aside className="w-80 border-r border-slate-800 bg-slate-900/40 flex flex-col overflow-y-auto">
          {/* Quick Presets */}
          <div className="p-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Truy Vấn Mẫu Có Sẵn</span>
            </div>
            <div className="space-y-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition border ${
                    sqlCode === p.sql
                      ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300 font-medium'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/70 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">{p.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Database Schema Explorer */}
          <div className="p-4 flex-1">
            <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Cấu Trúc Bảng (In-Memory)</span>
              </div>
              <span className="text-[10px] lowercase text-slate-500 font-normal">click chèn cột</span>
            </div>

            <div className="space-y-3">
              {SCHEMA_DEFINITIONS.map((def) => (
                <div key={def.table} className="rounded-lg border border-slate-800 bg-slate-900/30 overflow-hidden">
                  <div
                    onClick={() => handleInsertColumn(def.table)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 font-mono text-xs font-semibold text-emerald-300 cursor-pointer hover:bg-slate-800 transition"
                  >
                    <Table className="w-3.5 h-3.5 text-slate-400" />
                    <span>{def.table}</span>
                  </div>
                  <div className="p-2 space-y-1">
                    {def.columns.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => handleInsertColumn(c.name)}
                        className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-slate-800 text-[11px] font-mono text-slate-400 hover:text-slate-200 transition"
                      >
                        <span>{c.name}</span>
                        <span className="text-[10px] text-slate-500">{c.type}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Panel: Editor (Top) & Result Table (Bottom) */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Half: Monaco Editor */}
          <div className="flex-1 flex flex-col min-h-[300px] border-b border-slate-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span>Trình Soạn Thảo Monaco (SQL Editor)</span>
                <span className="text-[11px] text-slate-500 font-normal ml-2">
                  Phím tắt: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">Ctrl + Enter</kbd> để thực thi
                </span>
              </div>

              <button
                onClick={handleExecute}
                disabled={!isReady || loading}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs shadow-lg shadow-emerald-950 transition active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{loading ? 'Đang thực thi...' : 'Chạy truy vấn (Run Query)'}</span>
              </button>
            </div>

            <div className="flex-1">
              <MonacoSQLEditor
                value={sqlCode}
                onChange={setSqlCode}
                onExecute={handleExecute}
                disabled={!isReady || loading}
              />
            </div>
          </div>

          {/* Bottom Half: Result Table & Benchmark Gauge */}
          <div className="h-[320px] flex flex-col bg-slate-900/30 p-4 overflow-hidden">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Kết Quả Thực Thi</span>
                {result && !result.error && (
                  <span className="text-xs text-slate-400 font-mono">
                    ({result.values.length} dòng dữ liệu)
                  </span>
                )}
              </div>

              {result && (
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-mono border ${
                      result.executionTimeMs < 50
                        ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300'
                        : 'bg-amber-950/60 border-amber-600/50 text-amber-300'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{result.executionTimeMs} ms</span>
                    <span className="text-[10px] opacity-75">
                      {result.executionTimeMs < 50 ? '(Đạt chuẩn < 50ms)' : '(Vượt ngưỡng 50ms)'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto rounded-lg border border-slate-800/80 bg-slate-950">
              {!result ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                  <Play className="w-8 h-8 stroke-1 text-slate-600 mb-2" />
                  <span>Bấm nút &quot;Chạy truy vấn&quot; hoặc nhấn Ctrl + Enter để xem kết quả</span>
                </div>
              ) : result.error ? (
                <div className="p-4 text-rose-300 text-xs font-mono bg-rose-950/30 border-l-4 border-rose-600">
                  <p className="font-bold mb-1">Lỗi cú pháp SQL / SQLite Error:</p>
                  <p>{result.error}</p>
                </div>
              ) : result.columns.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs font-mono">
                  Câu lệnh thực thi thành công (0 dòng trả về).
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead className="bg-slate-900/80 sticky top-0 border-b border-slate-800 text-slate-300">
                    <tr>
                      <th className="p-2.5 w-12 text-slate-600 text-center font-normal">#</th>
                      {result.columns.map((col) => (
                        <th key={col} className="p-2.5 font-semibold text-emerald-400 border-r border-slate-800/50 last:border-0">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {result.values.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-slate-900/60 transition">
                        <td className="p-2 text-center text-slate-600 select-none">{rowIdx + 1}</td>
                        {row.map((val, cellIdx) => (
                          <td key={cellIdx} className="p-2 text-slate-300 border-r border-slate-900/50 last:border-0">
                            {val === null ? (
                              <span className="text-slate-600 italic">NULL</span>
                            ) : typeof val === 'number' ? (
                              <span className="text-cyan-400">{val}</span>
                            ) : (
                              String(val)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
