import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, MessageCircle, Snowflake, CheckCircle, MapPin, Clock, Star } from 'lucide-react'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918547229991'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const { locale } = await params
	const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
	
	if (locale === 'ml') {
		return {
			title: 'എസി റിപ്പയർ തിരുവല്ല | മികച്ച എയർ കണ്ടീഷണർ സർവീസ് | കൂൾ വിൻഡ് സർവീസ്',
			description: 'തിരുവല്ലയിലെ #1 എസി റിപ്പയർ സർവീസ്. എല്ലാ ബ്രാൻഡുകളും, അതേദിന സർവീസ്, ഒറിജിനൽ പാർട്സ്. പത്തനംതിട്ടയിലും സേവനം. കോൾ +91-8547229991.',
			alternates: { canonical: '/ml/services/ac-repair-thiruvalla' },
			keywords: [
				'എസി റിപ്പയർ തിരുവല്ല',
				'എയർ കണ്ടീഷണർ സർവീസ് തിരുവല്ല',
				'എസി ഇൻസ്റ്റാളേഷൻ തിരുവല്ല',
				'എസി ടെക്നീഷ്യൻ തിരുവല്ല'
			]
		}
	}
	
	return {
		title: 'AC Repair Thiruvalla | Best Air Conditioner Service | Cool Wind Services',
		description: '#1 AC repair Thiruvalla. All brands serviced. Same-day service, genuine parts, expert technicians. AC installation & maintenance. Pathanamthitta service available. Call +91-8547229991.',
		alternates: { canonical: '/services/ac-repair-thiruvalla' },
		openGraph: {
			title: 'AC Repair Thiruvalla - Best Air Conditioner Service | Cool Wind Services',
			description: 'Expert AC repair & installation in Thiruvalla. All brands, same-day service, genuine parts. 15+ years experience. Call +91-8547229991.',
			url: `${base}/services/ac-repair-thiruvalla`,
			type: 'website'
		},
		keywords: [
			'AC repair Thiruvalla',
			'air conditioner service Thiruvalla',
			'AC installation Thiruvalla',
			'AC technician Thiruvalla',
			'AC maintenance Thiruvalla',
			'split AC repair Thiruvalla',
			'window AC repair Thiruvalla',
			'AC gas filling Thiruvalla',
			'AC not cooling Thiruvalla',
			'emergency AC repair Thiruvalla'
		]
	}
}

