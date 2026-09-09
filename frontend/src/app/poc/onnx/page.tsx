'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Brain,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  BarChart2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Play,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface ActionDetails {
  action_id: number;
  concept_index: number;
  concept_name: string;
  difficulty: string;
  learning_mode: string;
}

interface ONNXResponse {
  status: string;
  predicted_action: number;
  action_details: ActionDetails;
  latency_ms: number;
  threshold_ms: number;
  within_sla: boolean;
  probabilities_sample: number[];
  probabilities_count: number;
}

const PRESETS = [
  {
    id: 'beginner',
    name: 'Học viên mới (Beginner)',
    desc: 'BKT mastery thấp (0.1), chưa có lịch sử học, độ tập trung cao',
    state: [
      ...Array(18).fill(0.1), // BKT
      ...Array(18).fill(0.05), // Retention
      0.2, 0.0, 0.0, 45.0, 0.05, // Telemetry: latency, error_streak, hints, typing_wpm, fatigue
    ],
    useMask: false,
  },
  {
    id: 'intermediate',
    name: 'Học viên trung cấp (Intermediate)',
    desc: 'Đã nắm vững SELECT/WHERE/ORDER BY, bắt đầu học JOIN',
    state: [
      0.9, 0.85, 0.8, 0.75, 0.7, 0.4, 0.35, 0.2, 0.1, 0.05, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, // BKT
      0.85, 0.8, 0.75, 0.7, 0.65, 0.35, 0.3, 0.15, 0.08, 0.04, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, // Retention
      0.45, 1.0, 1.0, 60.0, 0.25, // Telemetry
    ],
    useMask: false,
  },
  {
    id: 'fatigue',
    name: 'Học viên kiệt sức & chuỗi lỗi (Fatigue & High Errors)',
    desc: 'Chuỗi lỗi 4 bài liên tiếp, độ trễ phản hồi tăng vọt, mỏi mệt cao (0.85)',
    state: [
      ...Array(18).fill(0.4),
      ...Array(18).fill(0.3),
      0.9, 4.0, 3.0, 25.0, 0.85, // High latency, 4 errors, 3 hints, low wpm, high fatigue
    ],
    useMask: false,
  },
  {
    id: 'action_masking',
    name: 'Action Masking (Chỉ cho phép SELECT Beginner & Intermediate)',
    desc: 'Khóa toàn bộ 156 action khác, chỉ mở 6 action đầu tiên để ép mô hình tuân thủ',
    state: [
      ...Array(18).fill(0.15),
      ...Array(18).fill(0.1),
      0.3, 0.0, 0.0, 50.0, 0.1,
    ],
    useMask: true,
  },
];

const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    if (window.location.port === '3000') {
      return 'http://localhost:8000';
    }
  }
  return '';
};

