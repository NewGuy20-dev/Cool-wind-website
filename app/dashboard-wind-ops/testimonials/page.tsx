'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Check, X, Trash2, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Testimonial {
  id: string
  customer_name: string
  location?: string
  service_type?: string
  rating: number
  service_date?: string
  review_text: string
  service_details?: string
  status: string
  is_featured: boolean
  display_on_homepage: boolean
  created_at: string
}

export default function TestimonialsAdminPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchTestimonials()
  }, [filter])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(`/api/testimonials?status=${filter}`)
      const data = await response.json()
      setTestimonials(data.testimonials || [])
    } catch (error) {
      console.error('Error fetching testimonials:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTestimonial = async (id: string, updates: Partial<Testimonial>) => {
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        fetchTestimonials()
      }
    } catch (error) {
      console.error('Error updating testimonial:', error)
    }
  }

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchTestimonials()
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}
          />
        ))}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard-wind-ops" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
          
          <h1 className="text-4xl font-bold text-neutral-800 mb-2">
            Manage Testimonials
          </h1>
          <p className="text-neutral-600">
            Review, approve, and manage customer testimonials
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === status
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Testimonials List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-neutral-600">No testimonials found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-neutral-800">
                        {testimonial.customer_name}
                      </h3>
                      {renderStars(testimonial.rating)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        testimonial.status === 'approved' ? 'bg-green-100 text-green-700' :
                        testimonial.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {testimonial.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-neutral-500 mb-3">
                      {testimonial.location && <span>{testimonial.location}</span>}
                      {testimonial.service_type && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded">
                          {testimonial.service_type}
                        </span>
                      )}
                      {testimonial.service_date && (
                        <span>{new Date(testimonial.service_date).toLocaleDateString()}</span>
                      )}
                    </div>

                    <p className="text-neutral-700 mb-3">"{testimonial.review_text}"</p>
                    
                    {testimonial.service_details && (
                      <p className="text-sm text-neutral-500 italic">
                        Service: {testimonial.service_details}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  {testimonial.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateTestimonial(testimonial.id, { status: 'approved' })}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Check size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => updateTestimonial(testimonial.id, { status: 'rejected' })}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X size={16} />
                        Reject
                      </button>
                    </>
                  )}
                  
                  {testimonial.status === 'approved' && (
                    <>
                      <button
                        onClick={() => updateTestimonial(testimonial.id, { 
                          display_on_homepage: !testimonial.display_on_homepage 
                        })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          testimonial.display_on_homepage
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                        }`}
                      >
                        {testimonial.display_on_homepage ? <Eye size={16} /> : <EyeOff size={16} />}
                        {testimonial.display_on_homepage ? 'On Homepage' : 'Show on Homepage'}
                      </button>
                      <button
                        onClick={() => updateTestimonial(testimonial.id, { 
                          is_featured: !testimonial.is_featured 
                        })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          testimonial.is_featured
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                            : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                        }`}
                      >
                        <Star size={16} />
                        {testimonial.is_featured ? 'Featured' : 'Feature'}
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => deleteTestimonial(testimonial.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors ml-auto"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
