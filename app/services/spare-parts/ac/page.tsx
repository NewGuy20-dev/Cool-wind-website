import type { Metadata } from 'next'
import Script from 'next/script'
import { Phone, MessageCircle, CheckCircle, Star, Package, Truck, Shield } from 'lucide-react'
import { generateProductSchema, sampleReviews } from '@/lib/schema-generator'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918547229991'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.coolwind.co.in'

export const metadata: Metadata = {
  title: 'AC Spare Parts Thiruvalla | Genuine Air Conditioner Parts Kerala',
  description: 'Genuine AC spare parts for all brands in Thiruvalla Kerala. Compressors, PCB boards, capacitors, coils, filters. Same-day delivery. Call +91-8547229991',
  alternates: {
    canonical: '/services/spare-parts/ac'
  }
}

export default function ACSparePartsPage() {
  const productSchema = generateProductSchema({
    name: 'AC Spare Parts Thiruvalla',
    description: 'Genuine AC spare parts for all brands in Thiruvalla Kerala. We stock original manufacturer parts for all major brands including compressors, cooling coils, PCB boards, capacitors, thermostats, remote controls, filters, fan motors, and more. Every part comes with genuine parts guarantee and 6 month warranty. Same-day delivery in Thiruvalla, bulk order discounts available.',
    url: `${SITE_URL}/services/spare-parts/ac`,
    brand: 'Cool Wind Services',
    category: 'Air Conditioner Parts & Accessories',
    price: 2500,
    priceCurrency: 'INR',
    availability: 'InStock',
    condition: 'NewCondition',
    aggregateRating: {
      ratingValue: 4.8,
      reviewCount: 200
    },
    reviews: [
      {
        rating: 5,
        reviewBody: 'Got genuine Daikin AC compressor with warranty. Fast delivery in Thiruvalla and installation support was excellent. Highly recommend Cool Wind!',
        author: 'Arun Kumar',
        datePublished: '2024-01-25'
      },
      {
        rating: 5,
        reviewBody: 'Needed LG AC PCB board urgently for my service center. Cool Wind delivered same day with bulk discount. Great supplier!',
        author: 'Vinod Electronics',
        datePublished: '2024-01-20'
      },
      {
        rating: 5,
        reviewBody: 'Excellent quality capacitors and relays for Samsung AC. Perfect fit and reasonable pricing. Will order again.',
        author: 'Deepak Raj',
        datePublished: '2024-01-17'
      },
      {
        rating: 4,
        reviewBody: 'Good quality cooling coil for Blue Star AC. Came with warranty and working perfectly. Delivery was quick.',
        author: 'Sanjay Menon',
        datePublished: '2024-01-12'
      }
    ]
  })

  const parts = [
    'Compressors (All Tonnage)',
    'Cooling Coils & Condensers',
    'PCB & Control Boards',
    'Capacitors & Relays',
    'Thermostats & Sensors',
    'Remote Controls',
    'Filters & Grills',
    'Fan Motors & Blowers',
    'Gas Charging Kits',
    'Copper Tubes & Fittings',
    'Drain Pumps',
    'Indoor & Outdoor Units'
  ]

  const brands = [
    'LG', 'Samsung', 'Daikin', 'Blue Star', 'Carrier',
    'Voltas', 'Hitachi', 'Panasonic', 'Godrej', 'Whirlpool',
    'O General', 'Mitsubishi', 'Lloyd', 'Haier'
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
      description: 'Same-day delivery in Thiruvalla'
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: 'Bulk Discounts',
      description: 'Special pricing for service centers'
    }
  ]

  return (
    <>
      <Script
        id="ac-parts-product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <main className="min-h-screen bg-neutral-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                AC Spare Parts Thiruvalla
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Genuine parts for all brands • Same-day delivery • 6 month warranty • Bulk discounts
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
                  href={`https://wa.me/${WHATSAPP}?text=Hi, I need AC spare parts`}
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
              Available AC Parts
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
                    <span className="font-semibold">₹3,000 - ₹12,000</span>
                  </li>
                  <li className="flex justify-between">
                    <span>PCB Boards</span>
                    <span className="font-semibold">₹1,500 - ₹5,000</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Capacitors</span>
                    <span className="font-semibold">₹200 - ₹800</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Cooling Coils</span>
                    <span className="font-semibold">₹2,000 - ₹6,000</span>
                  </li>
                </ul>
              </div>
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Delivery & Warranty</h3>
                <ul className="space-y-3 text-neutral-600">
                  <li>• <strong>Thiruvalla:</strong> Same-day delivery</li>
                  <li>• <strong>Pathanamthitta:</strong> Next-day delivery</li>
                  <li>• <strong>Warranty:</strong> 6 months on all parts</li>
                  <li>• <strong>Bulk Orders:</strong> Special discounts</li>
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
              Need AC Parts Today?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Call now for availability and pricing • Same-day delivery in Thiruvalla
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
