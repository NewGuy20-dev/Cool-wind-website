import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
	title: 'Cool Wind Services | AC & Refrigerator Spare Parts, Repairs in Thiruvalla, Kerala',
	description:
		'Best AC repair Thiruvalla & refrigerator service Kerala since 2009. Genuine spare parts, same-day service. Expert appliance repair Pathanamthitta. Call +91-8547229991.',
	metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
	alternates: { 
		languages: { 
			en: '/', 
			ml: '/ml' 
		},
		canonical: '/'
	},
	openGraph: {
		title: 'Cool Wind Services - Best AC Repair Thiruvalla & Refrigerator Service Kerala',
		description: 'Expert AC repair Thiruvalla & refrigerator service Kerala since 2009. Genuine parts, same-day service, appliance repair Pathanamthitta. Call +91-8547229991.',
		url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
		siteName: 'Cool Wind Services',
		locale: 'en_IN',
		type: 'website',
		images: [
			{
				url: '/logo.png',
				width: 800,
				height: 600,
				alt: 'Cool Wind Services - AC & Refrigerator Repair Thiruvalla Kerala'
			}
		]
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Cool Wind Services - AC Repair Thiruvalla & Refrigerator Service Kerala',
		description: 'Expert AC repair & refrigerator service in Thiruvalla Kerala since 2009. Same-day parts delivery. Call +91-8547229991.',
		images: ['/logo.png']
	},
	keywords: [
		'AC repair Thiruvalla',
		'refrigerator service Kerala',
		'appliance repair Pathanamthitta',
		'AC service Thiruvalla',
		'refrigerator repair Kerala',
		'AC spare parts Thiruvalla',
		'refrigerator spare parts Kerala',
		'AC installation Thiruvalla',
		'appliance service Pathanamthitta',
		'Cool Wind Services',
		'AC repair near me',
		'refrigerator repair near me'
	],
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	icons: {
		icon: [
			{ url: '/logo.png', type: 'image/png' },
		],
		apple: [{ url: '/logo.png' }],
		shortcut: ['/logo.png'],
	},
}

