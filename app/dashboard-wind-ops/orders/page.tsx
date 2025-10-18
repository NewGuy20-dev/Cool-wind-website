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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 p-6">
      {/* Back to Dashboard */}
      <button
        onClick={() => router.push('/dashboard-wind-ops')}
        className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2 font-semibold bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all border border-blue-100"
      >
        ← Back to Dashboard
      </button>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Bulk Orders</h1>
        <p className="text-gray-600 text-lg">Manage spare parts bulk orders and track deliveries</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-yellow-100 hover:border-yellow-200 group">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-600">Pending</div>
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/></svg>
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.pending}</div>
            <div className="text-xs text-gray-500 mt-2">Awaiting confirmation</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-blue-100 hover:border-blue-200 group">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-600">Confirmed</div>
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.confirmed}</div>
            <div className="text-xs text-gray-500 mt-2">Ready to process</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-purple-100 hover:border-purple-200 group">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-600">Processing</div>
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.processing}</div>
            <div className="text-xs text-gray-500 mt-2">Being prepared</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-green-100 hover:border-green-200 group">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-600">Delivered</div>
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/></svg>
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.delivered}</div>
            <div className="text-xs text-gray-500 mt-2">Successfully completed</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-red-100 hover:border-red-200 group">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-600">Cancelled</div>
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.cancelled}</div>
            <div className="text-xs text-gray-500 mt-2">Order cancellations</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-green-400 group">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-white/90">Total Value</div>
              <div className="p-2 bg-white/20 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/></svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{formatPrice(stats.total_value)}</div>
            <div className="text-xs text-white/80 mt-2">Total order revenue</div>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all">
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="font-bold text-gray-900">{order.order_number}</div>
                  <div className="text-xs text-gray-500 font-medium mt-1 bg-gray-100 px-2 py-0.5 rounded inline-block">{order.source}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm font-semibold text-gray-900">{order.customer_name}</div>
                  <div className="text-xs text-gray-600 font-medium mt-1">{order.customer_phone}</div>
                  <div className="text-xs text-gray-500">{order.customer_email}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">{order.items.length} items</div>
                  {order.bulk_discount_applied && (
                    <div className="text-xs font-semibold text-green-600 mt-1 bg-green-50 px-2 py-0.5 rounded inline-block">🎉 Bulk discount</div>
                  )}
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-base font-bold text-gray-900">
                    {formatPrice(order.total_amount)}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm bg-${ORDER_STATUS_COLORS[order.status]}-100 text-${ORDER_STATUS_COLORS[order.status]}-800`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">
                  {getRelativeTime(order.created_at)}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-semibold transition-colors"
                    >
                      View
                    </button>
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-semibold transition-colors"
                    >
                      Call
                    </a>
                    <a
                      href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-semibold transition-colors"
                    >
                      WhatsApp
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
              </svg>
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">No orders yet</p>
            <p className="text-sm text-gray-500">Orders will appear here once customers place bulk orders</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 animate-slideUp">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Order {selectedOrder.order_number}
                  </h2>
                  <p className="text-sm text-gray-600 mt-2 font-medium">{formatDateTime(selectedOrder.created_at)}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Customer Info */}
              <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2"><span className="font-semibold text-gray-700 w-20">Name:</span> <span className="text-gray-900 font-medium">{selectedOrder.customer_name}</span></p>
                  <p className="flex items-center gap-2"><span className="font-semibold text-gray-700 w-20">Phone:</span> <span className="text-gray-900 font-medium">{selectedOrder.customer_phone}</span></p>
                  <p className="flex items-center gap-2"><span className="font-semibold text-gray-700 w-20">Email:</span> <span className="text-gray-900 font-medium">{selectedOrder.customer_email}</span></p>
                  <p className="flex items-center gap-2"><span className="font-semibold text-gray-700 w-20">Location:</span> <span className="text-gray-900 font-medium">{selectedOrder.delivery_location}</span></p>
                </div>
              </div>

              {/* Items */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                      <div>
                        <div className="font-semibold text-gray-900">{item.part_name}</div>
                        <div className="text-sm text-gray-600 font-medium mt-1">
                          {item.quantity} × {formatPrice(item.unit_price)}
                        </div>
                      </div>
                      <div className="font-bold text-gray-900">{formatPrice(item.total_price)}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-5 border-t-2 border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-lg">Total:</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {formatPrice(selectedOrder.total_amount)}
                  </span>
                </div>
                {selectedOrder.bulk_discount_applied && (
                  <div className="text-sm font-semibold text-green-700 text-right mt-2 bg-green-50 px-3 py-1 rounded-lg inline-block float-right">
                    🎉 Bulk discount: {formatPrice(selectedOrder.discount_amount)} saved
                  </div>
                )}
              </div>

              {/* Status Update */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Update Status</h3>
                <div className="flex gap-3 flex-wrap">
                  {['pending', 'confirmed', 'processing', 'delivered'].map((status) => (
                    <button
                      key={status}
                      onClick={() => showConfirmation('status', selectedOrder.id, selectedOrder.order_number, selectedOrder.status, status)}
                      disabled={selectedOrder.status === status}
                      className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md ${
                        selectedOrder.status === status
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                      }`}
                    >
                      {ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS]}
                    </button>
                  ))}
                  <button
                    onClick={() => showConfirmation('cancel', selectedOrder.id, selectedOrder.order_number, selectedOrder.status, 'cancelled')}
                    disabled={selectedOrder.status === 'cancelled'}
                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md ${
                      selectedOrder.status === 'cancelled'
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
                    }`}
                  >
                    Cancel Order
                  </button>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Admin Actions</h3>
                <div className="flex gap-3">
                  {(selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled') && (
                    <button
                      onClick={() => showConfirmation('archive', selectedOrder.id, selectedOrder.order_number)}
                      className="px-5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 font-semibold transition-all shadow-sm hover:shadow-md"
                    >
                      📦 Archive Order
                    </button>
                  )}
                  {selectedOrder.status === 'cancelled' && (
                    <button
                      onClick={() => showConfirmation('delete', selectedOrder.id, selectedOrder.order_number)}
                      className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 font-semibold transition-all shadow-sm hover:shadow-md"
                    >
                      🗑️ Delete Order
                    </button>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.customer_notes && (
                <div className="mb-6 p-5 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">📝 Customer Notes</h3>
                  <p className="text-sm text-gray-700 font-medium">{selectedOrder.customer_notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <a
                  href={`tel:${selectedOrder.customer_phone}`}
                  className="flex-1 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  📞 Call Customer
                </a>
                <a
                  href={`https://wa.me/${selectedOrder.customer_phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-5 py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-center rounded-xl hover:from-green-600 hover:to-green-700 font-semibold transition-all shadow-lg hover:shadow-xl"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 animate-slideUp">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {confirmModal.type === 'status' && '⚠️ Confirm Status Change'}
              {confirmModal.type === 'cancel' && '❌ Cancel Order'}
              {confirmModal.type === 'archive' && '📦 Archive Order'}
              {confirmModal.type === 'delete' && '🗑️ Delete Order'}
            </h3>
            
            <p className="text-gray-700 mb-5 font-medium">{confirmModal.message}</p>
            
            {confirmModal.type === 'cancel' && (
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Cancellation Reason *
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                  rows={3}
                  placeholder="Enter reason for cancellation..."
                  required
                />
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={closeConfirmation}
                className="flex-1 px-5 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all shadow-sm hover:shadow"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmedAction}
                className={`flex-1 px-5 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl ${
                  confirmModal.type === 'delete' || confirmModal.type === 'cancel'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
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
