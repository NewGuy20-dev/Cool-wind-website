'use client';

import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ArchiveBoxIcon,
  ArchiveBoxXMarkIcon
} from '@heroicons/react/24/outline';

interface TicketManagementProps {
  tickets: any[];
  onUpdate: () => void;
}

export default function TicketManagement({ tickets, onUpdate }: TicketManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingTicket, setDeletingTicket] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [archivingTicket, setArchivingTicket] = useState<any>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  
  // New state for archived view
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [archivedTickets, setArchivedTickets] = useState<any[]>([]);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);

  // Get current tickets based on active tab
  const currentTickets = activeTab === 'active' ? tickets : archivedTickets;
  
  const filteredTickets = currentTickets.filter(ticket => {
    const matchesSearch = ticket.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.task_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.problem_description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleView = (ticket: any) => {
    setSelectedTicket(ticket);
    setShowViewModal(true);
  };

  const handleEdit = (ticket: any) => {
    setEditingTicket({ ...ticket });
    setShowEditModal(true);
  };

  const handleDelete = (ticket: any) => {
    setDeletingTicket(ticket);
    setDeleteError(null);
    setIsDeleting(false);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingTicket) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);

      const response = await fetch(`/api/tasks/${deletingTicket.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
        handleCloseDeleteModal();
      } else {
        const message = await response.text();
        setDeleteError(message || 'Failed to delete task. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setDeleteError('An unexpected error occurred while deleting the task.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteConfirm(false);
    setDeletingTicket(null);
    setIsDeleting(false);
    setDeleteError(null);
  };

  const handleArchive = (ticket: any) => {
    console.log('Archive button clicked for ticket:', ticket.task_number, 'Status:', ticket.status);
    setArchivingTicket(ticket);
    setArchiveError(null);
    setIsArchiving(false);
    setShowArchiveConfirm(true);
  };

  const confirmArchive = async () => {
    if (!archivingTicket) return;

    try {
      setIsArchiving(true);
      setArchiveError(null);

      // User is already authenticated in dashboard, admin key should be available
      const adminKey = sessionStorage.getItem('admin_key');
      
      if (!adminKey) {
        setArchiveError('Session expired. Please refresh and log in again.');
        return;
      }

      const response = await fetch('/api/admin/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify({ 
          taskId: archivingTicket.id, 
          action: 'archive' 
        })
      });

      if (response.ok) {
        onUpdate();
        if (activeTab === 'archived') {
          loadArchivedTickets();
        }
        handleCloseArchiveModal();
      } else {
        const errorData = await response.json();
        setArchiveError(errorData.error || 'Failed to archive task. Please try again.');
      }
    } catch (error) {
      console.error('Error archiving task:', error);
      setArchiveError('An unexpected error occurred while archiving the task.');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleCloseArchiveModal = () => {
    setShowArchiveConfirm(false);
    setArchivingTicket(null);
    setIsArchiving(false);
    setArchiveError(null);
  };

  const loadArchivedTickets = async () => {
    if (isLoadingArchived) return;
    
    setIsLoadingArchived(true);
    try {
      // User is already authenticated in dashboard, admin key should be available
      const adminKey = sessionStorage.getItem('admin_key');
      
      if (!adminKey) {
        alert('Session expired. Please refresh and log in again.');
        setIsLoadingArchived(false);
        return;
      }

      const response = await fetch('/api/admin/tasks?archived=true', {
        headers: {
          'Authorization': `Bearer ${adminKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setArchivedTickets(data.tasks || []);
      } else {
        console.error('Failed to load archived tickets');
        alert('Failed to load archived tickets. Please try again.');
      }
    } catch (error) {
      console.error('Error loading archived tickets:', error);
      alert('Error loading archived tickets. Please try again.');
    } finally {
      setIsLoadingArchived(false);
    }
  };

  const handleUnarchive = async (ticket: any) => {
    try {
      // User is already authenticated in dashboard, admin key should be available
      const adminKey = sessionStorage.getItem('admin_key');
      
      if (!adminKey) {
        alert('Session expired. Please refresh and log in again.');
        return;
      }

      const response = await fetch('/api/admin/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify({ 
          taskId: ticket.id, 
          action: 'unarchive' 
        })
      });

      if (response.ok) {
        // Refresh both active and archived lists
        onUpdate();
        loadArchivedTickets();
      } else {
        const errorData = await response.json();
        alert(`Failed to unarchive task: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error unarchiving task:', error);
      alert('Failed to unarchive task. Please try again.');
    }
  };

  const handleTabChange = (tab: 'active' | 'archived') => {
    setActiveTab(tab);
    if (tab === 'archived' && archivedTickets.length === 0) {
      loadArchivedTickets();
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTicket) return;

    try {
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      const payload: any = {
        status: editingTicket.status,
        priority: editingTicket.priority,
        description: editingTicket.description,
      };

      // Include assigned_to only if valid UUID or explicitly cleared
      if (editingTicket.assigned_to === '' || editingTicket.assigned_to == null) {
        payload.assigned_to = null;
      } else if (typeof editingTicket.assigned_to === 'string' && UUID_REGEX.test(editingTicket.assigned_to)) {
        payload.assigned_to = editingTicket.assigned_to;
      }

      const response = await fetch(`/api/tasks/${editingTicket.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onUpdate();
        setShowEditModal(false);
        setEditingTicket(null);
      } else {
        alert('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task');
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{filteredTickets.length} results</span>
            <FunnelIcon className="h-4 w-4" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer, ticket number, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || filterStatus !== 'all' || filterPriority !== 'all') && (
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            {searchTerm && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Search: {searchTerm}
              </span>
            )}
            {filterStatus !== 'all' && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                Status: {filterStatus}
              </span>
            )}
            {filterPriority !== 'all' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                Priority: {filterPriority}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Service Tickets
            </h3>
            <div className="flex space-x-1">
              <button
                onClick={() => handleTabChange('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'active'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Active ({tickets.length})
              </button>
              <button
                onClick={() => handleTabChange('archived')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'archived'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Archived ({archivedTickets.length})
              </button>
            </div>
          </div>
        </div>

        {/* Tickets Content */}

        {filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">No tickets found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {ticket.task_number || ticket.id?.slice(0, 8)}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {ticket.problem_description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ticket.customer_name}</div>
                      <div className="text-sm text-gray-500">{ticket.phone_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatServiceType(ticket.category || 'service')}
                      </div>
                      {ticket.assigned_to && (
                        <div className="text-sm text-gray-500">
                           {ticket.assigned_to}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(ticket)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(ticket)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit Task"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        {activeTab === 'active' && (ticket.status === 'completed' || ticket.status === 'cancelled') && (
                          <button
                            onClick={() => handleArchive(ticket)}
                            className="text-green-600 hover:text-green-900"
                            title="Archive Task"
                          >
                            <ArchiveBoxIcon className="h-4 w-4" />
                          </button>
                        )}
                        {activeTab === 'archived' && (
                          <button
                            onClick={() => handleUnarchive(ticket)}
                            className="text-orange-600 hover:text-orange-900"
                            title="Unarchive Task"
                          >
                            <ArchiveBoxXMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(ticket)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Task"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Task Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Task Number</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedTicket.task_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <StatusBadge status={selectedTicket.status} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedTicket.customer_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedTicket.phone_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <div className="mt-1">
                    <PriorityBadge priority={selectedTicket.priority} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedTicket.location || 'Not specified'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Problem Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedTicket.problem_description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Source</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedTicket.source}</p>
                </div>
              </div>
              {selectedTicket.metadata && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Additional Info</label>
                  <pre className="mt-1 text-xs text-gray-600 bg-gray-50 p-3 rounded">
                    {JSON.stringify(selectedTicket.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Edit Task</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={editingTicket.status}
                  onChange={(e) => setEditingTicket({ ...editingTicket, status: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={editingTicket.priority}
                  onChange={(e) => setEditingTicket({ ...editingTicket, priority: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                <input
                  type="text"
                  value={editingTicket.assigned_to || ''}
                  onChange={(e) => setEditingTicket({ ...editingTicket, assigned_to: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter technician user ID (UUID) or leave blank to unassign"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={editingTicket.description || ''}
                  onChange={(e) => setEditingTicket({ ...editingTicket, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes or description"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <TrashIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">Delete Task</h3>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Are you sure you want to permanently remove this task? This action cannot be undone and the task will be removed from all dashboards.
              </p>

              <div className="mt-4 space-y-4">
                <div className="rounded-lg border border-red-100 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-700">Irreversible action</p>
                  <p className="mt-1 text-xs text-red-600">
                    Deleting this task will permanently remove all associated information. Consider archiving instead if you may need these details later.
                  </p>
                </div>

                <dl className="grid grid-cols-1 gap-4 text-sm text-gray-600 sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-gray-900">Task Number</dt>
                    <dd className="mt-1 text-gray-700">
                      {deletingTicket.task_number || deletingTicket.id?.slice(0, 8)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Customer</dt>
                    <dd className="mt-1 text-gray-700">
                      {deletingTicket.customer_name || 'Unknown customer'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Priority</dt>
                    <dd className="mt-1">
                      <PriorityBadge priority={deletingTicket.priority} />
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Created</dt>
                    <dd className="mt-1 text-gray-700">
                      {deletingTicket.created_at ? new Date(deletingTicket.created_at).toLocaleString() : 'Not available'}
                    </dd>
                  </div>
                </dl>

                {deletingTicket.problem_description && (
                  <div className="rounded-md border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                    <p className="font-medium text-gray-800">Problem Summary</p>
                    <p className="mt-1 whitespace-pre-wrap">{deletingTicket.problem_description}</p>
                  </div>
                )}

                {deleteError && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {deleteError}
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col space-y-3 sm:flex-row sm:justify-end sm:space-x-3 sm:space-y-0">
                <button
                  onClick={handleCloseDeleteModal}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Deleting...
                    </span>
                  ) : (
                    'Delete Task'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {showArchiveConfirm && archivingTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <ArchiveBoxIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">Archive Task</h3>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Are you sure you want to archive this completed task? Archived tasks will be moved to a separate view but can be restored later if needed.
              </p>

              <div className="mt-4 space-y-4">
                <div className="rounded-lg border border-green-100 bg-green-50 p-4">
                  <p className="text-sm font-semibold text-green-700">Safe action</p>
                  <p className="mt-1 text-xs text-green-600">
                    Archiving preserves all task data and can be undone. This helps keep your active tasks list organized.
                  </p>
                </div>

                <dl className="grid grid-cols-1 gap-4 text-sm text-gray-600 sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-gray-900">Task Number</dt>
                    <dd className="mt-1 text-gray-700">
                      {archivingTicket.task_number || archivingTicket.id?.slice(0, 8)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Customer</dt>
                    <dd className="mt-1 text-gray-700">
                      {archivingTicket.customer_name || 'Unknown customer'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Status</dt>
                    <dd className="mt-1">
                      <StatusBadge status={archivingTicket.status} />
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Created</dt>
                    <dd className="mt-1 text-gray-700">
                      {archivingTicket.created_at ? new Date(archivingTicket.created_at).toLocaleString() : 'Not available'}
                    </dd>
                  </div>
                </dl>

                {archivingTicket.problem_description && (
                  <div className="rounded-md border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                    <p className="font-medium text-gray-800">Problem Summary</p>
                    <p className="mt-1 whitespace-pre-wrap">{archivingTicket.problem_description}</p>
                  </div>
                )}

                {archiveError && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {archiveError}
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col space-y-3 sm:flex-row sm:justify-end sm:space-x-3 sm:space-y-0">
                <button
                  onClick={handleCloseArchiveModal}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                  disabled={isArchiving}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmArchive}
                  className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                  disabled={isArchiving}
                >
                  {isArchiving ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Archiving...
                    </span>
                  ) : (
                    'Archive Task'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
    completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
    cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelled' },
    new: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'New' },
    acknowledged: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Acknowledged' },
    scheduled: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Scheduled' },
    on_hold: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'On Hold' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const priorityConfig = {
    low: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Low' },
    medium: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Medium' },
    high: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'High' },
    urgent: { bg: 'bg-red-100', text: 'text-red-800', label: 'Urgent' },
    critical: { bg: 'bg-red-100', text: 'text-red-800', label: 'Critical' }
  };

  const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

function formatServiceType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