const inter = Inter({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
	display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const localBusinessSchema = {
		"@context": "https://schema.org",
		"@type": "LocalBusiness",
		"@id": "https://coolwindservices.com/#organization",
		name: "Cool Wind Services",
		alternateName: "Cool Wind AC & Refrigerator Service",
		description: "Leading AC repair Thiruvalla & refrigerator service Kerala since 2009. Expert appliance repair Pathanamthitta with genuine spare parts and same-day service.",
		url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
		telephone: "+91-8547229991",
		email: "info@coolwindservices.com",
		foundingDate: "2009",
		address: {
			"@type": "PostalAddress",
			streetAddress: "Main Road",
			addressLocality: "Thiruvalla",
			addressRegion: "Kerala",
			postalCode: "689101",
			addressCountry: "IN"
		},
		geo: {
			"@type": "GeoCoordinates",
			latitude: 9.3833,
			longitude: 76.5667
		},
		areaServed: [
			{
				"@type": "City",
				name: "Thiruvalla",
				containedInPlace: {
					"@type": "State",
					name: "Kerala"
				}
			},
			{
				"@type": "City", 
				name: "Pathanamthitta",
				containedInPlace: {
					"@type": "State",
					name: "Kerala"
				}
			}
		],
		openingHoursSpecification: [
			{
				"@type": "OpeningHoursSpecification",
				dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
				opens: "10:00",
				closes: "18:00"
			}
		],
		priceRange: "₹₹",
		currenciesAccepted: "INR",
		paymentAccepted: ["Cash", "Credit Card", "UPI", "Bank Transfer"],
		hasOfferCatalog: {
			"@type": "OfferCatalog",
			name: "AC & Refrigerator Parts and Services",
			itemListElement: [
				{
					"@type": "Offer",
					itemOffered: {
						"@type": "Product",
						name: "AC Spare Parts Thiruvalla",
						category: "Appliance Parts",
						description: "Genuine AC spare parts for all brands in Thiruvalla Kerala"
					}
				},
				{
					"@type": "Offer", 
					itemOffered: {
						"@type": "Product",
						name: "Refrigerator Spare Parts Kerala", 
						category: "Appliance Parts",
						description: "Original refrigerator spare parts with warranty in Kerala"
					}
				},
				{
					"@type": "Offer",
					itemOffered: {
						"@type": "Service",
						name: "AC Repair Service Thiruvalla",
						category: "Appliance Repair",
						description: "Expert AC repair and installation service in Thiruvalla Pathanamthitta"
					}
				},
				{
					"@type": "Offer",
					itemOffered: {
						"@type": "Service", 
						name: "Refrigerator Repair Service Kerala",
						category: "Appliance Repair",
						description: "Professional refrigerator repair service across Kerala"
					}
				}
			]
		},
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: "4.8",
			reviewCount: "150",
			bestRating: "5",
			worstRating: "1"
		},
		review: [
			{
				"@type": "Review",
				reviewRating: {
					"@type": "Rating",
					ratingValue: "5"
				},
				author: {
					"@type": "Person",
					name: "Ravi Kumar"
				},
				reviewBody: "Excellent AC repair service in Thiruvalla. Fixed my Samsung AC same day with genuine parts."
			},
			{
				"@type": "Review", 
				reviewRating: {
					"@type": "Rating",
					ratingValue: "5"
				},
				author: {
					"@type": "Person",
					name: "Priya Nair"
				},
				reviewBody: "Best refrigerator service in Kerala. Professional team and reasonable prices."
			}
		],
		sameAs: [
			"https://www.facebook.com/coolwindservices",
			"https://www.instagram.com/coolwindservices", 
			"https://maps.google.com/?q=Cool+Wind+Services+Thiruvalla"
		]
	}

	const websiteSchema = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		"@id": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/#website`,
		url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
		name: "Cool Wind Services",
		description: "AC repair Thiruvalla & refrigerator service Kerala since 2009",
		publisher: {
			"@id": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/#organization`
		},
		potentialAction: [
			{
				"@type": "SearchAction",
				target: {
					"@type": "EntryPoint",
					urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/search?q={search_term_string}`
				},
				"query-input": "required name=search_term_string"
			}
		],
		inLanguage: ["en-IN", "ml-IN"]
	}

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* Enhanced Google Analytics */}
				{process.env.NEXT_PUBLIC_GA_ID ? (
					<>
						<Script
							src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
							strategy="afterInteractive"
						/>
						<Script id="gtag-init" strategy="afterInteractive">
							{`
								window.dataLayer = window.dataLayer || [];
								function gtag(){dataLayer.push(arguments);} 
								gtag('js', new Date());
								gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
									page_title: 'Cool Wind Services - AC Repair Thiruvalla',
									custom_map: {
										'custom_dimension_1': 'business_type',
										'custom_dimension_2': 'service_area'
									}
								});
								gtag('event', 'page_view', {
									business_type: 'appliance_repair',
									service_area: 'thiruvalla_kerala'
								});
							`}
						</Script>
					</>
				) : null}
				
				{/* Enhanced Schema Markup */}
				<script 
					type="application/ld+json" 
					dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} 
				/>
				<script 
					type="application/ld+json" 
					dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} 
				/>
				
				{/* Geo Meta Tags */}
				<meta name="geo.region" content="IN-KL" />
				<meta name="geo.placename" content="Thiruvalla, Kerala" />
				<meta name="geo.position" content="9.3833;76.5667" />
				<meta name="ICBM" content="9.3833, 76.5667" />
				
				{/* Local Business Meta Tags */}
				<meta name="business:contact_data:street_address" content="Main Road, Thiruvalla" />
				<meta name="business:contact_data:locality" content="Thiruvalla" />
				<meta name="business:contact_data:region" content="Kerala" />
				<meta name="business:contact_data:postal_code" content="689101" />
				<meta name="business:contact_data:country_name" content="India" />
				<meta name="business:contact_data:phone_number" content="+91-8547229991" />
			</head>
			<body className={`${inter.className} min-h-screen antialiased`}>
				{children}
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	)
}