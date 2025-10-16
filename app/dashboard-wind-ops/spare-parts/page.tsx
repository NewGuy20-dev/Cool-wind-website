'use client';

import { useState, useEffect } from 'react';
import type { SparePart } from '@/lib/spare-parts/types';
import { formatPrice, getStockInfo } from '@/lib/spare-parts/utils';

export default function AdminSparePartsPage() {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);

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

  async function updateStock(part: SparePart, change: number) {
    const newStock = Math.max(0, part.stock_quantity + change);
    
    try {
      const response = await fetch(`/api/spare-parts/${part.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || 'WindOps2025!GRK2012COOLWIND',
        },
        body: JSON.stringify({
          stock_quantity: newStock,
        }),
      });

      if (response.ok) {
        fetchParts();
      }
    } catch (error) {
      console.error('Error updating stock:', error);
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Spare Parts Management</h1>
        <p className="text-gray-600">Manage your spare parts inventory</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Parts</div>
          <div className="text-3xl font-bold text-blue-600">{parts.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Available</div>
          <div className="text-3xl font-bold text-green-600">
            {parts.filter(p => p.is_available).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Low Stock</div>
          <div className="text-3xl font-bold text-yellow-600">{lowStockParts.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Out of Stock</div>
          <div className="text-3xl font-bold text-red-600">
            {parts.filter(p => p.stock_quantity === 0).length}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockParts.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>{lowStockParts.length} parts</strong> are running low on stock
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Add New Part
        </button>
        <a
          href="/dashboard-wind-ops/orders"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          View Orders
        </a>
      </div>

      {/* Parts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Part
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {parts.map((part) => {
              const stockInfo = getStockInfo(part);
              return (
                <tr key={part.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={part.primary_image_url || '/images/spare-parts/placeholder-part.jpg'}
                        alt={part.name}
                        className="h-12 w-12 rounded object-cover mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{part.name}</div>
                        <div className="text-sm text-gray-500">{part.part_code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{part.category}</span>
                    <div className="text-xs text-gray-500">{part.brand}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatPrice(part.price)}</div>
                    {part.bulk_price && (
                      <div className="text-xs text-green-600">
                        Bulk: {formatPrice(part.bulk_price)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateStock(part, -1)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                      >
                        -
                      </button>
                      <span className={`font-medium ${
                        stockInfo.status === 'out_of_stock' ? 'text-red-600' :
                        stockInfo.status === 'low_stock' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {part.stock_quantity}
                      </span>
                      <button
                        onClick={() => updateStock(part, 1)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleAvailability(part)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        part.is_available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {part.is_available ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setEditingPart(part)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deletePart(part.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal - Simplified for now */}
      {(showAddModal || editingPart) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingPart ? 'Edit Part' : 'Add New Part'}
            </h2>
            <p className="text-gray-600 mb-4">
              Full form coming soon! For now, use the API or database directly.
            </p>
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingPart(null);
              }}
              className="w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
