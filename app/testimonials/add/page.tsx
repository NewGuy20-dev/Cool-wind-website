'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Star, Send } from 'lucide-react'

export default function AddTestimonialPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    customer_name: '',
    location: '',
    phone_number: '',
    email: '',
    review_text: '',
    rating: 5,
    service_type: '',
    service_details: '',
    service_date: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit testimonial')
      }

      setSuccess(true)
      setTimeout(() => router.push('/testimonials'), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }))
  }

  if (success) {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 text-center max-w-md"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">Thank You!</h2>
          <p className="text-neutral-600">
            Your testimonial has been published successfully! Thank you for sharing your experience with us.
          </p>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <Link href="/testimonials" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6">
            <ArrowLeft size={20} />
            Back to Testimonials
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-4">
            Share Your Experience
          </h1>
          <p className="text-lg text-neutral-600">
            Help others by sharing your experience with our services.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-2xl px-4">
          <form onSubmit={handleSubmit} className="card p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="customer_name" className="block text-sm font-medium text-neutral-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="customer_name"
                  name="customer_name"
                  required
                  value={formData.customer_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Thiruvalla"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Contact Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-neutral-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Service Type */}
              <div>
                <label htmlFor="service_type" className="block text-sm font-medium text-neutral-700 mb-2">
                  Service Type
                </label>
                <select
                  id="service_type"
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a service</option>
                  <option value="AC Repair">AC Repair</option>
                  <option value="Refrigerator Service">Refrigerator Service</option>
                  <option value="Installation">Installation</option>
                  <option value="Spare Parts">Spare Parts</option>
                  <option value="Electronics">Electronics</option>
                </select>
              </div>

              {/* Service Details */}
              <div>
                <label htmlFor="service_details" className="block text-sm font-medium text-neutral-700 mb-2">
                  Service Details
                </label>
                <input
                  type="text"
                  id="service_details"
                  name="service_details"
                  value={formData.service_details}
                  onChange={handleChange}
                  placeholder="e.g., 1.5 ton split AC gas charging"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Service Date */}
              <div>
                <label htmlFor="service_date" className="block text-sm font-medium text-neutral-700 mb-2">
                  Service Date
                </label>
                <input
                  type="date"
                  id="service_date"
                  name="service_date"
                  value={formData.service_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Rating *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                      className="focus:outline-none"
                      whileHover={{ scale: 1.2, rotate: 15 }}
                      whileTap={{ scale: 0.9, rotate: -15 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <motion.div
                        initial={false}
                        animate={{
                          scale: star <= formData.rating ? [1, 1.3, 1] : 1,
                          rotate: star <= formData.rating ? [0, 360, 0] : 0
                        }}
                        transition={{
                          duration: 0.5,
                          ease: "easeInOut"
                        }}
                      >
                        <Star
                          size={32}
                          className={star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}
                        />
                      </motion.div>
                    </motion.button>
                  ))}
                </div>
                <p className="text-sm text-neutral-600 mt-2">
                  {formData.rating === 5 && '⭐ Excellent!'}
                  {formData.rating === 4 && '👍 Very Good!'}
                  {formData.rating === 3 && '😊 Good'}
                  {formData.rating === 2 && '😐 Fair'}
                  {formData.rating === 1 && '😞 Poor'}
                </p>
              </div>

              {/* Review Text */}
              <div>
                <label htmlFor="review_text" className="block text-sm font-medium text-neutral-700 mb-2">
                  Your Review * (minimum 10 characters)
                </label>
                <textarea
                  id="review_text"
                  name="review_text"
                  required
                  rows={5}
                  value={formData.review_text}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Share your experience with our service..."
                />
                <p className="text-sm text-neutral-500 mt-1">
                  {formData.review_text.length} characters
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Submit Testimonial
                  </>
                )}
              </button>

              <p className="text-sm text-neutral-500 text-center">
                Your testimonial will be published immediately after submission.
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
