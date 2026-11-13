export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-green-400">Last Round Delivery</h1>
        <p className="text-slate-300 text-lg">Drinks Delivery & Logistics Web Portal - Lusaka, Zambia</p>
        <div className="flex justify-center gap-4 pt-4">
          <a href="/admin" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg shadow transition">
            Admin Portal
          </a>
          <a href="/merchant" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 font-semibold rounded-lg shadow transition">
            Merchant Portal
          </a>
        </div>
      </div>
    </main>
  );
}