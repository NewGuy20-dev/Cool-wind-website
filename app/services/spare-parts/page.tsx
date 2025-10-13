import type { Metadata } from 'next'
import Script from 'next/script'
import { Phone, MessageCircle, ShoppingCart, CheckCircle, Star, Package, Truck, Shield } from 'lucide-react'
import { generateProductSchema, sampleReviews } from '@/lib/schema-generator'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918547229991'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.coolwind.co.in'

export const metadata: Metadata = {
  title: 'AC & Refrigerator Spare Parts Thiruvalla | Genuine Parts Kerala - Cool Wind',
  description: 'Genuine AC & refrigerator spare parts in Thiruvalla. All brands. Same-day delivery. Bulk orders. 6 month warranty. Call +91-8547229991',
  alternates: {
    canonical: '/services/spare-parts'
  }
}

export default function SparePartsPage() {
  const productSchema = generateProductSchema({
    name: 'AC & Refrigerator Spare Parts - Genuine OEM Parts',
    description: 'Comprehensive range of genuine spare parts for air conditioners and refrigerators. We stock original manufacturer parts for all major brands including compressors, thermostats, filters, coils, control panels, door seals, and more. Every part comes with genuine parts guarantee and 6 month warranty. Same-day delivery in Thiruvalla, bulk order discounts for service centers.',
    url: `${SITE_URL}/services/spare-parts`,
    brand: 'Cool Wind Services',
    category: 'Appliance Parts & Accessories',
    priceCurrency: 'INR',
    availability: 'InStock',
    condition: 'NewCondition',
    aggregateRating: {
      ratingValue: 4.7,
      reviewCount: 64
    },
    reviews: sampleReviews.spareParts
  })

  const partCategories = [
    {
      name: 'AC Parts',
      items: [
        'Compressors (All Tonnage)',
        'Cooling Coils & Condensers',
        'PCB & Control Boards',
        'Capacitors & Relays',
        'Thermostats & Sensors',
        'Remote Controls',
        'Filters & Grills',
        'Fan Motors & Blowers',
        'Gas Charging Kits',
        'Copper Tubes & Fittings'
      ]
    },
    {
      name: 'Refrigerator Parts',
      items: [
        'Compressors (All Types)',
        'Thermostats & Temperature Controllers',
        'Door Seals & Gaskets',
        'Defrost Timers & Heaters',
        'PCB & Control Modules',
        'Fan Motors',
        'Ice Maker Components',
        'Shelves & Drawers',
        'Water Filters',
        'Lighting Components'
      ]
    }
  ]

  const brands = [
    'LG', 'Samsung', 'Whirlpool', 'Godrej', 'Voltas',
    'Blue Star', 'Daikin', 'Carrier', 'Haier', 'Bosch',
    'IFB', 'Panasonic', 'Hitachi', 'O General'
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
      title: 'Bulk Orders',
      description: 'Special discounts for service centers'
    }
  ]

  return (
    <>
      <Script
        id="spare-parts-product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <main className="min-h-screen bg-neutral-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Genuine AC & Refrigerator Spare Parts
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Original parts for all brands • Same-day delivery • 6 month warranty • Bulk discounts
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
                  href={`https://wa.me/${WHATSAPP}?text=Hi, I need spare parts for my appliance`}
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

        {/* Parts Categories */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold text-neutral-800 mb-8 text-center">
              Available Spare Parts
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              {partCategories.map((category, index) => (
                <div key={index} className="card p-6">
                  <h3 className="text-2xl font-semibold text-neutral-800 mb-6">{category.name}</h3>
                  <div className="space-y-3">
                    {category.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-secondary-600 flex-shrink-0" />
                        <span className="text-neutral-700">{item}</span>
                      </div>
                    ))}
                  </div>
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
              Pricing & Delivery
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Retail Pricing</h3>
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
                    <span>Thermostats</span>
                    <span className="font-semibold">₹500 - ₹2,000</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Door Seals</span>
                    <span className="font-semibold">₹300 - ₹1,500</span>
                  </li>
                </ul>
              </div>
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Delivery Options</h3>
                <ul className="space-y-3 text-neutral-600">
                  <li>• <strong>Thiruvalla:</strong> Same-day delivery</li>
                  <li>• <strong>Pathanamthitta:</strong> Next-day delivery</li>
                  <li>• <strong>Bulk Orders:</strong> Special discounts</li>
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
              {sampleReviews.spareParts.map((review, index) => (
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
              Need Spare Parts Today?
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
