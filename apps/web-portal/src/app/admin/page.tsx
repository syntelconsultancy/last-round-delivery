'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key'
);

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'dispatch' | 'stores' | 'payouts'>('dispatch');
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    setLoading(true);

    const [ordersRes, driversRes, storesRes, ledgerRes] = await Promise.all([
      supabase.from('orders').select('*, stores(name)').order('created_at', { ascending: false }).limit(50),
      supabase.from('profiles').select('*').eq('role', 'driver'),
      supabase.from('stores').select('*').order('is_internal_store', { ascending: false }),
      supabase.from('merchant_ledger').select('*, stores(name)').eq('payout_status', 'UNPAID'),
    ]);

    if (ordersRes.data) setOrders(ordersRes.data);
    if (driversRes.data) setDrivers(driversRes.data);
    if (storesRes.data) setStores(storesRes.data);
    if (ledgerRes.data) setLedger(ledgerRes.data);
    setLoading(false);
  }

  async function assignDriverToOrder(orderId: string, driverId: string) {
    if (!driverId) return;
    const { error } = await supabase
      .from('orders')
      .update({ driver_id: driverId, status: 'OUT_FOR_DELIVERY' })
      .eq('id', orderId);

    if (!error) {
      alert('Driver assigned & order set to OUT_FOR_DELIVERY');
      fetchAdminData();
    } else {
      alert('Error reassigning order: ' + error.message);
    }
  }

  async function toggleStoreOpen(storeId: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('stores')
      .update({ is_open: !currentStatus })
      .eq('id', storeId);

    if (!error) {
      setStores(stores.map((s) => (s.id === storeId ? { ...s, is_open: !currentStatus } : s)));
    }
  }

  function exportPayoutsCSV() {
    if (ledger.length === 0) {
      alert('No unpaid partner balances to export.');
      return;
    }

    const headers = ['Ledger_ID', 'Store_Name', 'Order_ID', 'Gross_ZMW', 'Commission_ZMW', 'Net_Payable_ZMW'];
    const rows = ledger.map((row) => [
      row.id,
      "",
      row.order_id,
      row.gross_amount,
      row.commission_deducted,
      row.net_payable,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', last_round_payouts_.csv);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-400">Last Round Command Center</h1>
            <p className="text-slate-400">Super Admin Operations — Lusaka Pilot</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('dispatch')}
              className={px-4 py-2 rounded-lg font-semibold transition }
            >
              Live Dispatch & Overrides
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={px-4 py-2 rounded-lg font-semibold transition }
            >
              Warehouse & Partners
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={px-4 py-2 rounded-lg font-semibold transition }
            >
              Partner Payouts ({ledger.length})
            </button>
          </div>
        </header>

        {loading ? (
          <p className="text-center text-slate-400 py-12">Loading command center telemetry...</p>
        ) : activeTab === 'dispatch' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Radar / Rider GPS Coordinates */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="text-xl font-semibold mb-3 text-amber-400">Active Lusaka Riders</h2>
              <p className="text-xs text-slate-400 mb-4">
                Live GPS telemetry feed (Connect Google Maps API key in .env to render interactive map pins).
              </p>
              {drivers.length === 0 ? (
                <p className="text-sm text-slate-500">No drivers registered yet.</p>
              ) : (
                <ul className="space-y-3">
                  {drivers.map((driver) => (
                    <li key={driver.id} className="bg-slate-800 p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-sm">{driver.full_name || driver.phone}</p>
                        <p className="text-xs text-slate-400">
                          GPS: {driver.current_lat ? ${driver.current_lat.toFixed(4)},  : 'No signal'}
                        </p>
                      </div>
                      <span
                        className={px-2 py-1 rounded text-xs font-bold }
                      >
                        {driver.is_online ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Order Queue & Manual Override */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="text-xl font-semibold mb-4">All Active Orders & Manual Reassignment</h2>
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-slate-800 border border-slate-700 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-amber-400">#{order.id.slice(0, 8)}</span>
                        <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">{order.stores?.name}</span>
                        <span className="text-xs font-bold text-emerald-400">{order.status}</span>
                      </div>
                      <p className="text-sm mt-1">
                        <strong>K{order.total_zmw}</strong> — {order.landmark_note}
                      </p>
                      <p className="text-xs text-slate-400">PIN: {order.delivery_pin}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        defaultValue={order.driver_id || ''}
                        onChange={(e) => assignDriverToOrder(order.id, e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-sm rounded px-3 py-1.5 text-white"
                      >
                        <option value="">-- Assign / Reassign Rider --</option>
                        {drivers.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.full_name || d.phone} {d.is_online ? '(Online)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'stores' ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-sm">
                  <th className="p-4">Store Name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Commission</th>
                  <th className="p-4">Hours</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id} className="border-b border-slate-800 text-sm">
                    <td className="p-4 font-semibold">{store.name}</td>
                    <td className="p-4">
                      {store.is_internal_store ? (
                        <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-xs font-bold">
                          INTERNAL WAREHOUSE
                        </span>
                      ) : (
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold">
                          PARTNER STORE
                        </span>
                      )}
                    </td>
                    <td className="p-4">{(Number(store.commission_rate) * 100).toFixed(1)}%</td>
                    <td className="p-4 text-slate-400">
                      {store.opening_time.slice(0, 5)} - {store.closing_time.slice(0, 5)}
                    </td>
                    <td className="p-4">
                      <span className={store.is_open ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                        {store.is_open ? 'OPEN' : 'SUSPENDED / CLOSED'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleStoreOpen(store.id, store.is_open)}
                        className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-xs font-semibold"
                      >
                        {store.is_open ? 'Close / Suspend' : 'Reopen Store'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Unpaid Partner Store Payouts</h2>
                <p className="text-sm text-slate-400">Export batch CSV for bulk Mobile Money disbursement.</p>
              </div>
              <button
                onClick={exportPayoutsCSV}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm"
              >
                Export Weekly CSV Batch
              </button>
            </div>

            {ledger.length === 0 ? (
              <p className="text-slate-400 text-sm">No pending partner payouts.</p>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="p-3">Partner Store</th>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Gross (ZMW)</th>
                    <th className="p-3">Commission</th>
                    <th className="p-3">Net Payable</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((item) => (
                    <tr key={item.id} className="border-b border-slate-800">
                      <td className="p-3 font-medium">{item.stores?.name}</td>
                      <td className="p-3 font-mono text-xs">{item.order_id.slice(0, 8)}</td>
                      <td className="p-3">K{item.gross_amount}</td>
                      <td className="p-3 text-red-400">-K{item.commission_deducted}</td>
                      <td className="p-3 font-bold text-emerald-400">K{item.net_payable}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
