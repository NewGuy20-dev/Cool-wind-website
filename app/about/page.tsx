'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Award, 
  Users, 
  Clock, 
  Shield, 
  Wrench, 
  Heart,
  CheckCircle,
  MapPin,
  Phone
} from 'lucide-react'

const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'

export default function AboutPage() {
  const stats = [
    { icon: <Users className="h-8 w-8" />, value: '1000+', label: 'Happy Customers' },
    { icon: <Clock className="h-8 w-8" />, value: '15+', label: 'Years Experience' },
    { icon: <Award className="h-8 w-8" />, value: '100%', label: 'Genuine Parts' },
    { icon: <Shield className="h-8 w-8" />, value: '6 Month', label: 'Warranty' }
  ]

  const values = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: 'Customer First',
      description: 'We prioritize your satisfaction and work tirelessly to exceed your expectations with every service call.'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Quality Assurance',
      description: 'Only genuine parts and professional workmanship. We stand behind our work with comprehensive warranties.'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Timely Service',
      description: 'We value your time. Same-day service available for most repairs in Thiruvalla and Pathanamthitta.'
    },
    {
      icon: <Wrench className="h-6 w-6" />,
      title: 'Expert Technicians',
      description: 'Our certified technicians are trained on all major brands and stay updated with the latest repair techniques.'
    }
  ]

  const milestones = [
    { year: '2009', event: 'Cool Wind established in Thiruvalla' },
    { year: '2012', event: 'Expanded to Pathanamthitta district' },
    { year: '2015', event: 'Introduced spare parts supply service' },
    { year: '2018', event: 'Started refurbished electronics division' },
    { year: '2024', event: 'Serving 1000+ satisfied customers' }
  ]

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
              About Cool Wind
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl">
              Your trusted partner for AC and refrigerator services in Thiruvalla and Pathanamthitta since 2009.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="grid gap-8 md:grid-cols-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <div className="mx-auto h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <span className="text-primary-600">{stat.icon}</span>
                </div>
                <div className="text-3xl font-bold text-neutral-800 mb-2">
                  {stat.value}
                </div>
                <div className="text-neutral-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-6">
              Our Story
            </h2>
            <div className="prose prose-lg max-w-none text-neutral-600 space-y-4">
              <p>
                Cool Wind was founded in 2009 with a simple mission: to provide reliable, honest, and professional AC and refrigerator services to the people of Thiruvalla and surrounding areas.
              </p>
              <p>
                What started as a small repair shop has grown into a trusted name in the region, serving over 1000 satisfied customers. Our success is built on a foundation of quality workmanship, genuine parts, and exceptional customer service.
              </p>
              <p>
                Today, we offer a comprehensive range of services including AC and refrigerator repair, installation, spare parts supply, and quality refurbished electronics. Our team of certified technicians brings years of experience and expertise to every job, ensuring your appliances are in the best hands.
              </p>
              <p>
                We're proud to be a local business serving our community, and we're committed to maintaining the trust our customers have placed in us for over 15 years.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-neutral-600">
              The principles that guide everything we do
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-8 md:grid-cols-2"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="card p-6"
              >
                <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                  <span className="text-primary-600">{value.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-3">
                  {value.title}
                </h3>
                <p className="text-neutral-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-neutral-600">
              Key milestones in our growth
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-8"
          >
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                    <CheckCircle size={24} />
                  </div>
                </div>
                <div className="flex-grow pt-2">
                  <div className="text-xl font-bold text-primary-600 mb-1">
                    {milestone.year}
                  </div>
                  <div className="text-lg text-neutral-700">
                    {milestone.event}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-16 bg-primary-50">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Service Area
            </h2>
            <p className="text-lg text-neutral-600 mb-6">
              We proudly serve the following areas in Kerala
            </p>
          </div>

          <div className="card p-8">
            <div className="flex items-start gap-3 mb-6">
              <MapPin className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-neutral-800 mb-3">
                  Primary Service Areas
                </h3>
                <div className="grid md:grid-cols-2 gap-3 text-neutral-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-secondary-600" />
                    Thiruvalla
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-secondary-600" />
                    Pathanamthitta
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-secondary-600" />
                    Kozhencherry
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-secondary-600" />
                    Mallappally
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-secondary-600" />
                    Chengannur
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-secondary-600" />
                    Adoor
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="text-neutral-600 mb-4">
                Not sure if we service your area? Give us a call and we'll let you know!
              </p>
              <a
                href={`tel:${PHONE}`}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Phone size={18} />
                Call {PHONE}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-neutral-800 mb-4">
            Ready to Experience Quality Service?
          </h2>
          <p className="text-lg text-neutral-600 mb-8">
            Join our family of satisfied customers today.
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
