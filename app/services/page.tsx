'use client'

import React from 'react'
import Link from 'next/link'
import { Phone, MessageCircle, Wrench, Snowflake, ShoppingCart, Cog, Star, MapPin } from 'lucide-react'
import { analytics } from '@/lib/analytics'
import { motion } from 'framer-motion'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918547229991'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'

export default function ServicesPage() {
  const services = [
    {
      icon: <Wrench className="h-12 w-12" />,
      title: 'AC Repair & Installation',
      description: 'Complete air conditioning services for all brands. From installation to repair, maintenance to gas charging.',
      features: [
        'Split AC & Window AC Repair',
        'Gas Charging & Leak Detection', 
        'New AC Installation',
        'Annual Maintenance Contracts',
        'Emergency 24/7 Service'
      ],
      brands: ['LG', 'Samsung', 'Daikin', 'Blue Star', 'Carrier', 'Voltas', 'Hitachi', 'Panasonic']
    },
    {
      icon: <Snowflake className="h-12 w-12" />,
      title: 'Refrigerator Service',
      description: 'Expert refrigerator repair for all brands and models. From cooling issues to compressor replacement.',
      features: [
        'Compressor Repair & Replacement',
        'Cooling & Temperature Issues',
        'Door Seal Replacement',
        'Ice Maker Repair',
        'Thermostat Calibration'
      ],
      brands: ['Whirlpool', 'LG', 'Samsung', 'Godrej', 'Haier', 'Bosch', 'IFB', 'Electrolux']
    },
    {
      icon: <ShoppingCart className="h-12 w-12" />,
      title: 'Spare Parts Supply',
      description: 'Genuine spare parts for all major appliance brands with warranty and fast delivery.',
      features: [
        'Original Manufacturer Parts',
        'Same Day Delivery Available',
        'Bulk Orders for Service Centers',
        '6 Month Warranty on Parts',
        'Installation Service Available'
      ],
      brands: ['All Major Brands', 'Compatible Parts', 'OEM Quality', 'Certified Genuine']
    },
    {
      icon: <Cog className="h-12 w-12" />,
      title: 'Electronics Sales',
      description: 'Quality tested second-hand electronics and appliances with warranty.',
      features: [
        'Refurbished Appliances',
        'Quality Testing Process',
        '3 Month Warranty',
        'Exchange Programs',
        'Installation Included'
      ],
      brands: ['Various Brands', 'Tested Quality', 'Budget Friendly', 'Warranty Included']
    }
  ]

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Professional AC & Refrigerator Services
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl md:text-2xl mb-8 opacity-90"
            >
              Expert repair, genuine parts, and reliable service in Thiruvalla & Pathanamthitta since 2009
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <a
                href={`tel:${PHONE}`}
                onClick={() => analytics.phoneCallClick()}
                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                <Phone size={20} />
                Call Now: {PHONE}
              </a>
              <a
                href={`https://wa.me/${WHATSAPP}?text=Hi, I need appliance service`}
                onClick={() => analytics.whatsappClick()}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={20} />
                WhatsApp Us
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Our Services
            </h2>
            <p className="text-lg text-neutral-600">
              Comprehensive appliance solutions for homes and businesses
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card p-8 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600">{service.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-neutral-800 mb-3">
                      {service.title}
                    </h3>
                    <p className="text-neutral-600 mb-6">
                      {service.description}
                    </p>
                    
                    <div className="mb-6">
                      <h4 className="font-medium text-neutral-800 mb-3">Our Services Include:</h4>
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-neutral-600">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="font-medium text-neutral-800 mb-3">Supported Brands:</h4>
                      <div className="flex flex-wrap gap-2">
                        {service.brands.map((brand, idx) => (
                          <span key={idx} className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded">
                            {brand}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <a
                        href={`tel:${PHONE}`}
                        className="btn-primary text-sm inline-flex items-center gap-1"
                      >
                        <Phone size={16} />
                        Call Now
                      </a>
                      <a
                        href={`https://wa.me/${WHATSAPP}?text=Hi, I need ${service.title.toLowerCase()} service`}
                        className="btn-secondary text-sm inline-flex items-center gap-1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle size={16} />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 bg-primary-50">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-neutral-800 mb-6">
            Service Areas
          </h2>
          <div className="flex items-center justify-center gap-2 mb-6">
            <MapPin className="h-5 w-5 text-primary-600" />
            <p className="text-lg text-neutral-600">
              We provide services across Thiruvalla, Pathanamthitta, and surrounding areas in Kerala
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {['Thiruvalla', 'Pathanamthitta', 'Kozhencherry', 'Ranni', 'Mallappally', 'Kottayam'].map((area, idx) => (
              <span key={idx} className="px-4 py-2 bg-white rounded-full text-neutral-700 font-medium">
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-neutral-800 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Need Appliance Service Today?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Call now for same-day service and genuine parts with warranty
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={`tel:${PHONE}`}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
            >
              <Phone size={20} />
              {PHONE}
            </a>
            <a
              href={`https://wa.me/${WHATSAPP}`}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={20} />
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
