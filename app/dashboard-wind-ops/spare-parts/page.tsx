'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Plus, History, TrendingDown, Package, AlertTriangle } from 'lucide-react';
import type { SparePart } from '@/lib/spare-parts/types';
import { formatPrice, getStockInfo } from '@/lib/spare-parts/utils';
import ProductForm from './components/ProductForm';
import StockAdjustmentModal from './components/StockAdjustmentModal';
import MovementHistory from './components/MovementHistory';

export default function AdminSparePartsPage() {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [filteredParts, setFilteredParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [adjustingPart, setAdjustingPart] = useState<SparePart | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');

  useEffect(() => {
    fetchParts();
  }, []);

  async function fetchParts() {
    try {
      const response = await fetch('/api/spare-parts?limit=100', {
        headers: {
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || 'WindOps2025!GRK2012COOLWIND',
        },
      });
      const data = await response.json();
      setParts(data.parts || []);
    } catch (error) {
      console.error('Error fetching parts:', error);
    } finally {
      setLoading(false);
    }
  }

  // Apply filters whenever search or filter changes
  useEffect(() => {
    let filtered = [...parts];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(part =>
        part.name.toLowerCase().includes(term) ||
        part.part_code?.toLowerCase().includes(term) ||
        part.brand?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(part => part.category === categoryFilter);
    }

    // Stock filter
    if (stockFilter === 'in_stock') {
      filtered = filtered.filter(part => part.stock_quantity > part.low_stock_threshold);
    } else if (stockFilter === 'low_stock') {
      filtered = filtered.filter(part => part.stock_quantity > 0 && part.stock_quantity <= part.low_stock_threshold);
    } else if (stockFilter === 'out_of_stock') {
      filtered = filtered.filter(part => part.stock_quantity === 0);
    }

    // Availability filter
    if (availabilityFilter === 'available') {
      filtered = filtered.filter(part => part.is_available);
    } else if (availabilityFilter === 'unavailable') {
      filtered = filtered.filter(part => !part.is_available);
    }

    setFilteredParts(filtered);
  }, [parts, searchTerm, categoryFilter, stockFilter, availabilityFilter]);

  async function deletePart(id: string) {
    if (!confirm('Are you sure you want to delete this part?')) return;

    try {
      const response = await fetch(`/api/spare-parts/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || 'WindOps2025!GRK2012COOLWIND',
        },
      });

      if (response.ok) {
        alert('Part deleted successfully');
        fetchParts();
      } else {
        alert('Failed to delete part');
      }
    } catch (error) {
      console.error('Error deleting part:', error);
      alert('Error deleting part');
    }
  }

  async function toggleAvailability(part: SparePart) {
    try {
      const response = await fetch(`/api/spare-parts/${part.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || 'WindOps2025!GRK2012COOLWIND',
        },
        body: JSON.stringify({
          is_available: !part.is_available,
        }),
      });

      if (response.ok) {
        fetchParts();
      } else {
        alert('Failed to update part');
      }
    } catch (error) {
      console.error('Error updating part:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const lowStockParts = parts.filter(p => p.stock_quantity <= p.low_stock_threshold && p.is_available);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Spare Parts Management
            </h1>
            <p className="text-gray-600 text-lg">Manage your spare parts inventory with ease</p>
          </div>
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center px-5 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md border border-gray-200"
          >
            <History className="w-4 h-4 mr-2" />
            View History
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-blue-100 hover:border-blue-200 group">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Total Parts</div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900">{parts.length}</div>
          <div className="text-xs text-gray-500 mt-2">Total inventory items</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-green-100 hover:border-green-200 group">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Available</div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900">
            {parts.filter(p => p.is_available).length}
          </div>
          <div className="text-xs text-gray-500 mt-2">Ready for sale</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-yellow-100 hover:border-yellow-200 group">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Low Stock</div>
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-md group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900">{lowStockParts.length}</div>
          <div className="text-xs text-gray-500 mt-2">Needs restocking</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-red-100 hover:border-red-200 group">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Out of Stock</div>
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md group-hover:scale-110 transition-transform">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900">
            {parts.filter(p => p.stock_quantity === 0).length}
          </div>
          <div className="text-xs text-gray-500 mt-2">Requires immediate attention</div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockParts.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-xl p-5 mb-8 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-semibold text-yellow-900">
                Low Stock Alert
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                <strong>{lowStockParts.length} parts</strong> are running low on stock and need restocking soon
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, part code, or brand..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-gray-700">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-semibold">Filters:</span>
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:bg-gray-100"
            >
              <option value="all">All Categories</option>
              <option value="ac">AC</option>
              <option value="refrigerator">Refrigerator</option>
            </select>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:bg-gray-100"
            >
              <option value="all">All Stock Levels</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            {/* Availability Filter */}
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:bg-gray-100"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>

            <div className="flex-1"></div>

            {/* Results Count */}
            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
              {filteredParts.length} of {parts.length} products
            </span>

            {/* Clear Filters */}
            {(searchTerm || categoryFilter !== 'all' || stockFilter !== 'all' || availabilityFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setStockFilter('all');
                  setAvailabilityFilter('all');
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-8 flex gap-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Part
        </button>
        <a
          href="/dashboard-wind-ops/orders"
          className="flex items-center px-6 py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          View Orders
        </a>
      </div>

      {/* Parts Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        {filteredParts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">No products found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Part
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredParts.map((part) => {
                const stockInfo = getStockInfo(part);
                return (
                  <tr key={part.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all">
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <img
                          src={part.primary_image_url || '/images/spare-parts/placeholder-part.jpg'}
                          alt={part.name}
                          className="h-14 w-14 rounded-xl object-cover mr-4 border-2 border-gray-200 shadow-sm"
                        />
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">{part.name}</div>
                          <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">{part.part_code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-1">
                        {part.category.toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-600 font-medium mt-1">{part.brand}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-base font-bold text-gray-900">{formatPrice(part.price)}</div>
                      {part.bulk_price && (
                        <div className="text-xs font-medium text-green-600 mt-1 bg-green-50 px-2 py-0.5 rounded inline-block">
                          Bulk: {formatPrice(part.bulk_price)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setAdjustingPart(part)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 text-xs font-semibold transition-all shadow-sm hover:shadow-md"
                        >
                          Adjust
                        </button>
                        <span className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
                          stockInfo.status === 'out_of_stock' ? 'bg-red-100 text-red-700' :
                          stockInfo.status === 'low_stock' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {part.stock_quantity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <button
                        onClick={() => toggleAvailability(part)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md ${
                          part.is_available
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                            : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                        }`}
                      >
                        {part.is_available ? '✓ Available' : '✕ Unavailable'}
                      </button>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingPart(part)}
                          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-semibold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deletePart(part.id)}
                          className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-semibold transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Product Form Modal */}
      {(showAddModal || editingPart) && (
        <ProductForm
          product={editingPart || undefined}
          onClose={() => {
            setShowAddModal(false);
            setEditingPart(null);
          }}
          onSuccess={fetchParts}
        />
      )}

      {/* Stock Adjustment Modal */}
      {adjustingPart && (
        <StockAdjustmentModal
          part={adjustingPart}
          onClose={() => setAdjustingPart(null)}
          onSuccess={fetchParts}
        />
      )}

      {/* Movement History Modal */}
      {showHistory && (
        <MovementHistory
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
