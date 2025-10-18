'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Package, DollarSign, AlertCircle, Layers } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SparePart } from '@/lib/spare-parts/types';
import { formatPrice } from '@/lib/spare-parts/utils';

interface InventoryStatsProps {
  parts: SparePart[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function InventoryStats({ parts }: InventoryStatsProps) {
  const [stats, setStats] = useState({
    totalValue: 0,
    totalItems: 0,
    averagePrice: 0,
    categoriesData: [] as any[],
    brandsData: [] as any[],
    stockStatusData: [] as any[],
  });

  useEffect(() => {
    calculateStats();
  }, [parts]);

  const calculateStats = () => {
    // Total inventory value
    const totalValue = parts.reduce((sum, part) => sum + (part.stock_quantity * part.price), 0);
    const totalItems = parts.reduce((sum, part) => sum + part.stock_quantity, 0);
    const averagePrice = parts.length > 0 ? parts.reduce((sum, part) => sum + part.price, 0) / parts.length : 0;

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    parts.forEach(part => {
      categoryCounts[part.category] = (categoryCounts[part.category] || 0) + 1;
    });
    const categoriesData = Object.entries(categoryCounts).map(([name, value]) => ({
      name: name.toUpperCase(),
      value,
    }));

    // Brand breakdown (top 5)
    const brandCounts: Record<string, number> = {};
    parts.forEach(part => {
      if (part.brand) {
        brandCounts[part.brand] = (brandCounts[part.brand] || 0) + 1;
      }
    });
    const brandsData = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    // Stock status breakdown
    const inStock = parts.filter(p => p.stock_quantity > p.low_stock_threshold).length;
    const lowStock = parts.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold).length;
    const outOfStock = parts.filter(p => p.stock_quantity === 0).length;
    const stockStatusData = [
      { name: 'In Stock', value: inStock },
      { name: 'Low Stock', value: lowStock },
      { name: 'Out of Stock', value: outOfStock },
    ];

    setStats({
      totalValue,
      totalItems,
      averagePrice,
      categoriesData,
      brandsData,
      stockStatusData,
    });
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-90">Total Inventory Value</div>
            <DollarSign className="w-6 h-6 opacity-90" />
          </div>
          <div className="text-3xl font-bold">{formatPrice(stats.totalValue)}</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-90">Total Items</div>
            <Package className="w-6 h-6 opacity-90" />
          </div>
          <div className="text-3xl font-bold">{stats.totalItems.toLocaleString()}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-90">Average Price</div>
            <TrendingUp className="w-6 h-6 opacity-90" />
          </div>
          <div className="text-3xl font-bold">{formatPrice(stats.averagePrice)}</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-90">Unique Products</div>
            <Layers className="w-6 h-6 opacity-90" />
          </div>
          <div className="text-3xl font-bold">{parts.length}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Status Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
            Stock Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.stockStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.stockStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-blue-600" />
            Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.categoriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Brands */}
        {stats.brandsData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Top 5 Brands
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.brandsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Low Stock Alert List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
            Low Stock Alerts
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {parts
              .filter(p => p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0)
              .sort((a, b) => a.stock_quantity - b.stock_quantity)
              .slice(0, 10)
              .map(part => (
                <div
                  key={part.id}
                  className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{part.name}</div>
                    <div className="text-xs text-gray-500">{part.part_code}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-yellow-600">{part.stock_quantity}</span>
                    <span className="text-xs text-gray-500">/ {part.low_stock_threshold}</span>
                  </div>
                </div>
              ))}
            {parts.filter(p => p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0).length === 0 && (
              <p className="text-center text-gray-500 py-8">No low stock items</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
