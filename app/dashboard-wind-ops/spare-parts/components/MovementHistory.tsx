'use client';

import { useState, useEffect } from 'react';
import { X, Download, Filter, TrendingUp, TrendingDown, RotateCw } from 'lucide-react';
import { format } from 'date-fns';

interface Movement {
  id: string;
  part_id: string;
  movement_type: string;
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  reason: string | null;
  notes: string | null;
  performed_by: string | null;
  created_at: string;
  spare_parts?: {
    name: string;
    part_code: string | null;
  };
}

interface MovementHistoryProps {
  partId?: string;
  onClose?: () => void;
}

export default function MovementHistory({ partId, onClose }: MovementHistoryProps) {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchMovements();
  }, [partId, filter]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '100',
      });

      if (partId) {
        params.append('part_id', partId);
      }

      if (filter !== 'all') {
        params.append('movement_type', filter);
      }

      const response = await fetch(`/api/spare-parts/inventory-movements?${params}`, {
        headers: {
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || 'WindOps2025!GRK2012COOLWIND',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMovements(data.movements || []);
      }
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Part', 'Type', 'Change', 'Before', 'After', 'Reason', 'Notes', 'Performed By'];
    const rows = movements.map(m => [
      format(new Date(m.created_at), 'yyyy-MM-dd HH:mm:ss'),
      m.spare_parts?.name || '',
      m.movement_type,
      m.quantity_change,
      m.quantity_before,
      m.quantity_after,
      m.reason || '',
      m.notes || '',
      m.performed_by || '',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-movements-${Date.now()}.csv`;
    a.click();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'add':
      case 'restock':
      case 'return':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'remove':
      case 'damage':
      case 'sale':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <RotateCw className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'add':
      case 'restock':
      case 'return':
        return 'bg-green-100 text-green-800';
      case 'remove':
      case 'damage':
      case 'sale':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className={onClose ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' : ''}>
      <div className={`bg-white rounded-lg ${onClose ? 'w-full max-w-6xl max-h-[90vh]' : 'w-full'} flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Inventory Movement History</h2>
            <p className="text-sm text-gray-600 mt-1">
              {partId ? 'Product-specific movements' : 'All inventory movements'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              disabled={movements.length === 0}
              className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex gap-2">
              {['all', 'add', 'remove', 'adjust', 'restock', 'damage', 'sale', 'return'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filter === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : movements.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No movements found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {movements.map((movement) => (
                <div
                  key={movement.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icon */}
                      <div className="mt-1">
                        {getTypeIcon(movement.movement_type)}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(movement.movement_type)}`}>
                            {movement.movement_type.toUpperCase()}
                          </span>
                          {!partId && movement.spare_parts && (
                            <span className="text-sm font-medium text-gray-900">
                              {movement.spare_parts.name}
                              {movement.spare_parts.part_code && (
                                <span className="text-gray-500 ml-2">({movement.spare_parts.part_code})</span>
                              )}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                          <div>
                            <span className="text-gray-600">Change: </span>
                            <span className={`font-medium ${movement.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {movement.quantity_change > 0 ? '+' : ''}{movement.quantity_change}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Before: </span>
                            <span className="font-medium">{movement.quantity_before}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">After: </span>
                            <span className="font-medium text-blue-600">{movement.quantity_after}</span>
                          </div>
                        </div>

                        {movement.reason && (
                          <div className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Reason:</span> {movement.reason}
                          </div>
                        )}

                        {movement.notes && (
                          <div className="text-sm text-gray-600 italic">
                            {movement.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="text-right text-sm text-gray-500">
                      <div>{format(new Date(movement.created_at), 'MMM dd, yyyy')}</div>
                      <div className="text-xs">{format(new Date(movement.created_at), 'HH:mm:ss')}</div>
                      {movement.performed_by && (
                        <div className="text-xs mt-1">by {movement.performed_by}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
