'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, MapPin, Calendar, ArrowLeft, Filter, Plus } from 'lucide-react'

interface Testimonial {
  id: string
  customer_name: string
  location?: string
  service_type?: string
  rating: number
  service_date?: string
  review_text: string
  service_details?: string
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<string>('all')
  const [selectedRating, setSelectedRating] = useState<number>(0)
  
  useEffect(() => {
    fetchTestimonials()
  }, [])
  
  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials?status=approved')
      const data = await response.json()
      setTestimonials(data.testimonials || [])
    } catch (error) {
      console.error('Error fetching testimonials:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const services = [
    { id: 'all', label: 'All Services' },
    { id: 'AC Repair', label: 'AC Repair' },
    { id: 'Refrigerator Service', label: 'Refrigerator Service' },
    { id: 'Installation', label: 'Installation' },
    { id: 'Spare Parts', label: 'Spare Parts' },
    { id: 'Electronics', label: 'Electronics' }
  ]

  const filteredTestimonials = testimonials.filter(testimonial => {
    const serviceMatch = selectedService === 'all' || testimonial.service_type === selectedService
    const ratingMatch = selectedRating === 0 || testimonial.rating >= selectedRating
    return serviceMatch && ratingMatch
  })

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}
          />
        ))}
      </div>
    )
  }

  const averageRating = testimonials.length > 0 
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : '0.0'

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-4">
              Customer Testimonials
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mb-6">
              Read what our customers have to say about our AC and refrigerator services in Thiruvalla and Pathanamthitta.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {renderStars(5)}
                </div>
                <span className="text-2xl font-bold text-neutral-800">{averageRating}</span>
                <span className="text-neutral-600">out of 5</span>
              </div>
              <div className="text-neutral-600">
                <span className="font-bold text-neutral-800">{testimonials.length}</span> reviews
              </div>
              <Link href="/testimonials/add" className="btn-primary flex items-center gap-2">
                <Plus size={20} />
                Add Your Review
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3 mb-4">
            <Filter size={20} className="text-neutral-600" />
            <span className="font-medium text-neutral-700">Filter Reviews:</span>
          </div>
          
          {/* Service Filter */}
          <div className="mb-4">
            <p className="text-sm text-neutral-600 mb-2">By Service:</p>
            <div className="flex flex-wrap gap-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedService === service.id
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {service.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <p className="text-sm text-neutral-600 mb-2">By Rating:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedRating(0)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedRating === 0
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                All Ratings
              </button>
              {[5, 4].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedRating === rating
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {rating}+ <Star size={16} className="fill-yellow-400 text-yellow-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-neutral-600 mt-4">Loading testimonials...</p>
            </div>
          ) : filteredTestimonials.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-neutral-600 text-lg">No testimonials found matching your filters.</p>
              <button
                onClick={() => {
                  setSelectedService('all')
                  setSelectedRating(0)
                }}
                className="mt-4 btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-neutral-600 mb-8">
                Showing {filteredTestimonials.length} {filteredTestimonials.length === 1 ? 'review' : 'reviews'}
              </p>
              
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid gap-6 md:grid-cols-2"
              >
                {filteredTestimonials.map((testimonial) => (
                  <motion.div
                    key={testimonial.id}
                    variants={itemVariants}
                    className="card p-6 hover:shadow-lg transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-neutral-800">
                          {testimonial.customer_name}
                        </h3>
                        {testimonial.location && (
                          <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
                            <MapPin size={14} />
                            {testimonial.location}
                          </div>
                        )}
                      </div>
                      {renderStars(testimonial.rating)}
                    </div>

                    {/* Service Badge */}
                    {testimonial.service_type && (
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                          {testimonial.service_type}
                        </span>
                      </div>
                    )}

                    {/* Review Text */}
                    <p className="text-neutral-700 mb-4 leading-relaxed">
                      "{testimonial.review_text}"
                    </p>

                    {/* Service Details */}
                    {testimonial.service_details && (
                      <p className="text-sm text-neutral-500 italic mb-4">
                        Service: {testimonial.service_details}
                      </p>
                    )}

                    {/* Date */}
                    {testimonial.service_date && (
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <Calendar size={14} />
                        {new Date(testimonial.service_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-50">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-neutral-800 mb-4">
            Experience Our Quality Service
          </h2>
          <p className="text-lg text-neutral-600 mb-8">
            Join hundreds of satisfied customers across Thiruvalla and Pathanamthitta.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/#contact" className="btn-primary">
              Book a Service
            </Link>
            <Link href="/services" className="btn-secondary">
              View Our Services
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
