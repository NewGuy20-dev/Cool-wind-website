import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, MessageCircle, Snowflake, CheckCircle, MapPin, Clock, Star, Wrench } from 'lucide-react'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918547229991'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const { locale } = await params
	const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
	
	if (locale === 'ml') {
		return {
			title: 'റെഫ്രിജറേറ്റർ സർവീസ് കേരളം | മികച്ച ഫ്രിഡ്ജ് റിപ്പയർ | കൂൾ വിൻഡ് സർവീസ്',
			description: 'കേരളത്തിലെ #1 റെഫ്രിജറേറ്റർ സർവീസ്. എല്ലാ ബ്രാൻഡുകളും, ഒറിജിനൽ പാർട്സ്, അതേദിന സർവീസ്. തിരുവല്ല & പത്തനംതിട്ട. കോൾ +91-8547229991.',
			alternates: { canonical: '/ml/services/refrigerator-service-kerala' },
			keywords: [
				'റെഫ്രിജറേറ്റർ സർവീസ് കേരളം',
				'ഫ്രിഡ്ജ് റിപ്പയർ കേരളം',
				'റെഫ്രിജറേറ്റർ റിപ്പയർ തിരുവല്ല',
				'ഫ്രിഡ്ജ് ടെക്നീഷ്യൻ കേരളം'
			]
		}
	}
	
	return {
		title: 'Refrigerator Service Kerala | Best Fridge Repair | Cool Wind Services',
		description: '#1 refrigerator service Kerala. All brands serviced. Same-day service, genuine parts, expert technicians. Fridge repair Thiruvalla & Pathanamthitta. Call +91-8547229991.',
		alternates: { canonical: '/services/refrigerator-service-kerala' },
		openGraph: {
			title: 'Refrigerator Service Kerala - Best Fridge Repair | Cool Wind Services',
			description: 'Expert refrigerator repair & service across Kerala. All brands, same-day service, genuine parts. 15+ years experience. Call +91-8547229991.',
			url: `${base}/services/refrigerator-service-kerala`,
			type: 'website'
		},
		keywords: [
			'refrigerator service Kerala',
			'fridge repair Kerala',
			'refrigerator repair Thiruvalla',
			'fridge technician Kerala',
			'refrigerator maintenance Kerala',
			'single door fridge repair Kerala',
			'double door fridge repair Kerala',
			'refrigerator not cooling Kerala',
			'emergency fridge repair Kerala',
			'refrigerator compressor repair Kerala'
		]
	}
}

export default async function RefrigeratorServiceKeralaPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params

	const fridgeServices = [
		{
			title: locale === 'ml' ? 'ഫ്രിഡ്ജ് റിപ്പയർ' : 'Fridge Repair',
			description: locale === 'ml' ? 'എല്ലാ തരത്തിലുള്ള റെഫ്രിജറേറ്റർ പ്രശ്നങ്ങളും പരിഹരിക്കുന്നു' : 'All types of refrigerator problems solved',
			price: locale === 'ml' ? '₹400 മുതൽ' : 'Starting ₹400'
		},
		{
			title: locale === 'ml' ? 'കമ്പ്രസർ റിപ്പയർ' : 'Compressor Repair',
			description: locale === 'ml' ? 'കമ്പ്രസർ റിപ്പയർ & റീപ്ലേസ്മെന്റ്' : 'Compressor repair & replacement',
			price: locale === 'ml' ? '₹3,500 മുതൽ' : 'Starting ₹3,500'
		},
		{
			title: locale === 'ml' ? 'ഗ്യാസ് ചാർജിംഗ്' : 'Gas Charging',
			description: locale === 'ml' ? 'കൂളിംഗ് പ്രശ്നത്തിനുള്ള ഗ്യാസ് ചാർജിംഗ്' : 'Gas charging for cooling issues',
			price: locale === 'ml' ? '₹1,200 മുതൽ' : 'Starting ₹1,200'
		},
		{
			title: locale === 'ml' ? 'തെർമോസ്റ്റാറ്റ് റിപ്പയർ' : 'Thermostat Repair',
			description: locale === 'ml' ? 'തെർമോസ്റ്റാറ്റ് പ്രശ്നങ്ങൾ പരിഹരിക്കുന്നു' : 'Thermostat problems fixed',
			price: locale === 'ml' ? '₹800 മുതൽ' : 'Starting ₹800'
		}
	]

	const commonIssues = [
		locale === 'ml' ? 'ഫ്രിഡ്ജ് കൂളിംഗ് ഇല്ല' : 'Fridge not cooling',
		locale === 'ml' ? 'വെള്ളം ചോർച്ച' : 'Water leakage',
		locale === 'ml' ? 'വിചിത്ര ശബ്ദം' : 'Strange noises',
		locale === 'ml' ? 'ഫ്രീസർ പ്രവർത്തിക്കുന്നില്ല' : 'Freezer not working',
		locale === 'ml' ? 'വൈദ്യുതി കൂടുതൽ ഉപയോഗം' : 'High power consumption',
		locale === 'ml' ? 'ദുർഗന്ധം' : 'Bad smell'
	]

	const brands = [
		'LG', 'Samsung', 'Whirlpool', 'Godrej', 'Haier', 'Bosch', 
		'Electrolux', 'Panasonic', 'IFB', 'Videocon', 'Kelvinator', 'Blue Star'
	]

	// JSON-LD Schema for Refrigerator Service
	const serviceSchema = {
		"@context": "https://schema.org",
		"@type": "Service",
		"name": locale === 'ml' ? "റെഫ്രിജറേറ്റർ സർവീസ് കേരളം" : "Refrigerator Service Kerala",
		"description": locale === 'ml' 
			? "കേരളത്തിലെ മികച്ച റെഫ്രിജറേറ്റർ സർവീസ്. എല്ലാ ബ്രാൻഡുകളും, അതേദിന സർവീസ്, ഒറിജിനൽ പാർട്സ്."
			: "Best refrigerator service in Kerala. All brands, same-day service, genuine parts.",
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
				"@type": "State",
				"name": "Kerala"
			},
			{
				"@type": "City",
				"name": "Thiruvalla"
			},
			{
				"@type": "City",
				"name": "Pathanamthitta"
			}
		],
		"serviceType": "Refrigerator Repair",
		"category": "Appliance Repair",
		"offers": {
			"@type": "Offer",
			"priceCurrency": "INR",
			"price": "400",
			"description": locale === 'ml' ? "റെഫ്രിജറേറ്റർ സർവീസ് ₹400 മുതൽ" : "Refrigerator service starting from ₹400"
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
				<section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-16">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center">
							<div className="flex justify-center mb-6">
								<Snowflake className="h-16 w-16 text-green-200" />
							</div>
							<h1 className="text-4xl md:text-5xl font-bold mb-6">
								{locale === 'ml' 
									? 'കേരളത്തിലെ #1 റെഫ്രിജറേറ്റർ സർവീസ്' 
									: 'Kerala\'s #1 Refrigerator Service'
								}
							</h1>
							<p className="text-xl md:text-2xl mb-8 text-green-100">
								{locale === 'ml'
									? '2009 മുതൽ വിശ്വസനീയമായ സേവനം | എല്ലാ ബ്രാൻഡുകളും | അതേദിന സർവീസ്'
									: 'Trusted Service Since 2009 | All Brands | Same-Day Service'
								}
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<a 
									href={`tel:${PHONE}`}
									className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
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
								{locale === 'ml' ? 'ഞങ്ങളുടെ റെഫ്രിജറേറ്റർ സർവീസുകൾ' : 'Our Refrigerator Services'}
							</h2>
							<p className="text-xl text-gray-600">
								{locale === 'ml' 
									? 'കേരളത്തിലുടനീളം സമ്പൂർണ്ണ ഫ്രിഡ്ജ് സൊല്യൂഷനുകൾ'
									: 'Complete fridge solutions across Kerala'
								}
							</p>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
							{fridgeServices.map((service, index) => (
								<div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
									<div className="text-center">
										<Wrench className="h-12 w-12 text-green-600 mx-auto mb-4" />
										<h3 className="text-xl font-semibold text-gray-900 mb-3">
											{service.title}
										</h3>
										<p className="text-gray-600 mb-4">
											{service.description}
										</p>
										<div className="text-2xl font-bold text-green-600">
											{service.price}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Brands Section */}
				<section className="py-16 bg-white">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-12">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								{locale === 'ml' ? 'ഞങ്ങൾ സർവീസ് ചെയ്യുന്ന ബ്രാൻഡുകൾ' : 'Brands We Service'}
							</h2>
						</div>
						
						<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
							{brands.map((brand, index) => (
								<div key={index} className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors">
									<span className="font-semibold text-gray-800">{brand}</span>
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
								{locale === 'ml' ? 'പൊതുവായ ഫ്രിഡ്ജ് പ്രശ്നങ്ങൾ' : 'Common Fridge Problems We Fix'}
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

				{/* Coverage Area Section */}
				<section className="py-16 bg-blue-50">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-12">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								{locale === 'ml' ? 'ഞങ്ങളുടെ സേവന മേഖലകൾ' : 'Our Service Areas in Kerala'}
							</h2>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
							<div className="text-center">
								<div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
									<MapPin className="h-10 w-10 text-blue-600" />
								</div>
								<h3 className="text-xl font-semibold mb-2">
									{locale === 'ml' ? 'തിരുവല്ല' : 'Thiruvalla'}
								</h3>
								<p className="text-gray-600">
									{locale === 'ml' ? 'മുഖ്യ സേവന കേന്ദ്രം' : 'Main Service Hub'}
								</p>
							</div>
							
							<div className="text-center">
								<div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
									<MapPin className="h-10 w-10 text-green-600" />
								</div>
								<h3 className="text-xl font-semibold mb-2">
									{locale === 'ml' ? 'പത്തനംതിട്ട' : 'Pathanamthitta'}
								</h3>
								<p className="text-gray-600">
									{locale === 'ml' ? 'അതേദിന സേവനം' : 'Same-Day Service'}
								</p>
							</div>
							
							<div className="text-center">
								<div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
									<Clock className="h-10 w-10 text-yellow-600" />
								</div>
								<h3 className="text-xl font-semibold mb-2">
									{locale === 'ml' ? 'കോട്ടയം' : 'Kottayam'}
								</h3>
								<p className="text-gray-600">
									{locale === 'ml' ? 'അടുത്ത ദിവസം സേവനം' : 'Next-Day Service'}
								</p>
							</div>
							
							<div className="text-center">
								<div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
									<Star className="h-10 w-10 text-purple-600" />
								</div>
								<h3 className="text-xl font-semibold mb-2">
									{locale === 'ml' ? 'മറ്റ് മേഖലകൾ' : 'Other Areas'}
								</h3>
								<p className="text-gray-600">
									{locale === 'ml' ? 'അഭ്യർത്ഥനയ്ക്ക് മേൽ' : 'On Request'}
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
								? 'ഫ്രിഡ്ജ് പ്രശ്നമുണ്ടോ? ഇപ്പോൾ വിളിക്കൂ!'
								: 'Fridge Problem? Call Now!'
							}
						</h2>
						<p className="text-xl mb-8 text-gray-300">
							{locale === 'ml'
								? 'വിദഗ്ധ ടെക്നീഷ്യൻമാർ കേരളത്തിലെവിടെയും എത്തും'
								: 'Expert technicians will reach anywhere in Kerala'
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