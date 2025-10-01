'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Clock,
  Mail
} from 'lucide-react'

// Dynamically import ContactForm to avoid SSR issues
const ContactForm = dynamic(() => import('@/components/ContactForm'), { ssr: false })

const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918547229991'

export default function ContactPage() {
  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Phone',
      details: PHONE,
      action: `tel:${PHONE}`,
      actionLabel: 'Call Now'
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: 'WhatsApp',
      details: 'Chat with us instantly',
      action: `https://wa.me/${WHATSAPP}?text=Hi, I need help with my appliance`,
      actionLabel: 'Open WhatsApp',
      external: true
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Service Area',
      details: 'Thiruvalla & Pathanamthitta',
      subDetails: 'Also serving: Kozhencherry, Mallappally, Chengannur, Adoor'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Business Hours',
      details: 'Monday - Saturday',
      subDetails: '10:00 AM - 6:00 PM',
      note: 'Emergency calls accepted 24/7'
    }
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
              Contact Us
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl">
              Get in touch with Cool Wind for all your AC and refrigerator service needs. We're here to help!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="card p-6 text-center"
              >
                <div className="mx-auto h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <span className="text-primary-600">{info.icon}</span>
                </div>
                <h3 className="font-bold text-neutral-800 mb-2">
                  {info.title}
                </h3>
                <p className="text-neutral-700 mb-1">
                  {info.details}
                </p>
                {info.subDetails && (
                  <p className="text-sm text-neutral-600 mb-2">
                    {info.subDetails}
                  </p>
                )}
                {info.note && (
                  <p className="text-xs text-secondary-600 font-medium">
                    {info.note}
                  </p>
                )}
                {info.action && (
                  <a
                    href={info.action}
                    className="mt-4 inline-block btn-primary text-sm"
                    target={info.external ? '_blank' : undefined}
                    rel={info.external ? 'noopener noreferrer' : undefined}
                  >
                    {info.actionLabel}
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Send Us a Message
            </h2>
            <p className="text-lg text-neutral-600">
              Fill out the form below and we'll get back to you within 2 hours during business hours.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="card p-8"
          >
            <ContactForm 
              title=""
              description=""
            />
          </motion.div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Our Service Area
            </h2>
            <p className="text-lg text-neutral-600">
              We proudly serve customers across Thiruvalla and Pathanamthitta districts
            </p>
          </div>

          <div className="card overflow-hidden">
            {/* Map Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
              <div className="text-center p-8">
                <MapPin className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-neutral-800 mb-2">
                  Serving Multiple Locations
                </h3>
                <p className="text-neutral-600 mb-4">
                  Thiruvalla • Pathanamthitta • Kozhencherry • Mallappally • Chengannur • Adoor
                </p>
                <p className="text-sm text-neutral-500">
                  Not sure if we cover your area? Give us a call!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                question: 'What are your response times?',
                answer: 'We typically respond to all inquiries within 2 hours during business hours. For emergency repairs, we offer same-day service in most cases.'
              },
              {
                question: 'Do you provide warranty on repairs?',
                answer: 'Yes! All our repairs come with a 6-month warranty on both parts and labor. We use only genuine parts to ensure quality and longevity.'
              },
              {
                question: 'What areas do you service?',
                answer: 'We primarily serve Thiruvalla and Pathanamthitta districts, including Kozhencherry, Mallappally, Chengannur, and Adoor. Contact us to confirm if we service your specific location.'
              },
              {
                question: 'Do you offer emergency services?',
                answer: 'Yes, we accept emergency calls 24/7. For urgent repairs, please call us directly at ' + PHONE + ' for the fastest response.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept cash, UPI, and all major digital payment methods for your convenience.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="card p-6"
              >
                <h3 className="text-lg font-bold text-neutral-800 mb-2">
                  {faq.question}
                </h3>
                <p className="text-neutral-600">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-50">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-neutral-800 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-neutral-600 mb-8">
            Contact us today for fast, reliable AC and refrigerator service.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={`tel:${PHONE}`} className="btn-primary inline-flex items-center gap-2">
              <Phone size={18} />
              Call {PHONE}
            </a>
            <a 
              href={`https://wa.me/${WHATSAPP}?text=Hi, I need help with my appliance`}
              className="btn-accent inline-flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={18} />
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
