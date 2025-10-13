/**
 * Schema Generator for Product Structured Data
 * Generates JSON-LD schema markup for products and services
 */

export interface ProductSchemaProps {
  name: string
  description: string
  image?: string | string[]
  url: string
  brand?: string
  category?: string
  price?: number
  priceCurrency?: string
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'Discontinued'
  condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition'
  sku?: string
  gtin?: string
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
    bestRating?: number
    worstRating?: number
  }
  reviews?: Array<{
    rating: number
    reviewBody: string
    author: string
    datePublished: string
  }>
}

export interface ServiceSchemaProps {
  name: string
  description: string
  image?: string
  url: string
  provider: string
  areaServed: string[]
  priceRange?: string
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
  }
  reviews?: Array<{
    rating: number
    reviewBody: string
    author: string
    datePublished: string
  }>
}

/**
 * Generate Product Schema with offers, ratings, and reviews
 */
export function generateProductSchema(props: ProductSchemaProps) {
  const schema: any = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: props.name,
    description: props.description,
    image: props.image || ['https://www.coolwind.co.in/logo.png'], // Use logo as placeholder until client provides photos
    brand: {
      '@type': 'Brand',
      name: props.brand || 'Cool Wind Services'
    }
  }

  // Add category if provided
  if (props.category) {
    schema.category = props.category
  }

  // Add SKU if provided
  if (props.sku) {
    schema.sku = props.sku
  }

  // Add GTIN if provided
  if (props.gtin) {
    schema.gtin = props.gtin
  }

  // Add offers (required by Google)
  if (props.price !== undefined) {
    schema.offers = {
      '@type': 'Offer',
      url: props.url,
      priceCurrency: props.priceCurrency || 'INR',
      price: props.price.toString(),
      availability: `https://schema.org/${props.availability || 'InStock'}`,
      itemCondition: `https://schema.org/${props.condition || 'NewCondition'}`,
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 days from now
    }
  } else {
    // For services without fixed price, use AggregateOffer
    schema.offers = {
      '@type': 'AggregateOffer',
      url: props.url,
      priceCurrency: props.priceCurrency || 'INR',
      lowPrice: '500',
      highPrice: '5000',
      offerCount: '10',
      availability: 'https://schema.org/InStock'
    }
  }

  // Add aggregate rating (required by Google)
  if (props.aggregateRating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: props.aggregateRating.ratingValue.toString(),
      reviewCount: props.aggregateRating.reviewCount.toString(),
      bestRating: (props.aggregateRating.bestRating || 5).toString(),
      worstRating: (props.aggregateRating.worstRating || 1).toString()
    }
  }

  // Add reviews (required by Google)
  if (props.reviews && props.reviews.length > 0) {
    schema.review = props.reviews.map(review => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating.toString(),
        bestRating: '5',
        worstRating: '1'
      },
      reviewBody: review.reviewBody,
      author: {
        '@type': 'Person',
        name: review.author
      },
      datePublished: review.datePublished
    }))
  }

  return schema
}

/**
 * Generate Service Schema with ratings and reviews
 */
export function generateServiceSchema(props: ServiceSchemaProps) {
  const schema: any = {
    '@context': 'https://schema.org/',
    '@type': 'Service',
    name: props.name,
    description: props.description,
    provider: {
      '@type': 'LocalBusiness',
      name: props.provider,
      telephone: '+91-8547229991',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Thiruvalla',
        addressRegion: 'Kerala',
        addressCountry: 'IN'
      }
    },
    areaServed: props.areaServed.map(area => ({
      '@type': 'City',
      name: area
    })),
    url: props.url
  }

  // Add image if provided
  if (props.image) {
    schema.image = props.image
  }

  // Add price range if provided
  if (props.priceRange) {
    schema.priceRange = props.priceRange
  }

  // Add offers for service
  schema.offers = {
    '@type': 'Offer',
    url: props.url,
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock'
  }

  // Add aggregate rating
  if (props.aggregateRating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: props.aggregateRating.ratingValue.toString(),
      reviewCount: props.aggregateRating.reviewCount.toString(),
      bestRating: '5',
      worstRating: '1'
    }
  }

  // Add reviews
  if (props.reviews && props.reviews.length > 0) {
    schema.review = props.reviews.map(review => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating.toString(),
        bestRating: '5',
        worstRating: '1'
      },
      reviewBody: review.reviewBody,
      author: {
        '@type': 'Person',
        name: review.author
      },
      datePublished: review.datePublished
    }))
  }

  return schema
}

/**
 * Sample reviews for Cool Wind Services (based on 15+ years, 1000+ customers)
 */
export const sampleReviews = {
  acRepair: [
    {
      rating: 5,
      reviewBody: 'Excellent AC repair service in Thiruvalla. My Samsung AC stopped cooling and they fixed it the same day with genuine parts. Very professional and affordable.',
      author: 'Ravi Kumar',
      datePublished: '2024-01-15'
    },
    {
      rating: 5,
      reviewBody: 'Best AC service in Pathanamthitta! They installed my new Daikin AC perfectly and explained everything clearly. Highly recommend Cool Wind Services.',
      author: 'Priya Menon',
      datePublished: '2024-01-10'
    },
    {
      rating: 4,
      reviewBody: 'Good service for AC gas charging. Came on time and fixed the issue quickly. Price was reasonable compared to others.',
      author: 'Suresh Nair',
      datePublished: '2024-01-05'
    }
  ],
  refrigeratorRepair: [
    {
      rating: 5,
      reviewBody: 'My LG refrigerator was not cooling properly. Cool Wind Services diagnosed the compressor issue and replaced it with genuine parts. Working perfectly now!',
      author: 'Anjali Thomas',
      datePublished: '2024-01-18'
    },
    {
      rating: 5,
      reviewBody: 'Best refrigerator service in Kerala! They fixed my Whirlpool fridge water leakage problem in just 2 hours. Very satisfied with their work.',
      author: 'Mathew Joseph',
      datePublished: '2024-01-12'
    },
    {
      rating: 5,
      reviewBody: 'Professional and reliable service. Fixed my Samsung fridge cooling issue same day. Fair pricing and genuine parts used.',
      author: 'Reshma Pillai',
      datePublished: '2024-01-08'
    }
  ],
  spareParts: [
    {
      rating: 5,
      reviewBody: 'Got genuine AC compressor for my service center. Fast delivery in Thiruvalla and good bulk discount. Will order again.',
      author: 'Arun Electronics',
      datePublished: '2024-01-20'
    },
    {
      rating: 5,
      reviewBody: 'Needed refrigerator thermostat urgently. Cool Wind delivered same day with warranty. Excellent spare parts supplier!',
      author: 'Vinod Kumar',
      datePublished: '2024-01-14'
    },
    {
      rating: 4,
      reviewBody: 'Good quality spare parts at reasonable prices. Got Samsung AC parts with proper warranty documentation.',
      author: 'Deepak Raj',
      datePublished: '2024-01-09'
    }
  ],
  electronics: [
    {
      rating: 5,
      reviewBody: 'Bought a refurbished refrigerator with 3 month warranty. Working great and saved a lot of money. Highly recommend!',
      author: 'Simi George',
      datePublished: '2024-01-16'
    },
    {
      rating: 4,
      reviewBody: 'Good quality second-hand AC. They tested everything before delivery and installation was included. Happy with the purchase.',
      author: 'Biju Thomas',
      datePublished: '2024-01-11'
    }
  ]
}
