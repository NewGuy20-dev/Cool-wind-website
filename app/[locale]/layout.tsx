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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const { locale } = await params
	const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
	
	if (locale === 'ml') {
		return {
			title: 'കൂൾ വിൻഡ് സർവീസ് | എസി റിപ്പയർ തിരുവല്ല, റെഫ്രിജറേറ്റർ സർവീസ് കേരളം',
			description: '2009 മുതൽ തിരുവല്ലയിലെ മികച്ച എസി റിപ്പയർ & റെഫ്രിജറേറ്റർ സർവീസ്. ഒറിജിനൽ സ്പെയർ പാർട്സ്, അതേദിന സർവീസ്. പത്തനംതിട്ട ആപ്ലയൻസ് റിപ്പയർ. കോൾ +91-8547229991.',
			metadataBase: new URL(base),
			alternates: { 
				languages: { 
					en: '/', 
					ml: '/ml' 
				},
				canonical: '/ml'
			},
			openGraph: {
				title: 'കൂൾ വിൻഡ് സർവീസ് - തിരുവല്ലയിലെ മികച്ച എസി റിപ്പയർ & റെഫ്രിജറേറ്റർ സർവീസ്',
				description: '2009 മുതൽ തിരുവല്ലയിലും കേരളത്തിലും മികച്ച എസി റിപ്പയർ & റെഫ്രിജറേറ്റർ സർവീസ്. അതേദിന സർവീസ്, ഒറിജിനൽ പാർട്സ്.',
				url: `${base}/ml`,
				siteName: 'Cool Wind Services',
				locale: 'ml_IN',
				type: 'website'
			},
			twitter: {
				card: 'summary_large_image',
				title: 'കൂൾ വിൻഡ് സർവീസ് - എസി റിപ്പയർ തിരുവല്ല',
				description: '2009 മുതൽ തിരുവല്ലയിലെ മികച്ച എസി & റെഫ്രിജറേറ്റർ സർവീസ്. കോൾ +91-8547229991.'
			},
			keywords: [
				'എസി റിപ്പയർ തിരുവല്ല',
				'റെഫ്രിജറേറ്റർ സർവീസ് കേരളം',
				'ആപ്ലയൻസ് റിപ്പയർ പത്തനംതിട്ട',
				'എസി സർവീസ് തിരുവല്ല',
				'റെഫ്രിജറേറ്റർ റിപ്പയർ കേരളം',
				'കൂൾ വിൻഡ് സർവീസ്'
			]
		}
	}
	
	return {
		title: 'Cool Wind Services | Best AC Repair Thiruvalla & Refrigerator Service Kerala Since 2009',
		description:
			'#1 AC repair Thiruvalla & refrigerator service Kerala since 2009. Genuine spare parts, same-day service, expert appliance repair Pathanamthitta. Call +91-8547229991 now!',
		metadataBase: new URL(base),
		alternates: { 
			languages: { 
				en: '/', 
				ml: '/ml' 
			},
			canonical: '/'
		},
		openGraph: {
			title: 'Cool Wind Services - #1 AC Repair Thiruvalla & Refrigerator Service Kerala',
			description: 'Expert AC repair Thiruvalla & refrigerator service Kerala since 2009. Genuine parts, same-day service, appliance repair Pathanamthitta. Call +91-8547229991.',
			url: base,
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
			'refrigerator repair near me',
			'best AC repair Thiruvalla',
			'AC technician Thiruvalla',
			'refrigerator technician Kerala'
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
		}
	}
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
		"@id": "https://coolwindservices.com/#organization",
		name: "Cool Wind Services",
		alternateName: locale === 'ml' ? "കൂൾ വിൻഡ് സർവീസ്" : "Cool Wind AC & Refrigerator Service",
		description: locale === 'ml' 
			? "2009 മുതൽ തിരുവല്ലയിലും കേരളത്തിലും മികച്ച എസി റിപ്പയർ & റെഫ്രിജറേറ്റർ സർവീസ്" 
			: "Leading AC repair Thiruvalla & refrigerator service Kerala since 2009. Expert appliance repair Pathanamthitta with genuine spare parts and same-day service.",
		url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
		telephone: "+91-8547229991",
		email: "info@coolwindservices.com",
		foundingDate: "2009",
		slogan: locale === 'ml' ? "വിശ്വസനീയമായ സർവീസ്, ഗുണനിലവാരമുള്ള പാർട്സ്" : "Reliable Service, Quality Parts",
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
			},
			{
				"@type": "State",
				name: "Kerala"
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
			name: locale === 'ml' ? "എസി & റെഫ്രിജറേറ്റർ പാർട്സും സർവീസും" : "AC & Refrigerator Parts and Services",
			itemListElement: [
				{
					"@type": "Offer",
					itemOffered: {
						"@type": "Product",
						name: locale === 'ml' ? "എസി സ്പെയർ പാർട്സ് തിരുവല്ല" : "AC Spare Parts Thiruvalla",
						category: "Appliance Parts",
						description: locale === 'ml' ? "തിരുവല്ലയിൽ എല്ലാ ബ്രാൻഡുകളുടെയും ഒറിജിനൽ എസി സ്പെയർ പാർട്സ്" : "Genuine AC spare parts for all brands in Thiruvalla Kerala"
					}
				},
				{
					"@type": "Offer", 
					itemOffered: {
						"@type": "Product",
						name: locale === 'ml' ? "റെഫ്രിജറേറ്റർ സ്പെയർ പാർട്സ് കേരളം" : "Refrigerator Spare Parts Kerala", 
						category: "Appliance Parts",
						description: locale === 'ml' ? "കേരളത്തിൽ വാറന്റിയോടെ ഒറിജിനൽ റെഫ്രിജറേറ്റർ സ്പെയർ പാർട്സ്" : "Original refrigerator spare parts with warranty in Kerala"
					}
				},
				{
					"@type": "Offer",
					itemOffered: {
						"@type": "Service",
						name: locale === 'ml' ? "എസി റിപ്പയർ സർവീസ് തിരുവല്ല" : "AC Repair Service Thiruvalla",
						category: "Appliance Repair",
						description: locale === 'ml' ? "തിരുവല്ലയിലും പത്തനംതിട്ടയിലും വിദഗ്ധ എസി റിപ്പയർ & ഇൻസ്റ്റാളേഷൻ സർവീസ്" : "Expert AC repair and installation service in Thiruvalla Pathanamthitta"
					}
				},
				{
					"@type": "Offer",
					itemOffered: {
						"@type": "Service", 
						name: locale === 'ml' ? "റെഫ്രിജറേറ്റർ റിപ്പയർ സർവീസ് കേരളം" : "Refrigerator Repair Service Kerala",
						category: "Appliance Repair",
						description: locale === 'ml' ? "കേരളത്തിലുടനീളം പ്രൊഫഷണൽ റെഫ്രിജറേറ്റർ റിപ്പയർ സർവീസ്" : "Professional refrigerator repair service across Kerala"
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
				reviewBody: locale === 'ml' ? "തിരുവല്ലയിലെ മികച്ച എസി റിപ്പയർ സർവീസ്. എന്റെ സാംസങ് എസി അതേദിന തന്നെ ഒറിജിനൽ പാർട്സ് ഉപയോഗിച്ച് ശരിയാക്കി." : "Excellent AC repair service in Thiruvalla. Fixed my Samsung AC same day with genuine parts."
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
				reviewBody: locale === 'ml' ? "കേരളത്തിലെ മികച്ച റെഫ്രിജറേറ്റർ സർവീസ്. പ്രൊഫഷണൽ ടീം, ന്യായമായ നിരക്ക്." : "Best refrigerator service in Kerala. Professional team and reasonable prices."
			}
		],
		sameAs: [
			"https://www.facebook.com/coolwindservices",
			"https://www.instagram.com/coolwindservices", 
			"https://maps.google.com/?q=Cool+Wind+Services+Thiruvalla"
		]
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
				<CookieConsent/>
			</Providers>
		</>
	)
}