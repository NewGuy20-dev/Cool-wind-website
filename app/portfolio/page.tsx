'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Calendar, ArrowLeft, Filter } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

export default function PortfolioPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const categories = [
    { id: 'all', label: 'All Projects' },
    { id: 'ac_repair', label: 'AC Services' },
    { id: 'refrigerator_repair', label: 'Refrigerator Services' },
    { id: 'installation', label: 'Installations' },
    { id: 'spare_parts', label: 'Spare Parts' }
  ]

  const filteredProjects = selectedCategory === 'all' 
    ? portfolioData.projects 
    : portfolioData.projects.filter(p => p.category === selectedCategory)

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  }

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
              Our Portfolio
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl">
              Browse through our completed projects and installations. We take pride in delivering quality service to our customers across Thiruvalla and Pathanamthitta.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3 mb-4">
            <Filter size={20} className="text-neutral-600" />
            <span className="font-medium text-neutral-700">Filter by Category:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-neutral-600 text-lg">No projects found in this category.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  className="card overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Project Image Placeholder */}
                  <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                    <div className="text-center p-6">
                      <p className="text-sm text-neutral-600 font-medium">
                        {project.category.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Project Details */}
                  <div className="p-6">
                    {project.featured && (
                      <span className="inline-block px-3 py-1 bg-secondary-100 text-secondary-700 text-xs font-semibold rounded-full mb-3">
                        Featured
                      </span>
                    )}
                    
                    <h3 className="text-xl font-bold text-neutral-800 mb-3">
                      {project.title}
                    </h3>
                    
                    <p className="text-neutral-600 mb-4">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-col gap-2 text-sm text-neutral-500">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-primary-600" />
                        {project.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-primary-600" />
                        {new Date(project.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-50">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-neutral-800 mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-lg text-neutral-600 mb-8">
            Get in touch with us today for a free consultation and quote.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/#contact" className="btn-primary">
              Get a Quote
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
