'use client'

import { 
	Phone, 
	MessageCircle, 
	Mail, 
	MapPin, 
	Clock, 
	Calendar,
	Wrench,
	ShoppingCart,
	CheckCircle,
	AlertCircle
} from 'lucide-react'
import dynamic from 'next/dynamic'
// Avoid SSR for form inputs that extensions may mutate (e.g., fdprocessedid)
const ContactForm = dynamic(() => import('@/components/ContactForm'), { ssr: false })

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918547229991'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'
const EMAIL = process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'info@coolwindservices.com'

export default function ContactPage() {
	const contactMethods = [
		{
			icon: <Phone className="h-6 w-6" />,
			title: 'Phone',
			value: PHONE,
			description: 'Call us directly for immediate assistance',
			action: `tel:${PHONE}`,
			available: 'Mon-Sat 10AM-6PM'
		},
		{
			icon: <MessageCircle className="h-6 w-6" />,
			title: 'WhatsApp',
			value: 'WhatsApp Chat',
			description: 'Send photos of your appliance for quick diagnosis',
			action: `https://wa.me/${WHATSAPP}?text=Hi, I need help with my appliance`,
			available: '24/7 Response'
		},
		{
			icon: <Mail className="h-6 w-6" />,
			title: 'Email',
			value: EMAIL,
			description: 'Send detailed queries and get comprehensive replies',
			action: `mailto:${EMAIL}`,
			available: 'Response within 4 hours'
		}
	]

	const serviceHours = [
		{ day: 'Monday - Friday', hours: '10:00 AM - 6:00 PM', type: 'regular' },
		{ day: 'Saturday', hours: '10:00 AM - 6:00 PM', type: 'regular' },
		{ day: 'Sunday', hours: 'Emergency Only', type: 'emergency' },
		{ day: 'Public Holidays', hours: 'Emergency Only', type: 'emergency' }
	]

	const serviceTypes = [
		{
			icon: <Wrench className="h-5 w-5" />,
			title: 'AC & Refrigerator Repair',
			description: 'Expert repair services for all brands',
			response: 'Same day service'
		},
		{
			icon: <ShoppingCart className="h-5 w-5" />,
			title: 'Spare Parts Supply',
			description: 'Genuine parts with warranty',
			response: 'Same day delivery'
		},
		{
			icon: <CheckCircle className="h-5 w-5" />,
			title: 'Installation Service',
			description: 'Professional installation and setup',
			response: 'Scheduled service'
		}
	]

	const emergencyInfo = [
		'AC not cooling in summer heat',
		'Refrigerator completely stopped working',
		'Water leaking from appliances',
		'Electrical issues with appliances',
		'Gas leak from AC units'
	]

	return (
		<main>
			{/* Hero Section */}
			<section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-16">
				<div className="mx-auto max-w-6xl px-4">
					<div className="text-center">
						<h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-6">
							Contact Cool Wind Services
						</h1>
						<p className="text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
							Get in touch for appliance repairs, parts supply, or any questions. 
							We're here to help with same-day service across Thiruvalla & Pathanamthitta.
						</p>
					</div>
				</div>
			</section>

			{/* Quick Contact Methods */}
			<section className="py-12 bg-neutral-50">
				<div className="mx-auto max-w-6xl px-4">
					<div className="grid gap-6 md:grid-cols-3">
						{contactMethods.map((method, index) => (
							<a
								key={index}
								href={method.action}
								target={method.title === 'WhatsApp' ? '_blank' : undefined}
								rel={method.title === 'WhatsApp' ? 'noopener noreferrer' : undefined}
								className="card p-6 text-center hover:scale-105 transition-transform duration-200 group"
							>
								<div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-100 text-primary-600 mx-auto mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-200">
									{method.icon}
								</div>
								<h3 className="font-semibold text-neutral-800 mb-2">
									{method.title}
								</h3>
								<p className="text-primary-600 font-medium mb-2">
									{method.value}
								</p>
								<p className="text-neutral-600 text-sm mb-3">
									{method.description}
								</p>
								<span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
									{method.available}
								</span>
							</a>
						))}
					</div>
				</div>
			</section>

			{/* Main Contact Section */}
			<section className="py-16 bg-neutral-50">
				<div className="mx-auto max-w-6xl px-4">
					<div className="grid gap-12 lg:grid-cols-2">
						{/* Contact Form */}
						<div>
							<h2 className="text-3xl font-bold text-neutral-800 mb-6">
								Get a Quick Quote
							</h2>
							<p className="text-neutral-600 mb-8 leading-relaxed">
								Fill out the form below with details about your appliance issue or parts requirement. 
								We'll get back to you within 2 hours with a solution and pricing.
							</p>
							
							<div className="card p-8">
								<ContactForm />
							</div>
						</div>

						{/* Business Information */}
						<div className="space-y-8">
							{/* Service Hours */}
							<div className="card p-6">
								<h3 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
									<Clock className="h-5 w-5 text-primary-600" />
									Service Hours
								</h3>
								<div className="space-y-3">
									{serviceHours.map((schedule, index) => (
										<div key={index} className="flex items-center justify-between">
											<span className="text-neutral-700">{schedule.day}</span>
											<span className={`font-medium ${
												schedule.type === 'emergency' 
													? 'text-secondary-600' 
													: 'text-neutral-800'
											}` }>
												{schedule.hours}
											</span>
										</div>
									))}
								</div>
								<div className="mt-4 p-3 bg-secondary-100 rounded-lg">
									<p className="text-secondary-800 text-sm flex items-start gap-2">
										<AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
										Emergency services available for critical appliance failures
									</p>
								</div>
							</div>

							{/* Service Types */}
							<div className="card p-6">
								<h3 className="font-semibold text-neutral-800 mb-4">
									What We Offer
								</h3>
								<div className="space-y-4">
									{serviceTypes.map((service, index) => (
										<div key={index} className="flex gap-4">
											<div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
												{service.icon}
											</div>
											<div>
												<h4 className="font-medium text-neutral-800 mb-1">
													{service.title}
												</h4>
												<p className="text-sm text-neutral-600 mb-1">
													{service.description}
												</p>
												<span className="text-xs text-secondary-600 bg-secondary-50 px-2 py-1 rounded">
													{service.response}
												</span>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Emergency Situations */}
							<div className="card p-6 border-l-4 border-secondary-500">
								<h3 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
									<AlertCircle className="h-5 w-5 text-secondary-600" />
									Emergency Situations
								</h3>
								<p className="text-neutral-600 text-sm mb-3">
									Call immediately for these urgent issues:
								</p>
								<ul className="space-y-2">
									{emergencyInfo.map((situation, index) => (
										<li key={index} className="text-sm text-neutral-700 flex items-start gap-2">
											<div className="h-1.5 w-1.5 rounded-full bg-secondary-600 mt-2 flex-shrink-0"></div>
											{situation}
										</li>
									))}
								</ul>
								<div className="mt-4 flex gap-3">
									<a 
										href={`tel:${PHONE}`}
										className="btn-accent text-sm px-4 py-2 inline-flex items-center gap-2"
									>
										<Phone size={16} />
										Emergency Call
									</a>
									<a 
										href={`https://wa.me/${WHATSAPP}?text=EMERGENCY: I have an urgent appliance issue`}
										className="btn-secondary text-sm px-4 py-2 inline-flex items-center gap-2"
										target="_blank"
										rel="noopener noreferrer"
									>
										<MessageCircle size={16} />
										Emergency WhatsApp
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Location & Service Area */}
			<section className="py-16 bg-neutral-50">
				<div className="mx-auto max-w-6xl px-4">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
							Our Location & Service Area
						</h2>
						<p className="text-lg text-neutral-600">
							Based in Thiruvalla, serving the entire Pathanamthitta district
						</p>
					</div>

					<div className="grid gap-8 lg:grid-cols-2">
						{/* Map Placeholder */}
						<div className="card p-8">
							<div className="aspect-[4/3] bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center mb-6">
								<div className="text-center">
									<MapPin className="h-16 w-16 text-primary-600 mx-auto mb-4" />
									<h3 className="font-semibold text-neutral-800 mb-2">Thiruvalla, Kerala</h3>
									<p className="text-neutral-600 text-sm">
										Interactive map showing our location and service coverage
									</p>
								</div>
							</div>
							<div className="text-center">
								<h4 className="font-medium text-neutral-800 mb-2">Cool Wind Services</h4>
								<p className="text-neutral-600 text-sm mb-4">
									Main Service Center<br />
									Thiruvalla, Pathanamthitta District<br />
									Kerala, India
								</p>
								<div className="flex justify-center gap-3">
									<a 
										href={`tel:${PHONE}`}
										className="btn-primary text-sm px-4 py-2 inline-flex items-center gap-2"
									>
										<Phone size={16} />
										Call Now
									</a>
									<a 
										href="https://maps.google.com/?q=Thiruvalla,Kerala"
										className="btn-secondary text-sm px-4 py-2"
										target="_blank"
										rel="noopener noreferrer"
									>
										View on Maps
									</a>
								</div>
							</div>
						</div>

						{/* Service Coverage */}
						<div className="card p-8">
							<h3 className="font-semibold text-neutral-800 mb-6">Service Coverage Areas</h3>
							
							<div className="space-y-6">
								<div>
									<h4 className="font-medium text-neutral-800 mb-3 flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-secondary-600" />
										Same-Day Service Areas
									</h4>
									<div className="grid grid-cols-2 gap-2 text-sm text-neutral-600">
										<span>• Thiruvalla</span>
										<span>• Pathanamthitta</span>
										<span>• Kozhencherry</span>
										<span>• Mallappally</span>
										<span>• Chengannur</span>
										<span>• Kumbakonam</span>
									</div>
									<p className="text-xs text-secondary-600 mt-2">
										Response time: 2-4 hours
									</p>
								</div>

								<div>
									<h4 className="font-medium text-neutral-800 mb-3 flex items-center gap-2">
										<Calendar className="h-4 w-4 text-secondary-600" />
										Next-Day Service Areas
									</h4>
									<div className="grid grid-cols-2 gap-2 text-sm text-neutral-600">
										<span>• Adoor</span>
										<span>• Pandalam</span>
										<span>• Ranni</span>
										<span>• Konni</span>
										<span>• Aranmula</span>
										<span>• Kaviyoor</span>
									</div>
									<p className="text-xs text-secondary-600 mt-2">
										Scheduled service visits
									</p>
								</div>
							</div>

							<div className="mt-6 p-4 bg-primary-50 rounded-lg">
								<h4 className="font-medium text-primary-800 mb-2">Service Guarantee</h4>
								<p className="text-primary-700 text-sm">
									We guarantee service within 24 hours for all areas. Emergency calls 
									get priority response regardless of location.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}