import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, MessageCircle, Wrench, CheckCircle, MapPin, Clock, Star, Settings } from 'lucide-react'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918547229991'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const { locale } = await params
	const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
	
	if (locale === 'ml') {
		return {
			title: 'ആപ്ലയൻസ് റിപ്പയർ പത്തനംതിട്ട | എസി & ഫ്രിഡ്ജ് സർവീസ് | കൂൾ വിൻഡ് സർവീസ്',
			description: 'പത്തനംതിട്ടയിലെ #1 ആപ്ലയൻസ് റിപ്പയർ സർവീസ്. എസി, ഫ്രിഡ്ജ്, വാഷിംഗ് മെഷീൻ റിപ്പയർ. അതേദിന സർവീസ്, ഒറിജിനൽ പാർട്സ്. കോൾ +91-8547229991.',
			alternates: { canonical: '/ml/services/appliance-repair-pathanamthitta' },
			keywords: [
				'ആപ്ലയൻസ് റിപ്പയർ പത്തനംതിട്ട',
				'എസി റിപ്പയർ പത്തനംതിട്ട',
				'ഫ്രിഡ്ജ് റിപ്പയർ പത്തനംതിട്ട',
				'വാഷിംഗ് മെഷീൻ റിപ്പയർ പത്തനംതിട്ട'
			]
		}
	}
	
	return {
		title: 'Appliance Repair Pathanamthitta | AC & Fridge Service | Cool Wind Services',
		description: '#1 appliance repair Pathanamthitta. AC, refrigerator, washing machine repair. Same-day service, genuine parts, expert technicians. 15+ years experience. Call +91-8547229991.',
		alternates: { canonical: '/services/appliance-repair-pathanamthitta' },
		openGraph: {
			title: 'Appliance Repair Pathanamthitta - Best AC & Fridge Service | Cool Wind Services',
			description: 'Expert appliance repair in Pathanamthitta. AC, refrigerator, washing machine service. Same-day service, genuine parts. Call +91-8547229991.',
			url: `${base}/services/appliance-repair-pathanamthitta`,
			type: 'service'
		},
		keywords: [
			'appliance repair Pathanamthitta',
			'AC repair Pathanamthitta',
			'refrigerator repair Pathanamthitta',
			'washing machine repair Pathanamthitta',
			'home appliance service Pathanamthitta',
			'appliance technician Pathanamthitta',
			'emergency appliance repair Pathanamthitta',
			'appliance parts Pathanamthitta',
			'dishwasher repair Pathanamthitta',
			'microwave repair Pathanamthitta'
		]
	}
}

export default async function ApplianceRepairPathanamthittaPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params

	const applianceServices = [
		{
			title: locale === 'ml' ? 'എസി സർവീസ്' : 'AC Service',
			description: locale === 'ml' ? 'എല്ലാ തരത്തിലുള്ള എസി പ്രശ്നങ്ങളും പരിഹരിക്കുന്നു' : 'All types of AC problems solved',
			price: locale === 'ml' ? '₹500 മുതൽ' : 'Starting ₹500',
			icon: <Wrench className="h-8 w-8" />
		},
		{
			title: locale === 'ml' ? 'ഫ്രിഡ്ജ് സർവീസ്' : 'Refrigerator Service',
			description: locale === 'ml' ? 'റെഫ്രിജറേറ്റർ റിപ്പയർ & മെയിന്റനൻസ്' : 'Refrigerator repair & maintenance',
			price: locale === 'ml' ? '₹400 മുതൽ' : 'Starting ₹400',
			icon: <Settings className="h-8 w-8" />
		},
		{
			title: locale === 'ml' ? 'വാഷിംഗ് മെഷീൻ' : 'Washing Machine',
			description: locale === 'ml' ? 'വാഷിംഗ് മെഷീൻ റിപ്പയർ & സർവീസ്' : 'Washing machine repair & service',
			price: locale === 'ml' ? '₹600 മുതൽ' : 'Starting ₹600',
			icon: <Settings className="h-8 w-8" />
		},
		{
			title: locale === 'ml' ? 'മറ്റ് ആപ്ലയൻസ്' : 'Other Appliances',
			description: locale === 'ml' ? 'മൈക്രോവേവ്, ഡിഷ് വാഷർ മുതലായവ' : 'Microwave, dishwasher, etc.',
			price: locale === 'ml' ? '₹350 മുതൽ' : 'Starting ₹350',
			icon: <Wrench className="h-8 w-8" />
		}
	]

	const commonIssues = [
		locale === 'ml' ? 'എസി കൂളിംഗ് ഇല്ല' : 'AC not cooling',
		locale === 'ml' ? 'ഫ്രിഡ്ജ് കൂളിംഗ് ഇല്ല' : 'Fridge not cooling',
		locale === 'ml' ? 'വാഷിംഗ് മെഷീൻ വർക്ക് ചെയ്യുന്നില്ല' : 'Washing machine not working',
		locale === 'ml' ? 'വിചിത്ര ശബ്ദം' : 'Strange noises',
		locale === 'ml' ? 'വെള്ളം ചോർച്ച' : 'Water leakage',
		locale === 'ml' ? 'വൈദ്യുതി പ്രശ്നങ്ങൾ' : 'Electrical issues'
	]

	const serviceAreas = [
		{ name: locale === 'ml' ? 'പത്തനംതിട്ട ടൗൺ' : 'Pathanamthitta Town', time: locale === 'ml' ? '30 മിനിറ്റ്' : '30 mins' },
		{ name: locale === 'ml' ? 'കൊന്നി' : 'Konni', time: locale === 'ml' ? '45 മിനിറ്റ്' : '45 mins' },
		{ name: locale === 'ml' ? 'തിരുവല്ല' : 'Thiruvalla', time: locale === 'ml' ? '20 മിനിറ്റ്' : '20 mins' },
		{ name: locale === 'ml' ? 'അടൂർ' : 'Adoor', time: locale === 'ml' ? '40 മിനിറ്റ്' : '40 mins' },
		{ name: locale === 'ml' ? 'മല്ലപ്പള്ളി' : 'Mallappally', time: locale === 'ml' ? '25 മിനിറ്റ്' : '25 mins' },
		{ name: locale === 'ml' ? 'പണ്ടലം' : 'Pandalam', time: locale === 'ml' ? '35 മിനിറ്റ്' : '35 mins' }
	]

	// JSON-LD Schema for Appliance Repair Service
	const serviceSchema = {
		"@context": "https://schema.org",
		"@type": "Service",
		"name": locale === 'ml' ? "ആപ്ലയൻസ് റിപ്പയർ പത്തനംതിട്ട" : "Appliance Repair Pathanamthitta",
		"description": locale === 'ml' 
			? "പത്തനംതിട്ടയിലെ മികച്ച ആപ്ലയൻസ് റിപ്പയർ സർവീസ്. എസി, ഫ്രിഡ്ജ്, വാഷിംഗ് മെഷീൻ റിപ്പയർ."
			: "Best appliance repair service in Pathanamthitta. AC, refrigerator, washing machine repair.",
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
				"name": "Pathanamthitta"
			},
			{
				"@type": "City",
				"name": "Thiruvalla"
			},
			{
				"@type": "City",
				"name": "Konni"
			},
			{
				"@type": "City",
				"name": "Adoor"
			}
		],
		"serviceType": "Appliance Repair",
		"category": "Home Appliance Repair",
		"offers": {
			"@type": "Offer",
			"priceCurrency": "INR",
			"price": "350",
			"description": locale === 'ml' ? "ആപ്ലയൻസ് റിപ്പയർ സർവീസ് ₹350 മുതൽ" : "Appliance repair service starting from ₹350"
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
				<section className="bg-gradient-to-br from-purple-600 to-purple-800 text-white py-16">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center">
							<div className="flex justify-center mb-6">
								<Settings className="h-16 w-16 text-purple-200" />
							</div>
							<h1 className="text-4xl md:text-5xl font-bold mb-6">
								{locale === 'ml' 
									? 'പത്തനംതിട്ടയിലെ #1 ആപ്ലയൻസ് റിപ്പയർ' 
									: 'Pathanamthitta\'s #1 Appliance Repair'
								}
							</h1>
							<p className="text-xl md:text-2xl mb-8 text-purple-100">
								{locale === 'ml'
									? 'എസി, ഫ്രിഡ്ജ്, വാഷിംഗ് മെഷീൻ | അതേദിന സർവീസ് | ഒറിജിനൽ പാർട്സ്'
									: 'AC, Fridge, Washing Machine | Same-Day Service | Genuine Parts'
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
								{locale === 'ml' ? 'ഞങ്ങളുടെ ആപ്ലയൻസ് സർവീസുകൾ' : 'Our Appliance Services'}
							</h2>
							<p className="text-xl text-gray-600">
								{locale === 'ml' 
									? 'പത്തനംതിട്ടയിലെ എല്ലാ തരത്തിലുള്ള ഗൃഹോപകരണങ്ങളുടെയും സർവീസ്'
									: 'Complete home appliance solutions in Pathanamthitta'
								}
							</p>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
							{applianceServices.map((service, index) => (
								<div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
									<div className="text-center">
										<div className="text-purple-600 mx-auto mb-4">
											{service.icon}
										</div>
										<h3 className="text-xl font-semibold text-gray-900 mb-3">
											{service.title}
										</h3>
										<p className="text-gray-600 mb-4">
											{service.description}
										</p>
										<div className="text-2xl font-bold text-purple-600">
											{service.price}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Service Areas Section */}
				<section className="py-16 bg-white">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-12">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								{locale === 'ml' ? 'ഞങ്ങളുടെ സേവന മേഖലകൾ' : 'Our Service Areas'}
							</h2>
							<p className="text-xl text-gray-600">
								{locale === 'ml' 
									? 'പത്തനംതിട്ട ജില്ലയിലെ പ്രധാന പ്രദേശങ്ങൾ'
									: 'Major areas in Pathanamthitta district'
								}
							</p>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{serviceAreas.map((area, index) => (
								<div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
									<div className="flex items-center">
										<MapPin className="h-6 w-6 text-purple-600 mr-3" />
										<span className="font-semibold text-gray-800">{area.name}</span>
									</div>
									<div className="flex items-center text-sm text-gray-600">
										<Clock className="h-4 w-4 mr-1" />
										{area.time}
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Common Issues Section */}
				<section className="py-16 bg-gray-50">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-12">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								{locale === 'ml' ? 'പൊതുവായ ആപ്ലയൻസ് പ്രശ്നങ്ങൾ' : 'Common Appliance Problems We Fix'}
							</h2>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{commonIssues.map((issue, index) => (
								<div key={index} className="flex items-center p-4 bg-white rounded-lg shadow-sm">
									<CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" />
									<span className="text-gray-800 font-medium">{issue}</span>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Why Choose Us Section */}
				<section className="py-16 bg-purple-50">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-12">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								{locale === 'ml' ? 'എന്തുകൊണ്ട് കൂൾ വിൻഡ് സർവീസ്?' : 'Why Choose Cool Wind Services?'}
							</h2>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
							<div className="text-center">
								<div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
									<Clock className="h-10 w-10 text-purple-600" />
								</div>
								<h3 className="text-xl font-semibold mb-2">
									{locale === 'ml' ? 'വേഗത്തിലുള്ള സേവനം' : 'Quick Service'}
								</h3>
								<p className="text-gray-600">
									{locale === 'ml' ? 'പത്തനംതിട്ടയിൽ 30 മിനിറ്റിനുള്ളിൽ' : 'Within 30 minutes in Pathanamthitta'}
								</p>
							</div>
							
							<div className="text-center">
								<div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
									<CheckCircle className="h-10 w-10 text-green-600" />
								</div>
								<h3 className="text-xl font-semibold mb-2">
									{locale === 'ml' ? 'ഗുണനിലവാരമുള്ള പാർട്സ്' : 'Quality Parts'}
								</h3>
								<p className="text-gray-600">
									{locale === 'ml' ? 'എല്ലാ ബ്രാൻഡുകളുടെയും ഒറിജിനൽ പാർട്സ്' : 'Original parts for all brands'}
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
									<Settings className="h-10 w-10 text-blue-600" />
								</div>
								<h3 className="text-xl font-semibold mb-2">
									{locale === 'ml' ? 'എല്ലാ ബ്രാൻഡുകളും' : 'All Brands'}
								</h3>
								<p className="text-gray-600">
									{locale === 'ml' ? 'LG, Samsung, Whirlpool മുതലായവ' : 'LG, Samsung, Whirlpool & more'}
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
								? 'ആപ്ലയൻസ് പ്രശ്നമുണ്ടോ? ഇപ്പോൾ വിളിക്കൂ!'
								: 'Appliance Problem? Call Now!'
							}
						</h2>
						<p className="text-xl mb-8 text-gray-300">
							{locale === 'ml'
								? 'പത്തനംതിട്ടയിലെ എല്ലാ ആപ്ലയൻസ് പ്രശ്നങ്ങൾക്കും ഒരു കോൾ മതി'
								: 'One call solution for all appliance problems in Pathanamthitta'
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
								className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
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