export default async function ACRepairThiruvallaPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params

	const acServices = [
		{
			title: locale === 'ml' ? 'എസി ഇൻസ്റ്റാളേഷൻ' : 'AC Installation',
			description: locale === 'ml' ? 'എല്ലാ ബ്രാൻഡുകളുടെയും പുതിയ എസി ഇൻസ്റ്റാളേഷൻ' : 'New AC installation for all brands',
			price: locale === 'ml' ? '₹2,500 മുതൽ' : 'Starting ₹2,500'
		},
		{
			title: locale === 'ml' ? 'എസി റിപ്പയർ' : 'AC Repair',
			description: locale === 'ml' ? 'എല്ലാ തരത്തിലുള്ള എസി പ്രശ്നങ്ങളും പരിഹരിക്കുന്നു' : 'All types of AC problems solved',
			price: locale === 'ml' ? '₹500 മുതൽ' : 'Starting ₹500'
		},
		{
			title: locale === 'ml' ? 'ഗ്യാസ് ചാർജിംഗ്' : 'Gas Charging',
			description: locale === 'ml' ? 'എസി കൂളിംഗ് പ്രശ്നത്തിനുള്ള ഗ്യാസ് ചാർജിംഗ്' : 'Gas charging for AC cooling issues',
			price: locale === 'ml' ? '₹1,500 മുതൽ' : 'Starting ₹1,500'
		},
		{
			title: locale === 'ml' ? 'ക്ലീനിംഗ് & മെയിന്റനൻസ്' : 'Cleaning & Maintenance',
			description: locale === 'ml' ? 'പതിവ് എസി വൃത്തിയാക്കലും പരിപാലനവും' : 'Regular AC cleaning and maintenance',
			price: locale === 'ml' ? '₹800 മുതൽ' : 'Starting ₹800'
		}
	]

	const commonIssues = [
		locale === 'ml' ? 'എസി കൂളിംഗ് ഇല്ല' : 'AC not cooling',
		locale === 'ml' ? 'വിചിത്ര ശബ്ദം' : 'Strange noises',
		locale === 'ml' ? 'വൈദ്യുതി ബിൽ കൂടുതൽ' : 'High electricity bills',
		locale === 'ml' ? 'വെള്ളം ചോർച്ച' : 'Water leakage',
		locale === 'ml' ? 'റിമോട്ട് പ്രവർത്തിക്കുന്നില്ല' : 'Remote not working',
		locale === 'ml' ? 'ദുർഗന്ധം' : 'Bad smell'
	]

	// JSON-LD Schema for AC Repair Service
	const serviceSchema = {
		"@context": "https://schema.org",
		"@type": "Service",
		"name": locale === 'ml' ? "എസി റിപ്പയർ തിരുവല്ല" : "AC Repair Thiruvalla",
		"description": locale === 'ml' 
			? "തിരുവല്ലയിലെ മികച്ച എസി റിപ്പയർ സർവീസ്. എല്ലാ ബ്രാൻഡുകളും, അതേദിന സർവീസ്, ഒറിജിനൽ പാർട്സ്."
			: "Best AC repair service in Thiruvalla. All brands, same-day service, genuine parts.",
		"provider": {
			"@type": "LocalBusiness",
			"name": "Cool Wind Services",
			"telephone": "+91-8547229991",
			"address": {
				"@type": "PostalAddress",
				"addressLocality": "Thiruvalla",
				"addressRegion": "Kerala",
				"addressCountry": "IN"
			}
		},
		"areaServed": [
			{
				"@type": "City",
				"name": "Thiruvalla"
			},
			{
				"@type": "City",
				"name": "Pathanamthitta"
			}
		],
		"serviceType": "AC Repair",
		"category": "Appliance Repair",
		"offers": {
			"@type": "Offer",
			"priceCurrency": "INR",
			"price": "500",
			"description": locale === 'ml' ? "എസി റിപ്പയർ സർവീസ് ₹500 മുതൽ" : "AC repair service starting from ₹500"
		}
	}

	return (
		<>
			<script 
				type="application/ld+json" 
				dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} 
			/>
			
			<div className="min-h-screen bg-gray-50">
				{/* Hero Section */}
				<section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center">
							<div className="flex justify-center mb-6">
								<Snowflake className="h-16 w-16 text-blue-200" />
							</div>
							<h1 className="text-4xl md:text-5xl font-bold mb-6">
								{locale === 'ml' 
									? 'തിരുവല്ലയിലെ #1 എസി റിപ്പയർ സർവീസ്' 
									: 'Thiruvalla\'s #1 AC Repair Service'
								}
							</h1>
							<p className="text-xl md:text-2xl mb-8 text-blue-100">
								{locale === 'ml'
									? '2009 മുതൽ വിശ്വസനീയമായ സേവനം | എല്ലാ ബ്രാൻഡുകളും | അതേദിന സർവീസ്'
									: 'Trusted Service Since 2009 | All Brands | Same-Day Service'
								}
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<a 
									href={`tel:${PHONE}`}
									className="inline-flex items-center justify-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
								>
									<Phone className="h-5 w-5 mr-2" />
									{locale === 'ml' ? 'ഇപ്പോൾ വിളിക്കൂ' : 'Call Now'}
								</a>
								<a 
									href={`https://wa.me/${WHATSAPP}`}
									className="inline-flex items-center justify-center px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
								>
									<MessageCircle className="h-5 w-5 mr-2" />
									{locale === 'ml' ? 'WhatsApp' : 'WhatsApp'}
								</a>
							</div>
						</div>
					</div>
				</section>

				{/* Services Section */}
				<section className="py-16">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-12">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								{locale === 'ml' ? 'ഞങ്ങളുടെ എസി സർവീസുകൾ' : 'Our AC Services'}
							</h2>
							<p className="text-xl text-gray-600">
								{locale === 'ml' 
									? 'തിരുവല്ലയിലും പത്തനംതിട്ടയിലും സമ്പൂർണ്ണ എസി സൊല്യൂഷനുകൾ'
									: 'Complete AC solutions in Thiruvalla and Pathanamthitta'
								}
							</p>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
							{acServices.map((service, index) => (
								<div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
									<div className="text-center">
										<Snowflake className="h-12 w-12 text-blue-600 mx-auto mb-4" />
										<h3 className="text-xl font-semibold text-gray-900 mb-3">
											{service.title}
										</h3>
										<p className="text-gray-600 mb-4">
											{service.description}
										</p>
										<div className="text-2xl font-bold text-blue-600">
											{service.price}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Common Issues Section */}
				<section className="py-16 bg-white">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-12">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								{locale === 'ml' ? 'പൊതുവായ എസി പ്രശ്നങ്ങൾ' : 'Common AC Problems We Fix'}
							</h2>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{commonIssues.map((issue, index) => (
								<div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
									<CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" />
									<span className="text-gray-800 font-medium">{issue}</span>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Why Choose Us Section */}
				<section className="py-16 bg-blue-50">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-12">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								{locale === 'ml' ? 'എന്തുകൊണ്ട് ഞങ്ങളെ തിരഞ്ഞെടുക്കണം?' : 'Why Choose Cool Wind Services?'}
							</h2>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
							<div className="text-center">
								<div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
									<Clock className="h-10 w-10 text-blue-600" />
								</div>
								<h3 className="text-xl font-semibold mb-2">
									{locale === 'ml' ? 'അതേദിന സർവീസ്' : 'Same-Day Service'}
								</h3>
								<p className="text-gray-600">
									{locale === 'ml' ? 'അടിയന്തിര സേവനങ്ങൾക്ക് അതേദിന തന്നെ' : 'Emergency services available same day'}
								</p>
							</div>
							
							<div className="text-center">
								<div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
									<CheckCircle className="h-10 w-10 text-green-600" />
								</div>
								<h3 className="text-xl font-semibold mb-2">
									{locale === 'ml' ? 'ഒറിജിനൽ പാർട്സ്' : 'Genuine Parts'}
								</h3>
								<p className="text-gray-600">
									{locale === 'ml' ? 'എല്ലാ ബ്രാൻഡുകളുടെയും ഒറിജിനൽ സ്പെയർ പാർട്സ്' : 'Original spare parts for all brands'}
								</p>
							</div>
							
							<div className="text-center">
								<div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
									<Star className="h-10 w-10 text-yellow-500" />
								</div>
								<h3 className="text-xl font-semibold mb-2">
									{locale === 'ml' ? '15+ വർഷത്തെ പരിചയം' : '15+ Years Experience'}
								</h3>
								<p className="text-gray-600">
									{locale === 'ml' ? '2009 മുതൽ വിശ്വസനീയമായ സേവനം' : 'Trusted service since 2009'}
								</p>
							</div>
							
							<div className="text-center">
								<div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
									<MapPin className="h-10 w-10 text-red-600" />
								</div>
								<h3 className="text-xl font-semibold mb-2">
									{locale === 'ml' ? 'ലോക്കൽ സർവീസ്' : 'Local Service'}
								</h3>
								<p className="text-gray-600">
									{locale === 'ml' ? 'തിരുവല്ല & പത്തനംതിട്ട' : 'Thiruvalla & Pathanamthitta'}
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-16 bg-gray-900 text-white">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
						<h2 className="text-3xl md:text-4xl font-bold mb-6">
							{locale === 'ml' 
								? 'എസി പ്രശ്നമുണ്ടോ? ഇപ്പോൾ വിളിക്കൂ!'
								: 'AC Problem? Call Now!'
							}
						</h2>
						<p className="text-xl mb-8 text-gray-300">
							{locale === 'ml'
								? 'വിദഗ്ധ ടെക്നീഷ്യൻമാർ 30 മിനിറ്റിനുള്ളിൽ എത്തും'
								: 'Expert technicians will reach you within 30 minutes'
							}
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<a 
								href={`tel:${PHONE}`}
								className="inline-flex items-center justify-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
							>
								<Phone className="h-5 w-5 mr-2" />
								+91-8547229991
							</a>
							<Link 
								href="/contact"
								className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
							>
								{locale === 'ml' ? 'ഞങ്ങളെ സമീപിക്കൂ' : 'Contact Us'}
							</Link>
						</div>
					</div>
				</section>
			</div>
		</>
	)
}