export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Adaptive Learning SQL</h1>
      <p className="mt-4 text-xl text-slate-400">Hệ thống quản lý lộ trình học tập thích ứng</p>
      <div className="mt-8 flex gap-4">
        <a
          href="/poc/sqlite"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow transition"
        >
          🚀 Thử nghiệm SQLite WASM Web Worker
        </a>
      </div>
    </main>
  )
}
