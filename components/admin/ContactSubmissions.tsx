'use client'

import React, { useState, useEffect } from 'react'
import { Phone, Mail, Clock, CheckCircle, AlertCircle, Eye, Edit, Trash2, Filter } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

interface ContactSubmission {
  id: string
  name: string
  phone: string
  service: string
  service_details?: string
  is_urgent: boolean
  preferred_time?: string
  status: 'pending' | 'contacted' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  contacted_at?: string
  notes?: string
  ip_address?: string
}

interface ContactStats {
  total_submissions: number
  pending: number
  contacted: number
  in_progress: number
  completed: number
  urgent: number
  today: number
  this_week: number
  this_month: number
}

const serviceLabels = {
  spare_parts: 'Spare Parts',
  ac_servicing: 'AC Service',
  refrigerator_servicing: 'Refrigerator Service',
  sales: 'Sales',
  other: 'Other'
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

export default function ContactSubmissions() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [stats, setStats] = useState<ContactStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([])
  const [filters, setFilters] = useState({
    status: '',
    service: '',
    urgent_only: false
  })
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    total: 0,
    hasMore: false
  })

  useEffect(() => {
    fetchSubmissions()
    fetchStats()
  }, [filters, pagination.offset])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.service && { service: filters.service }),
        ...(filters.urgent_only && { urgent_only: 'true' })
      })

      const response = await fetch(`/api/admin/contact-submissions?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch submissions')
      }

      setSubmissions(data.submissions)
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        hasMore: data.pagination.hasMore
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch submissions')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/contact-submissions/stats')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats')
      }

      setStats(data.stats)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const updateSubmissionStatus = async (submissionIds: string[], status: string, notes?: string) => {
    try {
      const response = await fetch('/api/admin/contact-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionIds,
          status,
          ...(notes && { notes })
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update submissions')
      }

      // Refresh data
      fetchSubmissions()
      fetchStats()
      setSelectedSubmissions([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update submissions')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUrgencyIcon = (isUrgent: boolean) => {
    return isUrgent ? (
      <AlertCircle className="h-4 w-4 text-red-500" />
    ) : (
      <Clock className="h-4 w-4 text-gray-400" />
    )
  }

  if (loading && !submissions.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size={32} />
        <span className="ml-2">Loading contact submissions...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Total Submissions</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.total_submissions}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">This Week</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.this_week}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Urgent</h3>
            <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.service}
            onChange={(e) => setFilters(prev => ({ ...prev, service: e.target.value }))}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="">All Services</option>
            {Object.entries(serviceLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.urgent_only}
              onChange={(e) => setFilters(prev => ({ ...prev, urgent_only: e.target.checked }))}
              className="rounded"
            />
            Urgent Only
          </label>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedSubmissions.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedSubmissions.length} submission(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => updateSubmissionStatus(selectedSubmissions, 'contacted')}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Mark Contacted
              </button>
              <button
                onClick={() => updateSubmissionStatus(selectedSubmissions, 'completed')}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedSubmissions.length === submissions.length && submissions.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSubmissions(submissions.map(s => s.id))
                      } else {
                        setSelectedSubmissions([])
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">Customer</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">Service</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">Created</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedSubmissions.includes(submission.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubmissions(prev => [...prev, submission.id])
                        } else {
                          setSelectedSubmissions(prev => prev.filter(id => id !== submission.id))
                        }
                      }}
                      className="rounded"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {getUrgencyIcon(submission.is_urgent)}
                      <div>
                        <div className="font-medium text-gray-900">{submission.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {submission.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {serviceLabels[submission.service as keyof typeof serviceLabels]}
                      </div>
                      {submission.service_details && (
                        <div className="text-gray-500 text-xs truncate max-w-xs">
                          {submission.service_details}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[submission.status]}`}>
                      {submission.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    {formatDate(submission.created_at)}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateSubmissionStatus([submission.id], 'contacted')}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Mark as contacted"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} submissions
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                disabled={pagination.offset === 0}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                disabled={!pagination.hasMore}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}
