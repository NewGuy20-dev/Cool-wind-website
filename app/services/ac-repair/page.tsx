import type { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'
import { Phone, MessageCircle, Wrench, CheckCircle, Star } from 'lucide-react'
import { generateServiceSchema, sampleReviews } from '@/lib/schema-generator'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918547229991'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.coolwind.co.in'

export const metadata: Metadata = {
  title: 'AC Repair & Installation Thiruvalla | Split AC Service Kerala - Cool Wind',
  description: 'Expert AC repair service in Thiruvalla & Pathanamthitta. Split AC, Window AC repair, gas charging, installation. Same-day service. Call +91-8547229991',
  alternates: {
    canonical: '/services/ac-repair'
  }
}

export default function ACRepairPage() {
  const serviceSchema = generateServiceSchema({
    name: 'AC Repair & Installation Service Thiruvalla',
    description: 'Professional air conditioning repair and installation service in Thiruvalla, Pathanamthitta, and surrounding areas. We service all brands including LG, Samsung, Daikin, Blue Star, Carrier, Voltas, Hitachi, and Panasonic. Services include split AC repair, window AC repair, gas charging, leak detection, new AC installation, and annual maintenance contracts with 24/7 emergency service.',
    url: `${SITE_URL}/services/ac-repair`,
    provider: 'Cool Wind Services',
    areaServed: ['Thiruvalla', 'Pathanamthitta', 'Kozhencherry', 'Mallappally', 'Ranni', 'Adoor', 'Pandalam'],
    priceRange: '₹500-₹5000',
    aggregateRating: {
      ratingValue: 4.8,
      reviewCount: 87
    },
    reviews: sampleReviews.acRepair
  })

  const services = [
    'Split AC Repair & Service',
    'Window AC Repair',
    'AC Gas Charging (R22, R410A, R32)',
    'Gas Leak Detection & Repair',
    'New AC Installation',
    'AC Uninstallation & Reinstallation',
    'Compressor Replacement',
    'PCB Repair & Replacement',
    'Cooling Coil Cleaning',
    'Annual Maintenance Contracts',
    'Emergency 24/7 Service',
    'Preventive Maintenance'
  ]

  const brands = [
    'LG', 'Samsung', 'Daikin', 'Blue Star', 'Carrier', 
    'Voltas', 'Hitachi', 'Panasonic', 'Godrej', 'Whirlpool',
    'O General', 'Mitsubishi', 'Lloyd', 'Haier'
  ]

  return (
    <>
      <Script
        id="ac-repair-service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <main className="min-h-screen bg-neutral-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                AC Repair & Installation Service in Thiruvalla
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Expert AC service for all brands • Same-day repair • Genuine parts • 6 month warranty
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href={`tel:${PHONE}`}
                  className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
                >
                  <Phone size={20} />
                  Call: {PHONE}
                </a>
                <a
                  href={`https://wa.me/${WHATSAPP}?text=Hi, I need AC repair service`}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={20} />
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Services List */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold text-neutral-800 mb-8 text-center">
              Our AC Services
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <div key={index} className="flex items-center gap-3 card p-4">
                  <CheckCircle className="h-5 w-5 text-secondary-600 flex-shrink-0" />
                  <span className="text-neutral-700">{service}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Brands */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold text-neutral-800 mb-8 text-center">
              Brands We Service
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {brands.map((brand, index) => (
                <span key={index} className="px-4 py-2 bg-neutral-100 rounded-lg text-neutral-700 font-medium">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-3xl font-bold text-neutral-800 mb-8 text-center">
              Service Pricing
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Basic Service</h3>
                <p className="text-3xl font-bold text-primary-600 mb-4">₹500 - ₹1,500</p>
                <ul className="space-y-2 text-neutral-600">
                  <li>• AC Cleaning & Servicing</li>
                  <li>• Filter Cleaning</li>
                  <li>• Basic Troubleshooting</li>
                  <li>• Performance Check</li>
                </ul>
              </div>
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Repair Service</h3>
                <p className="text-3xl font-bold text-primary-600 mb-4">₹1,000 - ₹5,000</p>
                <ul className="space-y-2 text-neutral-600">
                  <li>• Gas Charging</li>
                  <li>• Compressor Repair</li>
                  <li>• PCB Replacement</li>
                  <li>• Leak Detection & Fix</li>
                </ul>
              </div>
            </div>
            <p className="text-center text-neutral-600 mt-6">
              *Prices vary based on AC type, brand, and issue. Contact us for accurate quote.
            </p>
          </div>
        </section>

        {/* Reviews */}
        <section className="py-16 bg-primary-50">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-3xl font-bold text-neutral-800 mb-8 text-center">
              Customer Reviews
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {sampleReviews.acRepair.map((review, index) => (
                <div key={index} className="card p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-neutral-700 mb-4">{review.reviewBody}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-neutral-800">{review.author}</span>
                    <span className="text-neutral-500">{review.datePublished}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-neutral-800 text-white">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Need AC Repair Today?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Call now for same-day service in Thiruvalla & Pathanamthitta
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
    </>
  )
}
