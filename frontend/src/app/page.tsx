export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Adaptive Learning SQL</h1>
      <p className="mt-4 text-xl text-slate-400">Hệ thống quản lý lộ trình học tập thích ứng</p>
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <a
          href="/poc/sqlite"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow transition flex items-center gap-2"
        >
          <span>🚀</span> Thử nghiệm SQLite WASM (Task 3)
        </a>
        <a
          href="/poc/onnx"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition flex items-center gap-2"
        >
          <span>🧠</span> Thử nghiệm FastAPI ONNX (Task 4)
        </a>
        <a
          href="/docs"
          target="_blank"
          rel="noreferrer"
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg border border-slate-700 transition flex items-center gap-2"
        >
          <span>📖</span> API Docs (Swagger)
        </a>
      </div>
    </main>
  );
}
