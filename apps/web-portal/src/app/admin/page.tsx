'use client';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">Last Round Delivery - Management Portal</p>
          </div>
        </header>
        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Total Orders</h2>
            <p className="text-3xl font-bold text-green-400">0</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Active Drivers</h2>
            <p className="text-3xl font-bold text-blue-400">0</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Registered Merchants</h2>
            <p className="text-3xl font-bold text-purple-400">0</p>
          </div>
        </main>
      </div>
    </div>
  );
}