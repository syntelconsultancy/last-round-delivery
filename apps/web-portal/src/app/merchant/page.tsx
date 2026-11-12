'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for browser
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key'
);

export default function MerchantDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMerchantData();
  }, []);

  async function fetchMerchantData() {
    setLoading(true);
    // Fetch active orders
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    // Fetch store inventory
    const { data: invData } = await supabase
      .from('store_inventory')
      .select('*, master_products(name, category, volume_ml)')
      .limit(50);

    if (ordersData) setOrders(ordersData);
    if (invData) setInventory(invData);
    setLoading(false);
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } else {
      alert('Failed to update order status');
    }
  }

  async function updateInventoryItem(inventoryId: string, priceZmw: number, stockQuantity: number, isChilled: boolean) {
    const { error } = await supabase
      .from('store_inventory')
      .update({ price_zmw: priceZmw, stock_quantity: stockQuantity, is_chilled: isChilled })
      .eq('id', inventoryId);

    if (error) {
      alert('Failed to update inventory');
    } else {
      alert('Inventory updated successfully!');
      fetchMerchantData();
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-400">Last Round Delivery</h1>
            <p className="text-gray-400">Partner Merchant Portal (Lusaka Pilot)</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('orders')}
              className={px-4 py-2 rounded-lg font-semibold transition }
            >
              Live Orders Queue
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={px-4 py-2 rounded-lg font-semibold transition }
            >
              Inventory Management
            </button>
          </div>
        </header>

        {loading ? (
          <p className="text-center text-gray-400 py-12">Loading store data...</p>
        ) : activeTab === 'orders' ? (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Live Order Queue</h2>
            {orders.length === 0 ? (
              <p className="text-gray-400">No active orders found.</p>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-gray-800 border border-gray-700 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-amber-400 text-sm">ID: {order.id.slice(0, 8)}</span>
                        <span className={px-2.5 py-1 rounded text-xs font-bold }>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">Total: <strong className="text-white">K{order.total_zmw}</strong> | Landmark: {order.landmark_note}</p>
                      <p className="text-xs text-gray-400 mt-1">Payment Ref: {order.payment_reference || 'Pending MoMo'}</p>
                    </div>
                    <div className="flex gap-2">
                      {order.status === 'CONFIRMED' && (
                        <button onClick={() => updateOrderStatus(order.id, 'PREPARING')} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-4 py-2 rounded-lg text-sm">
                          Mark Preparing
                        </button>
                      )}
                      {order.status === 'PREPARING' && (
                        <button onClick={() => updateOrderStatus(order.id, 'READY_FOR_PICKUP')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg text-sm">
                          Ready for Pickup
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Store Inventory & Pricing</h2>
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-900 text-gray-400 border-b border-gray-700 text-sm">
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price (ZMW)</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Chilled</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} className="border-b border-gray-700/50 hover:bg-gray-750 text-sm">
                      <td className="p-4 font-medium">{item.master_products?.name}</td>
                      <td className="p-4 text-gray-400">{item.master_products?.category}</td>
                      <td className="p-4">
                        <input
                          type="number"
                          defaultValue={item.price_zmw}
                          id={price-}
                          className="bg-gray-900 border border-gray-600 rounded px-2 py-1 w-24 text-white"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          defaultValue={item.stock_quantity}
                          id={stock-}
                          className="bg-gray-900 border border-gray-600 rounded px-2 py-1 w-20 text-white"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="checkbox"
                          defaultChecked={item.is_chilled}
                          id={chilled-}
                          className="w-4 h-4 accent-amber-500"
                        />
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            const price = Number((document.getElementById(price-) as HTMLInputElement).value);
                            const stock = Number((document.getElementById(stock-) as HTMLInputElement).value);
                            const chilled = (document.getElementById(chilled-) as HTMLInputElement).checked;
                            updateInventoryItem(item.id, price, stock, chilled);
                          }}
                          className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold px-3 py-1.5 rounded text-xs"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
