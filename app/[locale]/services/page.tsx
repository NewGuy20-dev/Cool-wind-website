'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
	Snowflake, 
	Wrench, 
	ShoppingCart, 
	Recycle, 
	ChevronDown, 
	ChevronUp,
	Phone,
	MessageCircle,
	CheckCircle,
	Clock,
	MapPin,
	Zap,
	Shield,
	Truck
} from 'lucide-react'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918547229991'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'

export default function ServicesPage() {
	const [openService, setOpenService] = useState<string>('ac-repair')

	const services = [
		{
			id: 'ac-repair',
			icon: <Snowflake className="h-8 w-8" />,
			title: 'AC Services',
			subtitle: 'Installation, Repair & Maintenance',
			description: 'Complete air conditioning solutions for homes and businesses',
			commonIssues: [
				'AC not cooling properly',
				'Strange noises from unit',
				'High electricity bills',
				'Water leaking from AC',
				'Remote not working',
				'Foul smell from AC'
			],
			services: [
				'New AC installation (all brands)',
				'AC repair and troubleshooting',
				'Gas charging and leak detection',
				'Compressor replacement',
				'Filter cleaning and replacement',
				'PCB repair and replacement',
				'Thermostat calibration',
				'Duct cleaning for central AC'
			],
			brands: ['Samsung', 'LG', 'Voltas', 'Blue Star', 'Daikin', 'Carrier', 'Hitachi', 'Godrej'],
			cta: 'Book AC Service',
			ctaLink: '#contact'
		},
		{
			id: 'refrigerator-repair',
			icon: <Wrench className="h-8 w-8" />,
			title: 'Refrigerator Services',
			subtitle: 'Expert Repair for All Brands',
			description: 'Professional refrigerator repair and maintenance services',
			commonIssues: [
				'Not cooling or freezing',
				'Water leaking inside/outside',
				'Unusual noises',
				'Ice formation problems',
				'Door seal issues',
				'Compressor not working'
			],
			services: [
				'Compressor repair/replacement',
				'Thermostat repair',
				'Door seal replacement',
				'Defrost system repair',
				'Ice maker repair',
				'Water dispenser service',
				'Temperature control fixing',
				'Electrical component repair'
			],
			brands: ['Samsung', 'LG', 'Whirlpool', 'Godrej', 'Haier', 'Bosch', 'Electrolux', 'Kelvinator'],
			cta: 'Fix My Fridge',
			ctaLink: '#contact'
		},
		{
			id: 'spare-parts',
			icon: <ShoppingCart className="h-8 w-8" />,
			title: 'Spare Parts Supply',
			subtitle: 'Genuine Parts for All Major Brands',
			description: 'Comprehensive inventory of authentic spare parts with warranty',
			commonIssues: [
				'Need genuine replacement parts',
				'Looking for hard-to-find components',
				'Bulk orders for service centers',
				'Urgent parts delivery needed',
				'Part identification help',
				'Warranty replacement parts'
			],
			services: [
				'Compressors (all capacities)',
				'Thermostats and sensors',
				'PCB boards and controllers',
				'Motors and fans',
				'Door seals and gaskets',
				'Filters and coils',
				'Remote controls',
				'Installation accessories'
			],
			brands: ['All major brands covered', 'Original manufacturer parts', 'Compatible alternatives available'],
			cta: 'Find Parts',
			ctaLink: '#contact'
		},
		{
			id: 'electronics',
			icon: <Recycle className="h-8 w-8" />,
			title: 'Second-hand Electronics',
			subtitle: 'Quality Tested Appliances',
			description: 'Refurbished appliances with warranty and professional testing',
			commonIssues: [
				'Need affordable appliance options',
				'Looking for tested used units',
				'Want warranty on second-hand items',
				'Upgrading old appliances',
				'Budget-friendly solutions',
				'Eco-friendly appliance choice'
			],
			services: [
				'Refurbished ACs (all tonnage)',
				'Used refrigerators (tested)',
				'Washing machines',
				'Water heaters',
				'Microwave ovens',
				'Home appliance exchange',
				'Installation included',
				'3-6 month warranty'
			],
			brands: ['Samsung', 'LG', 'Whirlpool', 'Godrej', 'Voltas', 'Blue Star', 'Others'],
			cta: 'Browse Items',
			ctaLink: '#contact'
		}
	]

	const features = [
		{
			icon: <Shield className="h-6 w-6" />,
			title: '6 Month Warranty',
			description: 'All repairs backed by comprehensive warranty'
		},
		{
			icon: <Clock className="h-6 w-6" />,
			title: 'Same Day Service',
			description: 'Emergency repairs within 24 hours'
		},
		{
			icon: <Wrench className="h-6 w-6" />,
			title: 'Expert Technicians',
			description: '15+ years experience, certified professionals'
		},
		{
			icon: <Truck className="h-6 w-6" />,
			title: 'Free Pickup & Delivery',
			description: 'Convenient service for major repairs'
		}
	]

	return (
		<main>
			{/* Hero Section */}
			<section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-16">
				<div className="mx-auto max-w-6xl px-4">
					<div className="text-center">
						<h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-6">
							Our Services in Thiruvalla & Pathanamthitta
						</h1>
						<p className="text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
							Professional appliance repair, genuine parts supply, and quality second-hand electronics. 
							Trusted by thousands of customers across Kerala for over 15 years.
						</p>
						
						{/* Quick contact */}
						<div className="mt-8 flex justify-center gap-4">
							<a 
								href={`tel:${PHONE}`} 
								className="btn-primary inline-flex items-center gap-2"
							>
								<Phone size={20} />
								Call {PHONE}
							</a>
							<a 
								href={`https://wa.me/${WHATSAPP}?text=Hi, I need service information`}
								className="btn-accent inline-flex items-center gap-2"
								target="_blank"
								rel="noopener noreferrer"
							>
								<MessageCircle size={20} />
								WhatsApp
							</a>
						</div>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="py-12 bg-white">
				<div className="mx-auto max-w-6xl px-4">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{features.map((feature, index) => (
							<div key={index} className="text-center">
								<div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-100 text-primary-600 mx-auto mb-4">
									{feature.icon}
								</div>
								<h3 className="font-semibold text-neutral-800 mb-2">{feature.title}</h3>
								<p className="text-sm text-neutral-600">{feature.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Detailed Services */}
			<section className="py-16 bg-neutral-50">
				<div className="mx-auto max-w-6xl px-4">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
							Detailed Service Information
						</h2>
						<p className="text-lg text-neutral-600">
							Click on any service below to learn more about what we offer
						</p>
					</div>

					<div className="space-y-4">
						{services.map((service) => (
							<div key={service.id} className="card overflow-hidden">
								<button
									onClick={() => setOpenService(openService === service.id ? '' : service.id)}
									className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
									id={service.id}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-4">
											<div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-100 text-primary-600">
												{service.icon}
											</div>
											<div>
												<h3 className="text-xl font-semibold text-neutral-800">
													{service.title}
												</h3>
												<p className="text-neutral-600">{service.subtitle}</p>
											</div>
										</div>
										{openService === service.id ? (
											<ChevronUp className="h-6 w-6 text-neutral-400" />
										) : (
											<ChevronDown className="h-6 w-6 text-neutral-400" />
										)}
									</div>
								</button>

								{openService === service.id && (
									<div className="px-6 pb-6 border-t border-neutral-100">
										<div className="grid gap-8 md:grid-cols-2 mt-6">
											{/* Common Issues */}
											<div>
												<h4 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
													<Zap className="h-5 w-5 text-accent-600" />
													Common Issues We Fix
												</h4>
												<ul className="space-y-2">
													{service.commonIssues.map((issue, index) => (
														<li key={index} className="flex items-start gap-2 text-neutral-600">
															<CheckCircle className="h-4 w-4 text-secondary-600 mt-1 flex-shrink-0" />
															{issue}
														</li>
													))}
												</ul>
											</div>

											{/* Services Offered */}
											<div>
												<h4 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
													<Wrench className="h-5 w-5 text-primary-600" />
													Services We Provide
												</h4>
												<ul className="space-y-2">
													{service.services.map((serviceItem, index) => (
														<li key={index} className="flex items-start gap-2 text-neutral-600">
															<CheckCircle className="h-4 w-4 text-primary-600 mt-1 flex-shrink-0" />
															{serviceItem}
														</li>
													))}
												</ul>
											</div>
										</div>

										{/* Brands */}
										<div className="mt-6">
											<h4 className="font-semibold text-neutral-800 mb-3">
												Brands We Service
											</h4>
											<div className="flex flex-wrap gap-2">
												{service.brands.map((brand, index) => (
													<span 
														key={index}
														className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm"
													>
														{brand}
													</span>
												))}
											</div>
										</div>

										{/* CTA */}
										<div className="mt-6 flex gap-4">
											<a 
												href={service.ctaLink} 
												className="btn-primary"
											>
												{service.cta}
											</a>
											<a 
												href={`https://wa.me/${WHATSAPP}?text=Hi, I need ${service.title.toLowerCase()}`}
												className="btn-secondary"
												target="_blank"
												rel="noopener noreferrer"
											>
												WhatsApp for {service.title}
											</a>
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Service Area */}
			<section className="py-16 bg-white">
				<div className="mx-auto max-w-4xl px-4 text-center">
					<h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-6">
						Service Area
					</h2>
					<div className="card p-8">
						<div className="flex items-center justify-center mb-6">
							<MapPin className="h-8 w-8 text-primary-600" />
						</div>
						<h3 className="text-xl font-semibold text-neutral-800 mb-4">
							We Serve Thiruvalla, Pathanamthitta & Surrounding Areas
						</h3>
						<p className="text-neutral-600 mb-6 leading-relaxed">
							Our service covers the entire Pathanamthitta district with same-day service in Thiruvalla town. 
							We also provide next-day service to surrounding villages and towns.
						</p>
						
						<div className="grid gap-4 md:grid-cols-2 text-left">
							<div>
								<h4 className="font-medium text-neutral-800 mb-2">Same-Day Service Areas:</h4>
								<ul className="text-sm text-neutral-600 space-y-1">
									<li>• Thiruvalla Town</li>
									<li>• Kozhencherry</li>
									<li>• Mallappally</li>
									<li>• Chengannur</li>
								</ul>
							</div>
							<div>
								<h4 className="font-medium text-neutral-800 mb-2">Next-Day Service Areas:</h4>
								<ul className="text-sm text-neutral-600 space-y-1">
									<li>• Pathanamthitta</li>
									<li>• Adoor</li>
									<li>• Pandalam</li>
									<li>• Ranni</li>
								</ul>
							</div>
						</div>

						<div className="mt-8 p-4 bg-primary-50 rounded-lg">
							<p className="text-primary-800 font-medium">
								<Clock className="inline h-4 w-4 mr-1" />
								Response Time: Within 2 hours for emergency calls in Thiruvalla
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Contact CTA */}
			<section className="py-16 bg-gradient-to-br from-primary-600 to-primary-700 text-white" id="contact">
				<div className="mx-auto max-w-4xl px-4 text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-6">
						Ready to Get Your Appliance Fixed?
					</h2>
					<p className="text-lg mb-8 text-primary-100">
						Call us now for immediate assistance or WhatsApp us your appliance photos for quick diagnosis
					</p>
					
					<div className="flex flex-wrap justify-center gap-4">
						<a 
							href={`tel:${PHONE}`} 
							className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors duration-200 inline-flex items-center gap-2"
						>
							<Phone size={20} />
							Call {PHONE}
						</a>
						<a 
							href={`https://wa.me/${WHATSAPP}?text=Hi, I need appliance service. Here's my issue:`}
							className="bg-secondary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-secondary-700 transition-colors duration-200 inline-flex items-center gap-2"
							target="_blank"
							rel="noopener noreferrer"
						>
							<MessageCircle size={20} />
							WhatsApp Us
						</a>
						<Link 
							href="/contact"
							className="bg-accent-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-accent-700 transition-colors duration-200"
						>
							Get Detailed Quote
						</Link>
					</div>
					
					<div className="mt-8 text-primary-200 text-sm">
						<p>Available Mon-Sat 8:00 AM - 8:00 PM</p>
					</div>
				</div>
			</section>
		</main>
	)
}