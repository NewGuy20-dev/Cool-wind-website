'use client'

import Link from 'next/link'
import { Phone, MessageCircle, Wrench, Snowflake, ShoppingCart, Recycle, Star, MapPin, Clock, CheckCircle } from 'lucide-react'
import { analytics } from '@/lib/analytics'
import ContactForm from '@/components/ContactForm'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918547229991'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'

export default function HomePage() {
	const services = [
		{
			icon: <Wrench className="h-8 w-8" />,
			title: 'AC Repair & Installation',
			description: 'Expert AC service for all brands. No cooling, strange noises, high bills - we fix it all.',
			link: '/services#ac-repair',
			cta: 'Book AC Service'
		},
		{
			icon: <Snowflake className="h-8 w-8" />,
			title: 'Refrigerator Service',
			description: 'Complete fridge repair service. Not cooling, water leaking, compressor issues solved.',
			link: '/services#refrigerator-repair',
			cta: 'Fix My Fridge'
		},
		{
			icon: <ShoppingCart className="h-8 w-8" />,
			title: 'Spare Parts Supply',
			description: 'Genuine parts for all major brands. Fast delivery in Thiruvalla & Pathanamthitta.',
			link: '/services#spare-parts',
			cta: 'Find Parts'
		},
		{
			icon: <Recycle className="h-8 w-8" />,
			title: 'Second-hand Electronics',
			description: 'Quality tested appliances with warranty. Great value for money.',
			link: '/services#electronics',
			cta: 'Browse Items'
		}
	]

	const testimonials = [
		{
			name: 'Priya M.',
			location: 'Thiruvalla',
			service: 'AC Repair',
			rating: 5,
			text: 'Quick response and fixed our AC same day! Very professional service.',
			date: '2024-01-15'
		},
		{
			name: 'Ravi K.',
			location: 'Pathanamthitta',
			service: 'Refrigerator Parts',
			rating: 5,
			text: 'Honest pricing and quality work on our fridge. Highly recommend!',
			date: '2024-01-10'
		},
		{
			name: 'Sarah J.',
			location: 'Thiruvalla',
			service: 'Spare Parts',
			rating: 5,
			text: 'Best service in Thiruvalla, got genuine parts delivered same day.',
			date: '2024-01-05'
		}
	]

	const features = [
		{ icon: <CheckCircle className="h-5 w-5" />, text: '15+ Years Experience' },
		{ icon: <CheckCircle className="h-5 w-5" />, text: 'Genuine Parts Only' },
		{ icon: <CheckCircle className="h-5 w-5" />, text: 'Same Day Service' },
		{ icon: <CheckCircle className="h-5 w-5" />, text: '6 Month Warranty' }
	]

	return (
		<main>
			{/* Skip link for accessibility */}
			<a href="#main-content" className="skip-link">Skip to main content</a>

			{/* Hero Section */}
			<section className="relative bg-gradient-to-br from-primary-50 to-secondary-50 overflow-hidden" id="main-content">
				<div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23e0e7ff" fill-opacity="0.3"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
				<div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
					<div className="grid gap-12 lg:grid-cols-2 items-center">
						<div className="animate-slide-up">
							<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-800 leading-tight">
								Reliable AC & Refrigerator Services in 
								<span className="text-primary-600"> Thiruvalla</span>
							</h1>
							<p className="mt-6 text-lg md:text-xl text-neutral-600 leading-relaxed">
								Expert repair, quality sales, trusted by locals since 2009. 
								Serving Thiruvalla & Pathanamthitta with genuine parts and professional service.
							</p>
							
							{/* Features */}
							<div className="mt-6 grid grid-cols-2 gap-3">
								{features.map((feature, index) => (
									<div key={index} className="flex items-center gap-2 text-sm text-neutral-600">
										<span className="text-secondary-600">{feature.icon}</span>
										{feature.text}
									</div>
								))}
							</div>

							{/* CTAs */}
							<div className="mt-8 flex flex-wrap gap-4">
								<a 
									href={`tel:${PHONE}`} 
									onClick={() => analytics.phoneCallClick()} 
									className="btn-primary inline-flex items-center gap-2"
								>
									<Phone size={20} />
									Call Now
								</a>
								<a 
									href={`https://wa.me/${WHATSAPP}?text=Hi, I need help with my appliance`}
									onClick={() => analytics.whatsappClick()} 
									className="btn-accent inline-flex items-center gap-2"
									target="_blank"
									rel="noopener noreferrer"
								>
									<MessageCircle size={20} />
									WhatsApp Us
								</a>
								<Link href="#contact" className="btn-secondary">
									Get Quote
								</Link>
							</div>

							{/* Contact info */}
							<div className="mt-8 flex flex-wrap gap-6 text-sm text-neutral-600">
								<div className="flex items-center gap-2">
									<MapPin className="h-4 w-4 text-primary-600" />
									Serving Thiruvalla & Pathanamthitta
								</div>
								<div className="flex items-center gap-2">
									<Clock className="h-4 w-4 text-primary-600" />
									Mon-Sat 8AM-8PM
								</div>
							</div>
						</div>

						{/* Hero Image Placeholder */}
						<div className="relative">
							<div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-white to-neutral-100 shadow-soft border border-neutral-200 flex items-center justify-center">
								<div className="text-center">
									<div className="mx-auto h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center mb-4">
										<Snowflake className="h-12 w-12 text-primary-600" />
									</div>
									<p className="text-neutral-600 font-medium">Professional AC & Refrigerator Service</p>
									<p className="text-sm text-neutral-500 mt-2">Trusted by 1000+ customers in Kerala</p>
								</div>
							</div>
							{/* Floating elements */}
							<div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-secondary-100 flex items-center justify-center shadow-lg">
								<Wrench className="h-8 w-8 text-secondary-600" />
							</div>
							<div className="absolute -bottom-4 -left-4 h-12 w-12 rounded-full bg-accent-100 flex items-center justify-center shadow-lg">
								<CheckCircle className="h-6 w-6 text-accent-600" />
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Quick Services Grid */}
			<section className="py-16 bg-white">
				<div className="mx-auto max-w-6xl px-4">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-neutral-800">Our Services</h2>
						<p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
							Comprehensive appliance solutions for homes and businesses in Thiruvalla & Pathanamthitta
						</p>
					</div>
					
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{services.map((service, index) => (
							<div key={index} className="card p-6 group hover:scale-105 transition-transform duration-200">
								<div className="flex items-center justify-center h-16 w-16 rounded-lg bg-primary-100 text-primary-600 mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-200">
									{service.icon}
								</div>
								<h3 className="text-xl font-semibold text-neutral-800 mb-3">{service.title}</h3>
								<p className="text-neutral-600 mb-4 leading-relaxed">{service.description}</p>
								<Link 
									href={service.link} 
									className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium group"
								>
									{service.cta}
									<span className="ml-1 transition-transform duration-200 group-hover:translate-x-1">→</span>
								</Link>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Featured Work Section */}
			<section className="py-16 bg-neutral-50">
				<div className="mx-auto max-w-6xl px-4">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-neutral-800">Recent Projects</h2>
						<p className="mt-4 text-lg text-neutral-600">See our latest work across Thiruvalla & Pathanamthitta</p>
					</div>
					
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{[
							{
								title: 'Split AC Installation - Thiruvalla Home',
								category: 'AC Installation',
								date: 'Jan 2024',
								description: 'Complete 1.5 ton split AC installation with copper piping'
							},
							{
								title: 'Refrigerator Compressor Repair',
								category: 'Refrigerator Service',
								date: 'Jan 2024',
								description: 'Samsung double door fridge compressor replacement'
							},
							{
								title: 'Commercial AC Maintenance',
								category: 'AC Service',
								date: 'Dec 2023',
								description: 'Office complex central AC system maintenance'
							}
						].map((project, index) => (
							<div key={index} className="card p-6">
								<div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200 mb-4 flex items-center justify-center">
									<span className="text-neutral-500">Project Image</span>
								</div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm text-primary-600 font-medium">{project.category}</span>
									<span className="text-sm text-neutral-500">{project.date}</span>
								</div>
								<h3 className="font-semibold text-neutral-800 mb-2">{project.title}</h3>
								<p className="text-neutral-600 text-sm">{project.description}</p>
							</div>
						))}
					</div>
					
					<div className="text-center mt-8">
						<Link href="/portfolio" className="btn-secondary">
							View All Projects
						</Link>
					</div>
				</div>
			</section>

			{/* Testimonials Preview */}
			<section className="py-16 bg-white">
				<div className="mx-auto max-w-6xl px-4">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-neutral-800">What Our Customers Say</h2>
						<p className="mt-4 text-lg text-neutral-600">Trusted by families and businesses across Kerala</p>
					</div>
					
					<div className="grid gap-6 md:grid-cols-3">
						{testimonials.map((testimonial, index) => (
							<div key={index} className="card p-6">
								<div className="flex items-center mb-3">
									{[...Array(testimonial.rating)].map((_, i) => (
										<Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
									))}
								</div>
								<p className="text-neutral-700 mb-4 leading-relaxed">"{testimonial.text}"</p>
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium text-neutral-800">{testimonial.name}</p>
										<p className="text-sm text-neutral-600">{testimonial.service}</p>
									</div>
									<p className="text-sm text-neutral-500">{testimonial.location}</p>
								</div>
							</div>
						))}
					</div>
					
					<div className="text-center mt-8">
						<Link href="/testimonials" className="btn-secondary">
							Read More Reviews
						</Link>
					</div>
				</div>
			</section>

			{/* Contact Preview */}
			<section className="py-16 bg-primary-50" id="contact">
				<div className="mx-auto max-w-4xl px-4">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-neutral-800">Get Quick Quote</h2>
						<p className="mt-4 text-lg text-neutral-600">
							Tell us about your appliance issue and we'll get back to you within 2 hours
						</p>
					</div>
					
					<div className="card p-8">
						<ContactForm compact />
					</div>
					
					<div className="text-center mt-8 space-y-2">
						<p className="text-neutral-600">
							<MapPin className="inline h-4 w-4 mr-1" />
							Serving Thiruvalla & Pathanamthitta
						</p>
						<p className="text-neutral-600">
							<Clock className="inline h-4 w-4 mr-1" />
							Mon-Sat 8:00 AM - 8:00 PM
						</p>
						<div className="flex justify-center gap-4 mt-4">
							<a 
								href={`tel:${PHONE}`} 
								className="btn-primary inline-flex items-center gap-2"
							>
								<Phone size={18} />
								{PHONE}
							</a>
							<a 
								href={`https://wa.me/${WHATSAPP}`}
								className="btn-accent inline-flex items-center gap-2"
								target="_blank"
								rel="noopener noreferrer"
							>
								<MessageCircle size={18} />
								WhatsApp
							</a>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}