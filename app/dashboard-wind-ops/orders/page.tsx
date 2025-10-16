'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuth from '@/components/admin/AdminAuth';
import type { BulkOrder } from '@/lib/spare-parts/types';
import { formatPrice, formatDateTime, getRelativeTime } from '@/lib/spare-parts/utils';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/spare-parts/constants';

interface ConfirmationModal {
  isOpen: boolean;
  type: 'status' | 'archive' | 'delete' | 'cancel';
  orderId: string;
  orderNumber: string;
  currentStatus?: string;
  newStatus?: string;
  message: string;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState<BulkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<BulkOrder | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmationModal>({
    isOpen: false,
    type: 'status',
    orderId: '',
    orderNumber: '',
    message: ''
  });
  const [cancellationReason, setCancellationReason] = useState('');

  // Check authentication on mount
  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    const adminKey = sessionStorage.getItem('admin_key');
    
    if (isAuth && adminKey) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  async function fetchOrders() {
    try {
      const adminKey = sessionStorage.getItem('admin_key');
      const response = await fetch('/api/spare-parts/orders', {
        headers: {
          'x-admin-key': adminKey || '',
        },
      });
      const data = await response.json();
      setOrders(data.orders || []);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }

  // Show confirmation modal
  function showConfirmation(
    type: 'status' | 'archive' | 'delete' | 'cancel',
    orderId: string,
    orderNumber: string,
    currentStatus?: string,
    newStatus?: string
  ) {
    let message = '';
    
    switch (type) {
      case 'status':
        message = `Change order status from "${currentStatus}" to "${newStatus}"?`;
        break;
      case 'archive':
        message = `Archive order ${orderNumber}? This will hide it from the main list.`;
        break;
      case 'delete':
        message = `Permanently delete order ${orderNumber}? This action cannot be undone.`;
        break;
      case 'cancel':
        message = `Cancel order ${orderNumber}? Please provide a reason.`;
        break;
    }
    
    setConfirmModal({
      isOpen: true,
      type,
      orderId,
      orderNumber,
      currentStatus,
      newStatus,
      message
    });
  }

  // Close confirmation modal
  function closeConfirmation() {
    setConfirmModal({
      isOpen: false,
      type: 'status',
      orderId: '',
      orderNumber: '',
      message: ''
    });
    setCancellationReason('');
  }

  // Handle confirmed action
  async function handleConfirmedAction() {
    const { type, orderId, newStatus } = confirmModal;
    
    try {
      const adminKey = sessionStorage.getItem('admin_key');
      
      switch (type) {
        case 'status':
          await updateOrderStatus(orderId, newStatus!);
          break;
        case 'cancel':
          if (!cancellationReason.trim()) {
            alert('Please provide a cancellation reason');
            return;
          }
          await updateOrderStatus(orderId, 'cancelled', cancellationReason);
          break;
        case 'archive':
          await archiveOrder(orderId);
          break;
        case 'delete':
          await deleteOrder(orderId);
          break;
      }
      
      closeConfirmation();
    } catch (error) {
      console.error('Error performing action:', error);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string, notes?: string) {
    try {
      const adminKey = sessionStorage.getItem('admin_key');
      const body: any = { status: newStatus };
      
      if (notes) {
        body.admin_notes = notes;
      }
      
      const response = await fetch(`/api/spare-parts/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey || '',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchOrders();
        setSelectedOrder(null);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update order status');
      }
    } catch (error: any) {
      console.error('Error updating order:', error);
      alert(`Error: ${error.message}`);
      throw error;
    }
  }

  async function archiveOrder(orderId: string) {
    try {
      const adminKey = sessionStorage.getItem('admin_key');
      const response = await fetch(`/api/spare-parts/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey || '',
        },
        body: JSON.stringify({ archived: true }),
      });

      if (response.ok) {
        await fetchOrders();
        setSelectedOrder(null);
      } else {
        throw new Error('Failed to archive order');
      }
    } catch (error: any) {
      console.error('Error archiving order:', error);
      alert(`Error: ${error.message}`);
      throw error;
    }
  }

