import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FloatingCtas from '@/components/FloatingCtas'
import CookieConsent from '@/components/CookieConsent'
import Providers from '@/components/Providers'
import enMessages from '@/data/translations/en.json'
import mlMessages from '@/data/translations/ml.json'
import PageTransition from '@/components/PageTransition'
import GoogleTranslate from '@/components/GoogleTranslate'
import { ChatWidget } from '@/components/chat/ChatWidget'

export const metadata: Metadata = {
	title: 'Cool Wind Services | AC & Refrigerator Spare Parts, Repairs in Thiruvalla',
	description:
		'Genuine AC & refrigerator spare parts and expert servicing in Thiruvalla & Pathanamthitta. Same-day parts delivery. Call +91 85472 29991.',
	metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
	alternates: { languages: { en: '/', ml: '/ml' } },
}

export default async function LocaleLayout({ 
	children,
	params
}: { 
	children: React.ReactNode
	params: Promise<{ locale: string }>
}) {
	const { locale } = await params
	const messages = (locale === 'ml' ? (mlMessages as any) : (enMessages as any))
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
		<>
			{/* Google Translate mounts client-side; hidden UI */}
			<GoogleTranslate targetLang={locale === 'ml' ? 'ml' : 'en'} />
			<Providers locale={locale} messages={messages}>
				<Header/>
				<PageTransition>
					{children}
				</PageTransition>
				<Footer/>
				<FloatingCtas/>
				<ChatWidget />
				<CookieConsent/>
			</Providers>
		</>
	)
}