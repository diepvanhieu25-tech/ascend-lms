'use client';

import React, { useState } from 'react';
import { useSQLiteWorker, QueryResult } from '@/hooks/useSQLiteWorker';

export default function SQLitePoCPage() {
  const { isReady, runQuery } = useSQLiteWorker();
  const [query, setQuery] = useState('SELECT 1 AS num, "Hello SQLite WASM" AS message;');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    setLoading(true);
    try {
      const res = await runQuery(query);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans">
      <h1 className="text-3xl font-bold mb-4 text-slate-800 dark:text-slate-100">
        ⚡ PoC: SQLite WASM in Web Worker
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Thực thi SQL trực tiếp trên trình duyệt thông qua SQLite WebAssembly (sql.js) trong Web Worker biệt lập.
      </p>

      <div className="flex items-center gap-3 mb-4">
        <span
          className={`inline-block w-3 h-3 rounded-full ${
            isReady ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
          }`}
        />
        <span className="text-sm font-medium">
          {isReady ? 'Web Worker: Sẵn sàng' : 'Web Worker: Đang tải WASM binary...'}
        </span>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Câu lệnh SQL thử nghiệm:</label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={3}
          className="w-full p-3 font-mono text-sm border rounded-lg bg-slate-950 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <button
        onClick={handleExecute}
        disabled={!isReady || loading}
        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-lg shadow transition"
      >
        {loading ? 'Đang chạy...' : 'Thực thi truy vấn (Run Query)'}
      </button>

      {result && (
        <div className="mt-8 border rounded-xl p-5 bg-slate-900 text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <span className="font-semibold text-emerald-400">Kết quả thực thi</span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-mono ${
                result.executionTimeMs < 50
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  : 'bg-amber-950 text-amber-300 border border-amber-700'
              }`}
            >
              Thời gian: {result.executionTimeMs}ms {result.executionTimeMs < 50 ? '(Đạt chuẩn < 50ms)' : ''}
            </span>
          </div>

          {result.error ? (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-lg text-sm font-mono">
              Lỗi: {result.error}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-700">
                    {result.columns.map((col) => (
                      <th key={col} className="p-2 font-mono text-slate-300">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.values.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/40">
                      {row.map((val, cellIdx) => (
                        <td key={cellIdx} className="p-2 font-mono text-slate-300">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