  async function deleteOrder(orderId: string) {
    try {
      const adminKey = sessionStorage.getItem('admin_key');
      const response = await fetch(`/api/spare-parts/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-key': adminKey || '',
        },
      });

      if (response.ok) {
        await fetchOrders();
        setSelectedOrder(null);
      } else {
        throw new Error('Failed to delete order');
      }
    } catch (error: any) {
      console.error('Error deleting order:', error);
      alert(`Error: ${error.message}`);
      throw error;
    }
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <AdminAuth onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Back to Dashboard */}
      <button
        onClick={() => router.push('/dashboard-wind-ops')}
        className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
      >
        ← Back to Dashboard
      </button>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Orders</h1>
        <p className="text-gray-600">Manage spare parts bulk orders</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Confirmed</div>
            <div className="text-3xl font-bold text-blue-600">{stats.confirmed}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Processing</div>
            <div className="text-3xl font-bold text-purple-600">{stats.processing}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Delivered</div>
            <div className="text-3xl font-bold text-green-600">{stats.delivered}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Cancelled</div>
            <div className="text-3xl font-bold text-red-600">{stats.cancelled}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Value</div>
            <div className="text-2xl font-bold text-green-600">{formatPrice(stats.total_value)}</div>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{order.order_number}</div>
                  <div className="text-xs text-gray-500">{order.source}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                  <div className="text-xs text-gray-500">{order.customer_phone}</div>
                  <div className="text-xs text-gray-500">{order.customer_email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{order.items.length} items</div>
                  {order.bulk_discount_applied && (
                    <div className="text-xs text-green-600">Bulk discount</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatPrice(order.total_amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${ORDER_STATUS_COLORS[order.status]}-100 text-${ORDER_STATUS_COLORS[order.status]}-800`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getRelativeTime(order.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </button>
                  <a
                    href={`tel:${order.customer_phone}`}
                    className="text-green-600 hover:text-green-900 mr-3"
                  >
                    Call
                  </a>
                  <a
                    href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-900"
                  >
                    WhatsApp
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No orders yet
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order {selectedOrder.order_number}
                  </h2>
                  <p className="text-sm text-gray-500">{formatDateTime(selectedOrder.created_at)}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Customer Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                  <p><strong>Location:</strong> {selectedOrder.delivery_location}</p>
                </div>
              </div>

              {/* Items */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{item.part_name}</div>
                        <div className="text-sm text-gray-600">
                          {item.quantity} × {formatPrice(item.unit_price)}
                        </div>
                      </div>
                      <div className="font-medium">{formatPrice(item.total_price)}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(selectedOrder.total_amount)}
                  </span>
                </div>
                {selectedOrder.bulk_discount_applied && (
                  <div className="text-sm text-green-600 text-right">
                    Bulk discount: {formatPrice(selectedOrder.discount_amount)} saved
                  </div>
                )}
              </div>

              {/* Status Update */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Update Status</h3>
                <div className="flex gap-2 flex-wrap">
                  {['pending', 'confirmed', 'processing', 'delivered'].map((status) => (
                    <button
                      key={status}
                      onClick={() => showConfirmation('status', selectedOrder.id, selectedOrder.order_number, selectedOrder.status, status)}
                      disabled={selectedOrder.status === status}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedOrder.status === status
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS]}
                    </button>
                  ))}
                  <button
                    onClick={() => showConfirmation('cancel', selectedOrder.id, selectedOrder.order_number, selectedOrder.status, 'cancelled')}
                    disabled={selectedOrder.status === 'cancelled'}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      selectedOrder.status === 'cancelled'
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    Cancel Order
                  </button>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Admin Actions</h3>
                <div className="flex gap-2">
                  {(selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled') && (
                    <button
                      onClick={() => showConfirmation('archive', selectedOrder.id, selectedOrder.order_number)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      📦 Archive Order
                    </button>
                  )}
                  {selectedOrder.status === 'cancelled' && (
                    <button
                      onClick={() => showConfirmation('delete', selectedOrder.id, selectedOrder.order_number)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      🗑️ Delete Order
                    </button>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.customer_notes && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Customer Notes</h3>
                  <p className="text-sm">{selectedOrder.customer_notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <a
                  href={`tel:${selectedOrder.customer_phone}`}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700"
                >
                  📞 Call Customer
                </a>
                <a
                  href={`https://wa.me/${selectedOrder.customer_phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-3 bg-green-500 text-white text-center rounded-lg hover:bg-green-600"
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">
              {confirmModal.type === 'status' && '⚠️ Confirm Status Change'}
              {confirmModal.type === 'cancel' && '❌ Cancel Order'}
              {confirmModal.type === 'archive' && '📦 Archive Order'}
              {confirmModal.type === 'delete' && '🗑️ Delete Order'}
            </h3>
            
            <p className="text-gray-700 mb-4">{confirmModal.message}</p>
            
            {confirmModal.type === 'cancel' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Reason *
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter reason for cancellation..."
                  required
                />
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={closeConfirmation}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmedAction}
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-white ${
                  confirmModal.type === 'delete' || confirmModal.type === 'cancel'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {confirmModal.type === 'status' && 'Confirm'}
                {confirmModal.type === 'cancel' && 'Cancel Order'}
                {confirmModal.type === 'archive' && 'Archive'}
                {confirmModal.type === 'delete' && 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
