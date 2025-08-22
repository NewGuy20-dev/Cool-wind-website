import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import Script from 'next/script'

export const metadata: Metadata = {
	title: 'Cool Wind Services | AC & Refrigerator Spare Parts, Repairs in Thiruvalla',
	description:
		'Genuine AC & refrigerator spare parts and expert servicing in Thiruvalla & Pathanamthitta. Same-day parts delivery. Call +91 85472 29991.',
	metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
	alternates: { languages: { en: '/', ml: '/ml' } },
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
	const ld = {
		"@context": "https://schema.org",
		"@type": "LocalBusiness",
		name: "Cool Wind Services",
		description: "Leading supplier of AC and Refrigerator spare parts with expert servicing in Thiruvalla",
		telephone: "+91-85472-29991",
		address: {
			"@type": "PostalAddress",
			addressLocality: "Thiruvalla",
			addressRegion: "Kerala",
			addressCountry: "IN",
		},
		areaServed: ["Thiruvalla", "Pathanamthitta"],
		openingHours: "Mo-Sa 10:00-18:00",
		priceRange: "₹₹",
		hasOfferCatalog: {
			"@type": "OfferCatalog",
			name: "AC & Refrigerator Parts and Services",
			itemListElement: [
				{ "@type": "Offer", itemOffered: { "@type": "Product", name: "AC & Refrigerator Spare Parts", category: "Appliance Parts" } },
				{ "@type": "Offer", itemOffered: { "@type": "Service", name: "AC & Refrigerator Repair Service", category: "Appliance Repair" } },
			],
		},
	}
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
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
								gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
							`}
						</Script>
					</>
				) : null}
				<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
			</head>
			<body className={`${inter.className} min-h-screen antialiased`}>
				{children}
			</body>
		</html>
	)
}