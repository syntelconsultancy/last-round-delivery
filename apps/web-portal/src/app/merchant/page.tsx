'use client';
import { useState, useEffect } from 'react';

export default function MerchantDashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold">Merchant Portal</h1>
            <p className="text-gray-400 text-sm">Last Round Delivery - Store Management</p>
          </div>
        </header>
        <main className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Active Orders & Inventory</h2>
          <p className="text-gray-300">Welcome to your merchant dashboard. Orders and stock levels will appear here.</p>
        </main>
      </div>
    </div>
  );
}