export default function ONNXPocPage() {
  const [selectedPreset, setSelectedPreset] = useState<string>('beginner');
  const [stateVector, setStateVector] = useState<number[]>(PRESETS[0].state);
  const [useMask, setUseMask] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [backendHealth, setBackendHealth] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  const [result, setResult] = useState<ONNXResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Check backend health on mount
  const checkHealth = useCallback(async () => {
    try {
      setBackendHealth('checking');
      const res = await fetch(`${getApiBaseUrl()}/api/v1/health`, { method: 'GET' });
      if (res.ok) {
        setBackendHealth('healthy');
      } else {
        setBackendHealth('unhealthy');
      }
    } catch {
      setBackendHealth('unhealthy');
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const p = PRESETS.find((item) => item.id === presetId);
    if (p) {
      setStateVector(p.state);
      setUseMask(p.useMask);
    }
  };

  const runInference = async () => {
    setLoading(true);
    setError(null);

    try {
      let mask: number[] | null = null;
      if (useMask) {
        // Create 162-dim mask: allow only first 6 actions
        mask = Array(162).fill(0);
        for (let i = 0; i < 6; i++) {
          mask[i] = 1;
        }
      }

      const bodyPayload: { state_vector: number[]; action_mask?: number[] } = {
        state_vector: stateVector,
      };
      if (mask) {
        bodyPayload.action_mask = mask;
      }

      const res = await fetch(`${getApiBaseUrl()}/api/v1/poc/onnx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: 'Lỗi không xác định từ API' }));
        throw new Error(errData.detail || `HTTP Error ${res.status}`);
      }

      const data: ONNXResponse = await res.json();
      setResult(data);
      setBackendHealth('healthy');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setBackendHealth('unhealthy');
    } finally {
      setLoading(false);
    }
  };

  const copyResultJson = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
              <Link href="/" className="hover:text-emerald-400 transition">Trang chủ</Link>
              <span>/</span>
              <span className="text-emerald-400">PoC: FastAPI ONNX Inference</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Brain className="w-8 h-8 text-indigo-400" />
              FastAPI ONNX Inference Spike (Task 4)
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Kiểm thử suy luận mô hình RL Policy thời gian thực với CPU Runtime và giám sát độ trễ SLA (&lt; 20ms)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={checkHealth}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-mono transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${backendHealth === 'checking' ? 'animate-spin' : ''}`} />
              Kiểm tra Backend
            </button>

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                backendHealth === 'healthy'
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : backendHealth === 'checking'
                  ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                  : 'bg-rose-950/60 border-rose-800 text-rose-300'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  backendHealth === 'healthy'
                    ? 'bg-emerald-400 animate-pulse'
                    : backendHealth === 'checking'
                    ? 'bg-amber-400'
                    : 'bg-rose-400'
                }`}
              />
              {backendHealth === 'healthy'
                ? 'Backend: Online'
                : backendHealth === 'checking'
                ? 'Đang kiểm tra...'
                : 'Backend: Offline'}
            </div>
          </div>
        </div>

        {/* Preset Selection */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`text-left p-4 rounded-xl border transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-950/30'
                    : 'bg-slate-900/50 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-200">{preset.name}</span>
                    {isSelected && <Sparkles className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{preset.desc}</p>
                </div>
                {preset.useMask && (
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/60 w-fit">
                    <ShieldCheck className="w-3 h-3" /> Masking bật
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Controls & Configuration */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="font-semibold text-slate-200 text-sm">Cấu hình Vector Trạng thái & Action Mask</h3>
                <p className="text-xs text-slate-400">
                  Vector 41 chiều (18 BKT + 18 Ebbinghaus + 5 Telemetry) nạp vào mạng học sâu ONNX
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-300">
                <input
                  type="checkbox"
                  checked={useMask}
                  onChange={(e) => setUseMask(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                />
                Kích hoạt Action Masking (Ép chỉ chọn Concept 0: sql_select)
              </label>

              <button
                onClick={runInference}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-indigo-900/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
                {loading ? 'Đang suy luận...' : 'Chạy suy luận ONNX'}
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar of State Vector */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
              <span className="text-[11px] font-mono text-slate-500 block">BKT Mastery (avg)</span>
              <span className="text-sm font-semibold text-slate-200">
                {(stateVector.slice(0, 18).reduce((a, b) => a + b, 0) / 18).toFixed(2)}
              </span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
              <span className="text-[11px] font-mono text-slate-500 block">Retention (avg)</span>
              <span className="text-sm font-semibold text-slate-200">
                {(stateVector.slice(18, 36).reduce((a, b) => a + b, 0) / 18).toFixed(2)}
              </span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
              <span className="text-[11px] font-mono text-slate-500 block">Error Streak</span>
              <span className="text-sm font-semibold text-amber-400">{stateVector[37] || 0} bài</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
              <span className="text-[11px] font-mono text-slate-500 block">Typing Speed</span>
              <span className="text-sm font-semibold text-slate-200">{stateVector[39] || 0} WPM</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
              <span className="text-[11px] font-mono text-slate-500 block">Fatigue Index</span>
              <span className="text-sm font-semibold text-rose-400">
                {((stateVector[40] || 0) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-sm text-rose-200">Không thể thực thi suy luận:</p>
              <p className="mt-1 font-mono">{error}</p>
              <p className="mt-2 text-rose-400">
                Hãy chắc chắn rằng backend Docker container <code className="bg-rose-900/40 px-1 py-0.5 rounded">adaptive_backend</code> đang chạy tại port 8000.
              </p>
            </div>
          </div>
        )}

        {/* Results Showcase */}
        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Latency & SLA Card */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Zap className="w-4 h-4 text-amber-400" /> Latency Thời Gian Thực
                    </span>
                    <span className="font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                      Ngưỡng SLA: {result.threshold_ms}ms
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold tracking-tight text-emerald-400 font-mono">
                      {result.latency_ms.toFixed(3)}
                    </span>
                    <span className="text-lg text-slate-400 font-mono">ms</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.within_sla ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-400">
                          ĐẠT CHUẨN SLA (&lt; 20ms)
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-rose-400" />
                        <span className="text-xs font-semibold text-rose-400">VƯỢT NGƯỠNG SLA</span>
                      </>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">CPU Provider</span>
                </div>
              </div>

              {/* Recommended Action Card */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 md:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Activity className="w-4 h-4 text-indigo-400" /> Hành Động Được Khuyến Nghị (Policy Action)
                    </span>
                    <span className="font-mono text-[11px] bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded text-indigo-300">
                      Action ID: #{result.predicted_action} / 161
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
                      <span className="text-[11px] font-mono text-slate-500 block mb-1">Khái niệm mục tiêu</span>
                      <span className="text-base font-bold text-indigo-300 font-mono">
                        {result.action_details.concept_name}
                      </span>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
                      <span className="text-[11px] font-mono text-slate-500 block mb-1">Độ khó bài tập</span>
                      <span
                        className={`text-sm font-bold font-mono px-2 py-0.5 rounded inline-block ${
                          result.action_details.difficulty === 'BEGINNER'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                            : result.action_details.difficulty === 'INTERMEDIATE'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                            : 'bg-rose-950/60 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {result.action_details.difficulty}
                      </span>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
                      <span className="text-[11px] font-mono text-slate-500 block mb-1">Chế độ sư phạm</span>
                      <span className="text-sm font-bold font-mono text-purple-300 bg-purple-950/60 border border-purple-800 px-2 py-0.5 rounded inline-block">
                        {result.action_details.learning_mode}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                  <span>
                    Tổng không gian hành động: <strong className="text-slate-200">{result.probabilities_count} actions</strong> (18 concepts × 3 difficulties × 3 modes)
                  </span>
                  {useMask && (
                    <span className="text-amber-400 font-mono text-[11px] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Action Masking Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Probability Sample & Details */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-semibold text-slate-200">Mẫu Phân Phối Xác Suất Đầu Ra (Top Sample)</h4>
                </div>
                <span className="text-xs text-slate-500 font-mono">Softmax Distribution</span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {result.probabilities_sample.map((prob, idx) => (
                  <div key={idx} className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3">
                    <div className="text-[11px] font-mono text-slate-500 flex justify-between">
                      <span>Action #{idx}</span>
                      <span>{(prob * 100).toFixed(2)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(2, prob * 100 * 10))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Collapsible Raw JSON Response */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowRawJson(!showRawJson)}
                className="w-full px-5 py-3 flex items-center justify-between text-xs font-mono text-slate-400 hover:bg-slate-900/80 transition"
              >
                <span>Dữ liệu JSON Phản Hồi Từ API</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyResultJson();
                    }}
                    className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã sao chép' : 'Sao chép JSON'}</span>
                  </button>
                  {showRawJson ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {showRawJson && (
                <div className="p-4 bg-slate-950 border-t border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-60">
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
