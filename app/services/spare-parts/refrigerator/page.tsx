import type { Metadata } from 'next'
import Script from 'next/script'
import { Phone, MessageCircle, CheckCircle, Star, Package, Truck, Shield } from 'lucide-react'
import { generateProductSchema, sampleReviews } from '@/lib/schema-generator'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918547229991'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.coolwind.co.in'

export const metadata: Metadata = {
  title: 'Refrigerator Spare Parts Kerala | Original Fridge Parts with Warranty',
  description: 'Original refrigerator spare parts with warranty in Kerala. Compressors, thermostats, door seals, PCB boards for all brands. Same-day delivery. Call +91-8547229991',
  alternates: {
    canonical: '/services/spare-parts/refrigerator'
  }
}

export default function RefrigeratorSparePartsPage() {
  const productSchema = generateProductSchema({
    name: 'Refrigerator Spare Parts Kerala',
    description: 'Original refrigerator spare parts with warranty in Kerala. We stock genuine manufacturer parts for all major brands including compressors, thermostats, door seals, gaskets, defrost timers, PCB boards, fan motors, ice maker components, and more. Every part comes with genuine parts guarantee and 6 month warranty. Same-day delivery in Thiruvalla and across Kerala.',
    url: `${SITE_URL}/services/spare-parts/refrigerator`,
    brand: 'Cool Wind Services',
    category: 'Refrigerator Parts & Accessories',
    price: 1500,
    priceCurrency: 'INR',
    availability: 'InStock',
    condition: 'NewCondition',
    aggregateRating: {
      ratingValue: 4.7,
      reviewCount: 156
    },
    reviews: [
      {
        rating: 5,
        reviewBody: 'Got genuine LG refrigerator compressor with warranty. Fast delivery in Thiruvalla and installation support was excellent. Highly recommend!',
        author: 'Rajesh Kumar',
        datePublished: '2024-01-22'
      },
      {
        rating: 5,
        reviewBody: 'Needed Samsung fridge thermostat urgently. Cool Wind delivered same day with proper warranty documentation. Great service!',
        author: 'Meera Nair',
        datePublished: '2024-01-18'
      },
      {
        rating: 5,
        reviewBody: 'Excellent quality door seals for Whirlpool refrigerator. Perfect fit and reasonable pricing. Will order again.',
        author: 'Sunil Thomas',
        datePublished: '2024-01-15'
      },
      {
        rating: 4,
        reviewBody: 'Good quality PCB board for Godrej fridge. Came with warranty and working perfectly. Delivery was quick.',
        author: 'Priya Menon',
        datePublished: '2024-01-10'
      }
    ]
  })

  const parts = [
    'Compressors (All Types & Brands)',
    'Thermostats & Temperature Controllers',
    'Door Seals & Gaskets',
    'Defrost Timers & Heaters',
    'PCB & Control Modules',
    'Fan Motors & Blowers',
    'Ice Maker Components',
    'Shelves & Drawers',
    'Water Filters & Dispensers',
    'Lighting Components',
    'Evaporator Coils',
    'Condenser Units'
  ]

  const brands = [
    'Whirlpool', 'LG', 'Samsung', 'Godrej', 'Haier',
    'Bosch', 'IFB', 'Electrolux', 'Voltas', 'Panasonic',
    'Hitachi', 'Sharp', 'Videocon', 'Kelvinator'
  ]

  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: '6 Month Warranty',
      description: 'All parts backed by manufacturer warranty'
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: 'Fast Delivery',
      description: 'Same-day delivery across Kerala'
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: 'Genuine Parts',
      description: 'Original manufacturer parts only'
    }
  ]

  return (
    <>
      <Script
        id="refrigerator-parts-product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <main className="min-h-screen bg-neutral-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Refrigerator Spare Parts Kerala
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Original parts for all brands • Same-day delivery • 6 month warranty • Genuine guarantee
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
                  href={`https://wa.me/${WHATSAPP}?text=Hi, I need refrigerator spare parts`}
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

        {/* Features */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="card p-6 text-center">
                  <div className="mx-auto h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                    <span className="text-primary-600">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">{feature.title}</h3>
                  <p className="text-neutral-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Parts List */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold text-neutral-800 mb-8 text-center">
              Available Refrigerator Parts
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {parts.map((part, index) => (
                <div key={index} className="flex items-center gap-3 card p-4">
                  <CheckCircle className="h-5 w-5 text-secondary-600 flex-shrink-0" />
                  <span className="text-neutral-700">{part}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Brands */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold text-neutral-800 mb-8 text-center">
              Parts Available for All Major Brands
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {brands.map((brand, index) => (
                <span key={index} className="px-4 py-2 bg-white rounded-lg text-neutral-700 font-medium shadow-sm">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 bg-primary-50">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-3xl font-bold text-neutral-800 mb-8 text-center">
              Pricing Guide
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Common Parts</h3>
                <ul className="space-y-3 text-neutral-600">
                  <li className="flex justify-between">
                    <span>Compressors</span>
                    <span className="font-semibold">₹4,000 - ₹15,000</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Thermostats</span>
                    <span className="font-semibold">₹500 - ₹2,000</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Door Seals</span>
                    <span className="font-semibold">₹300 - ₹1,500</span>
                  </li>
                  <li className="flex justify-between">
                    <span>PCB Boards</span>
                    <span className="font-semibold">₹1,500 - ₹5,000</span>
                  </li>
                </ul>
              </div>
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Delivery & Warranty</h3>
                <ul className="space-y-3 text-neutral-600">
                  <li>• <strong>Thiruvalla:</strong> Same-day delivery</li>
                  <li>• <strong>Kerala:</strong> 1-2 days delivery</li>
                  <li>• <strong>Warranty:</strong> 6 months on all parts</li>
                  <li>• <strong>Installation:</strong> Available on request</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-3xl font-bold text-neutral-800 mb-8 text-center">
              Customer Reviews
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {productSchema.review.map((review: any, index: number) => (
                <div key={index} className="card p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(parseInt(review.reviewRating.ratingValue))].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-neutral-700 mb-4">{review.reviewBody}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-neutral-800">{review.author.name}</span>
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
              Need Refrigerator Parts Today?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Call now for availability and pricing • Same-day delivery in Kerala
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
