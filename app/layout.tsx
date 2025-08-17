import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FloatingCtas from '@/components/FloatingCtas'
import CookieConsent from '@/components/CookieConsent'
import Providers from '@/components/Providers'
import enMessages from '@/data/translations/en.json'

export const metadata: Metadata = {
	title: 'Cool Wind Services | AC & Refrigerator Spare Parts, Repairs in Thiruvalla',
	description:
		'Genuine AC & refrigerator spare parts and expert servicing in Thiruvalla & Pathanamthitta. Same-day parts delivery. 24/7 emergency service. Call +91 85472 29991.',
	metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
	alternates: { languages: { en: '/', ml: '/ml' } },
}

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
		openingHours: "Mo-Sa 08:00-20:00",
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
				<link rel="preconnect" href="https://fonts.googleapis.com"/>
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
				<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
				{process.env.NEXT_PUBLIC_GA_ID ? (
					<>
						<script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}></script>
						<script
							dangerouslySetInnerHTML={{
								__html: `
								window.dataLayer = window.dataLayer || [];
								function gtag(){dataLayer.push(arguments);} 
								gtag('js', new Date());
								gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
							`,
							}}
						/>
					</>
				) : null}
				<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
			</head>
			<body className="min-h-screen antialiased">
				<Providers locale="en" messages={enMessages as any}>
					<Header/>
					{children}
					<Footer/>
					<FloatingCtas/>
					<CookieConsent/>
				</Providers>
			</body>
		</html>
	)
}