'use client'

import Link from 'next/link'
import { 
	MapPin, 
	Clock, 
	Shield, 
	Users, 
	Award, 
	Wrench, 
	Phone, 
	MessageCircle,
	CheckCircle,
	Calendar,
	Target,
	Heart,
	Star,
	TrendingUp
} from 'lucide-react'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918547229991'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'

export default function AboutPage() {
	const milestones = [
		{
			year: '2009',
			title: 'Cool Wind Services Founded',
			description: 'Started as a small repair shop in Thiruvalla with a focus on quality service'
		},
		{
			year: '2012',
			title: 'Expanded to Parts Supply',
			description: 'Became authorized dealer for major brands, ensuring genuine parts availability'
		},
		{
			year: '2015',
			title: 'Commercial Services',
			description: 'Extended services to offices, shops, and commercial establishments'
		},
		{
			year: '2018',
			title: 'Digital Presence',
			description: 'Launched online booking and WhatsApp support for customer convenience'
		},
		{
			year: '2020',
			title: 'Emergency Services',
			description: 'Introduced emergency repair services during pandemic'
		},
		{
			year: '2024',
			title: '1000+ Happy Customers',
			description: 'Celebrating 15 years of trusted service with growing customer base'
		}
	]

	const values = [
		{
			icon: <Shield className="h-8 w-8" />,
			title: 'Reliability',
			description: 'We stand behind our work with comprehensive warranties and guaranteed service quality.'
		},
		{
			icon: <Heart className="h-8 w-8" />,
			title: 'Honesty',
			description: 'Transparent pricing, genuine parts, and honest advice - no hidden charges ever.'
		},
		{
			icon: <Target className="h-8 w-8" />,
			title: 'Quality',
			description: 'Using only genuine parts and proven repair techniques for lasting solutions.'
		},
		{
			icon: <Users className="h-8 w-8" />,
			title: 'Customer First',
			description: 'Your satisfaction is our priority. We listen, understand, and deliver accordingly.'
		}
	]

	const stats = [
		{
			number: '15+',
			label: 'Years Experience',
			icon: <Calendar className="h-6 w-6" />
		},
		{
			number: '1000+',
			label: 'Happy Customers',
			icon: <Users className="h-6 w-6" />
		},
		{
			number: '50+',
			label: 'Projects/Month',
			icon: <TrendingUp className="h-6 w-6" />
		},
		{
			number: '4.9',
			label: 'Average Rating',
			icon: <Star className="h-6 w-6" />
		}
	]

	const serviceAreas = [
		{
			area: 'Thiruvalla',
			type: 'Same Day Service',
			description: 'Our home base - fastest response time within 2 hours'
		},
		{
			area: 'Pathanamthitta',
			type: 'Same Day Service',
			description: 'Full service coverage with same-day response'
		},
		{
			area: 'Kozhencherry',
			type: 'Same Day Service',
			description: 'Regular service route with quick turnaround'
		},
		{
			area: 'Mallappally',
			type: 'Same Day Service',
			description: 'Established customer base with reliable service'
		},
		{
			area: 'Chengannur',
			type: 'Next Day Service',
			description: 'Extended coverage area with next-day service'
		},
		{
			area: 'Adoor',
			type: 'Next Day Service',
			description: 'Growing service area with scheduled visits'
		},
		{
			area: 'Pandalam',
			type: 'Next Day Service',
			description: 'Regular service visits on scheduled days'
		},
		{
			area: 'Ranni',
			type: 'Next Day Service',
			description: 'Extended service area with planned service days'
		}
	]

	const certifications = [
		'Authorized Service Partner - Samsung',
		'Certified Technician - LG Electronics',
		'Refrigeration Expert - Godrej',
		'AC Installation Specialist - Voltas',
		'Safety Certified - Kerala Electrical Board'
	]

	return (
		<main>
			{/* Hero Section */}
			<section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-16">
				<div className="mx-auto max-w-6xl px-4">
					<div className="text-center">
						<h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-6">
							About Cool Wind Services
						</h1>
						<p className="text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
							Serving Thiruvalla & Pathanamthitta for over 15 years with reliable appliance repair, 
							genuine parts supply, and trusted customer service.
						</p>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
						{stats.map((stat, index) => (
							<div key={index} className="text-center">
								<div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-600 text-white mx-auto mb-3">
									{stat.icon}
								</div>
								<div className="text-2xl md:text-3xl font-bold text-neutral-800 mb-1">
									{stat.number}
								</div>
								<div className="text-sm text-neutral-600">
									{stat.label}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Our Story */}
			<section className="py-16 bg-white">
				<div className="mx-auto max-w-6xl px-4">
					<div className="grid gap-12 lg:grid-cols-2 items-center">
						<div>
							<h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-6">
								Our Story
							</h2>
							<div className="space-y-4 text-neutral-600 leading-relaxed">
								<p>
									Cool Wind Services was founded in 2009 with a simple mission: to provide reliable, 
									honest, and affordable appliance repair services to the people of Thiruvalla and 
									surrounding areas.
								</p>
								<p>
									What started as a small repair shop has grown into a trusted name in Kerala's 
									appliance service industry. We've built our reputation on quality workmanship, 
									genuine parts, and treating every customer like family.
								</p>
								<p>
									Today, we're proud to serve over 1000+ satisfied customers across Pathanamthitta 
									district, handling everything from emergency repairs to planned maintenance, parts 
									supply, and quality second-hand appliances.
								</p>
								<p>
									Our team of experienced technicians brings decades of combined expertise to every 
									job, ensuring your appliances run efficiently and last longer.
								</p>
							</div>
						</div>
						<div className="relative">
							<div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
								<div className="text-center">
									<div className="mx-auto h-24 w-24 rounded-full bg-primary-600 flex items-center justify-center mb-4">
										<Wrench className="h-12 w-12 text-white" />
									</div>
									<p className="text-neutral-700 font-medium">15+ Years of Excellence</p>
									<p className="text-sm text-neutral-600 mt-2">Serving Thiruvalla & Pathanamthitta</p>
								</div>
							</div>
							{/* Floating elements */}
							<div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-secondary-100 flex items-center justify-center shadow-lg">
								<Award className="h-8 w-8 text-secondary-600" />
							</div>
							<div className="absolute -bottom-4 -left-4 h-12 w-12 rounded-full bg-accent-100 flex items-center justify-center shadow-lg">
								<CheckCircle className="h-6 w-6 text-accent-600" />
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Timeline */}
			<section className="py-16 bg-neutral-50">
				<div className="mx-auto max-w-4xl px-4">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
							Our Journey
						</h2>
						<p className="text-lg text-neutral-600">
							Key milestones in our 15-year journey of serving Kerala
						</p>
					</div>

					<div className="relative">
						{/* Timeline line */}
						<div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary-200 md:transform md:-translate-x-0.5"></div>

						<div className="space-y-8">
							{milestones.map((milestone, index) => (
								<div key={index} className={`relative flex items-center ${
									index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
								}`}>
									{/* Timeline dot */}
									<div className="absolute left-4 md:left-1/2 w-3 h-3 bg-primary-600 rounded-full md:transform md:-translate-x-1.5 z-10"></div>
									
									{/* Content */}
									<div className={`ml-12 md:ml-0 md:w-1/2 ${
										index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'
									}`}>
										<div className="card p-6">
											<div className="flex items-center gap-3 mb-3">
												<span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
													{milestone.year}
												</span>
											</div>
											<h3 className="font-semibold text-neutral-800 mb-2">
												{milestone.title}
											</h3>
											<p className="text-neutral-600 text-sm">
												{milestone.description}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Our Values */}
			<section className="py-16 bg-white">
				<div className="mx-auto max-w-6xl px-4">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
							Our Values
						</h2>
						<p className="text-lg text-neutral-600">
							The principles that guide everything we do
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
						{values.map((value, index) => (
							<div key={index} className="text-center">
								<div className="flex items-center justify-center h-16 w-16 rounded-lg bg-primary-100 text-primary-600 mx-auto mb-4">
									{value.icon}
								</div>
								<h3 className="font-semibold text-neutral-800 mb-3">
									{value.title}
								</h3>
								<p className="text-neutral-600 text-sm leading-relaxed">
									{value.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Service Area Map */}
			<section className="py-16 bg-neutral-50">
				<div className="mx-auto max-w-6xl px-4">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
							Service Area Coverage
						</h2>
						<p className="text-lg text-neutral-600">
							We serve Thiruvalla, Pathanamthitta and surrounding areas
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{serviceAreas.map((area, index) => (
							<div key={index} className="card p-6">
								<div className="flex items-center justify-between mb-3">
									<h3 className="font-semibold text-neutral-800">
										{area.area}
									</h3>
									<span className={`px-2 py-1 rounded-full text-xs font-medium ${
										area.type === 'Same Day Service' 
											? 'bg-secondary-100 text-secondary-700'
											: 'bg-accent-100 text-accent-700'
									}`}>
										{area.type}
									</span>
								</div>
								<p className="text-neutral-600 text-sm">
									{area.description}
								</p>
							</div>
						))}
					</div>

					<div className="text-center mt-8">
						<div className="card p-6 max-w-2xl mx-auto">
							<div className="flex items-center justify-center mb-4">
								<MapPin className="h-8 w-8 text-primary-600" />
							</div>
							<h3 className="font-semibold text-neutral-800 mb-2">
								Coverage Area
							</h3>
							<p className="text-neutral-600 mb-4">
								We provide comprehensive service coverage across Pathanamthitta district with 
								same-day service in major towns and next-day service in extended areas.
							</p>
							<div className="flex items-center justify-center gap-4 text-sm text-neutral-600">
								<span className="flex items-center gap-1">
									<Clock className="h-4 w-4" />
									2-hour response in Thiruvalla
								</span>
								<span className="flex items-center gap-1">
									<CheckCircle className="h-4 w-4" />
									Emergency service available
								</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Certifications & Expertise */}
			<section className="py-16 bg-white">
				<div className="mx-auto max-w-6xl px-4">
					<div className="grid gap-12 lg:grid-cols-2">
						<div>
							<h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-6">
								Certifications & Expertise
							</h2>
							<p className="text-neutral-600 mb-6 leading-relaxed">
								Our technicians are certified professionals with extensive training from 
								major appliance manufacturers. We stay updated with the latest technologies 
								and repair techniques.
							</p>
							<ul className="space-y-3">
								{certifications.map((cert, index) => (
									<li key={index} className="flex items-start gap-3">
										<CheckCircle className="h-5 w-5 text-secondary-600 mt-0.5 flex-shrink-0" />
										<span className="text-neutral-700">{cert}</span>
									</li>
								))}
							</ul>
						</div>
						<div>
							<h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-6">
								Why Choose Us?
							</h2>
							<div className="space-y-4">
								{[
									{
										title: 'Local Expertise',
										description: 'Deep understanding of local climate and usage patterns'
									},
									{
										title: 'Genuine Parts',
										description: 'Only authentic manufacturer parts with warranty'
									},
									{
										title: 'Fair Pricing',
										description: 'Transparent, competitive pricing with no hidden charges'
									},
									{
										title: 'Quick Response',
										description: 'Same-day service in most areas, emergency support available'
									},
									{
										title: 'Customer Support',
										description: 'Friendly, knowledgeable staff who speak your language'
									}
								].map((item, index) => (
									<div key={index} className="flex gap-4">
										<div className="h-8 w-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
											<CheckCircle className="h-4 w-4 text-primary-600" />
										</div>
										<div>
											<h4 className="font-medium text-neutral-800 mb-1">
												{item.title}
											</h4>
											<p className="text-sm text-neutral-600">
												{item.description}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Contact CTA */}
			<section className="py-16 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
				<div className="mx-auto max-w-4xl px-4 text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-6">
						Ready to Experience Our Service?
					</h2>
					<p className="text-lg mb-8 text-primary-100">
						Join thousands of satisfied customers who trust Cool Wind Services 
						for all their appliance needs.
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
							href={`https://wa.me/${WHATSAPP}?text=Hi, I'd like to know more about Cool Wind Services`}
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
							Get in Touch
						</Link>
					</div>
					
					<div className="mt-8 text-primary-200 text-sm">
						<p>Available Mon-Sat 10:00 AM - 6:00 PM | Emergency service available</p>
					</div>
				</div>
			</section>
		</main>
	)
}