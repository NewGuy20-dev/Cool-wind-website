'use client'

import React from 'react'
import Link from 'next/link'
import { Phone, MessageCircle, Wrench, Snowflake, ShoppingCart, Recycle, Star, MapPin, Clock, CheckCircle } from 'lucide-react'
import { analytics } from '@/lib/analytics'
import dynamic from 'next/dynamic'
import { useTranslations, useLocale } from 'next-intl'
// Avoid SSR for highly interactive components that can be mutated by extensions (e.g., fdprocessedid attributes)
const ContactForm = dynamic(() => import('@/components/ContactForm'), { ssr: false })
const TestimonialCarousel = dynamic(() => import('@/components/TestimonialCarousel'), { ssr: false })
import { enhancedTestimonials, getTopTestimonialsForHome } from '@/lib/testimonials'
import { motion } from 'framer-motion'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918547229991'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'

export default function HomePage() {
  const t = useTranslations('home')
  const locale = useLocale()
  
  const services = [
    {
      icon: <Wrench className="h-8 w-8" />,
      title: t('services.ac_repair.title'),
      description: t('services.ac_repair.desc'),
      link: '/services#ac-repair',
      cta: t('services.ac_repair.cta')
    },
    {
      icon: <Snowflake className="h-8 w-8" />,
      title: t('services.refrigerator.title'),
      description: t('services.refrigerator.desc'),
      link: '/services#refrigerator-repair',
      cta: t('services.refrigerator.cta')
    },
    {
      icon: <ShoppingCart className="h-8 w-8" />,
      title: t('services.parts.title'),
      description: t('services.parts.desc'),
      link: '/services#spare-parts',
      cta: t('services.parts.cta')
    },
    {
      icon: <Recycle className="h-8 w-8" />,
      title: t('services.electronics.title'),
      description: t('services.electronics.desc'),
      link: '/services#electronics',
      cta: t('services.electronics.cta')
    }
  ]

  const testimonials = [
    {
      name: 'Priya M.',
      location: 'Thiruvalla',
      service: 'AC Repair',
      rating: 5,
      text: 'Quick response and fixed our AC same day! Very professional service.',
      date: '2024-01-15'
    },
    {
      name: 'Ravi K.',
      location: 'Pathanamthitta',
      service: 'Refrigerator Parts',
      rating: 5,
      text: 'Honest pricing and quality work on our fridge. Highly recommend!',
      date: '2024-01-10'
    },
    {
      name: 'Sarah J.',
      location: 'Thiruvalla',
      service: 'Spare Parts',
      rating: 5,
      text: 'Best service in Thiruvalla, got genuine parts delivered same day.',
      date: '2024-01-05'
    }
  ]

  const features = [
    { icon: <CheckCircle className="h-5 w-5" />, text: t('hero.features.experience') },
    { icon: <CheckCircle className="h-5 w-5" />, text: t('hero.features.parts') },
    { icon: <CheckCircle className="h-5 w-5" />, text: t('hero.features.service') },
    { icon: <CheckCircle className="h-5 w-5" />, text: t('hero.features.warranty') }
  ]

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  }

  return (
    <main>
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-secondary-50 overflow-hidden" id="main-content">
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.4 }}>
              <motion.h1 initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }} className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-800 leading-tight">
                {t('hero.headline')} 
                <span className="text-primary-600"> {t('hero.location')}</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }} className="mt-6 text-lg md:text-xl text-neutral-600 leading-relaxed">
                {t('hero.sub')}
              </motion.p>
              
              {/* Features */}
              <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} className="mt-6 grid grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <motion.div variants={itemVariants} key={index} className="flex items-center gap-2 text-sm text-neutral-600">
                    <span className="text-secondary-600">{feature.icon}</span>
                    {feature.text}
                  </motion.div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-8 flex flex-wrap gap-4">
                <motion.a variants={itemVariants}
                  href={`tel:${PHONE}`} 
                  onClick={() => analytics.phoneCallClick()} 
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Phone size={20} />
                  {t('cta.call_now')}
                </motion.a>
                <motion.a variants={itemVariants}
                  href={`https://wa.me/${WHATSAPP}?text=Hi, I need help with my appliance`}
                  onClick={() => analytics.whatsappClick()} 
                  className="btn-accent inline-flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={20} />
                  {t('cta.whatsapp')}
                </motion.a>
                <motion.div variants={itemVariants}>
                  <Link href="#contact" className="btn-secondary inline-flex items-center gap-2">
                  {t('cta.get_quote')}
                  </Link>
                </motion.div>
              </motion.div>

              {/* Contact info */}
              <div className="mt-8 flex flex-wrap gap-6 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary-600" />
                  {t('footer.location')}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary-600" />
                  {t('footer.hours')}
                </div>
              </div>
            </motion.div>

            {/* Hero Image Placeholder */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-neutral-50 to-primary-200 shadow-soft border border-neutral-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                    <Snowflake className="h-12 w-12 text-primary-600" />
                  </div>
                  <p className="text-neutral-600 font-medium">Professional AC & Refrigerator Service</p>
                  <p className="text-sm text-neutral-500 mt-2">Trusted by 1000+ customers in Kerala</p>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-secondary-100 flex items-center justify-center shadow-lg">
                <Wrench className="h-8 w-8 text-secondary-600" />
              </div>
              <div className="absolute -bottom-4 -left-4 h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center shadow-lg">
                <CheckCircle className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Services Grid */}
      <section className="py-16 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800">{t('services.heading')}</h2>
            <p className="mt-4 text-lg text-neutral-600">{t('services.sub')}</p>
          </div>
          
          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => (
              <motion.div variants={itemVariants} key={index} className="card p-6 text-center hover:shadow-lg transition-shadow">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <span className="text-primary-600">{service.icon}</span>
                </div>
                <h3 className="font-semibold text-neutral-800 mb-2">{service.title}</h3>
                <p className="text-neutral-600 text-sm mb-4">{service.description}</p>
                <Link href={service.link} className="btn-primary text-sm">
                  {service.cta}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="py-16 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800">{t('projects.heading')}</h2>
            <p className="mt-4 text-lg text-neutral-600">{t('projects.sub')}</p>
          </div>
          
          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="grid gap-6 md:grid-cols-3">
            {[
              { title: 'AC Installation', category: 'Installation', date: '2024-01-20', description: 'Split AC installation for residential complex' },
              { title: 'Fridge Repair', category: 'Repair', date: '2024-01-18', description: 'Compressor replacement for commercial refrigerator' },
              { title: 'Parts Supply', category: 'Parts', date: '2024-01-15', description: 'Bulk order for service center parts inventory' }
            ].map((project, index) => (
              <motion.div variants={itemVariants} key={index} className="card p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-primary-600 font-medium">{project.category}</span>
                  <span className="text-sm text-neutral-500">{project.date}</span>
                </div>
                <h3 className="font-semibold text-neutral-800 mb-2">{project.title}</h3>
                <p className="text-neutral-600 text-sm">{project.description}</p>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="text-center mt-8">
            <Link href={`/${locale}/portfolio`} className="btn-secondary">
              {t('projects.view_all')}
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-16 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800">{t('testimonials.heading')}</h2>
            <p className="mt-4 text-lg text-neutral-600">{t('testimonials.sub')}</p>
          </div>
          
          {/* Testimonial Carousel */}
          <TestimonialCarousel 
            testimonials={getTopTestimonialsForHome(enhancedTestimonials, 6)}
            autoScrollInterval={8000}
            showRating={true}
            showIndicators={true}
          />
          
          <div className="text-center mt-8">
            <Link href={typeof window !== 'undefined' && window.location.pathname.startsWith('/ml') ? '/ml/testimonials' : '/testimonials'} className="btn-secondary">
              {t('testimonials.read_more')}
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Preview */}
      <section className="py-16 bg-primary-50" id="contact">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800">{t('contact.heading')}</h2>
            <p className="mt-4 text-lg text-neutral-600">
              {t('contact.sub')}
            </p>
          </div>
          
          <div className="card p-8">
            <ContactForm compact />
          </div>
          
          <div className="text-center mt-8 space-y-2">
            <p className="text-neutral-600">
              <MapPin className="inline h-4 w-4 mr-1" />
              {t('footer.location')}
            </p>
            <p className="text-neutral-600">
              <Clock className="inline h-4 w-4 mr-1" />
              {t('footer.hours')}
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <a 
                href={`tel:${PHONE}`} 
                className="btn-primary inline-flex items-center gap-2"
              >
                <Phone size={18} />
                {PHONE}
              </a>
              <a 
                href={`https://wa.me/${WHATSAPP}`}
                className="btn-accent inline-flex items-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={18} />
                {t('cta.whatsapp')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}