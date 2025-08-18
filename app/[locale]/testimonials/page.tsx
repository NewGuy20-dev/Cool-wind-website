'use client'

import Link from 'next/link'
import { 
	Star, 
	Quote, 
	Calendar, 
	MapPin,
	Phone,
	MessageCircle,
	Snowflake,
	Wrench,
	ShoppingCart,
	Recycle,
	ThumbsUp,
	Award,
	Users
} from 'lucide-react'
import TestimonialCarouselFixed from '@/components/TestimonialCarouselFixed'
import { transformTestimonialsForCarousel } from '@/lib/testimonials'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918547229991'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'

interface Testimonial {
	id: string
	name: string
	location: string
	service: 'AC Repair' | 'Refrigerator Service' | 'Spare Parts' | 'Electronics' | 'Installation'
	rating: number
	date: string
	text: string
	serviceDetails?: string
}

export default function TestimonialsPage() {
	const testimonials: Testimonial[] = [
		{
			id: '1',
			name: 'Priya M.',
			location: 'Thiruvalla',
			service: 'AC Repair',
			rating: 5,
			date: '2024-01-15',
			text: 'Quick response and fixed our AC same day! Very professional service. The technician was knowledgeable and explained everything clearly. Our AC is working better than ever.',
			serviceDetails: '1.5 ton split AC gas charging'
		},
		{
			id: '2',
			name: 'Ravi K.',
			location: 'Pathanamthitta',
			service: 'Refrigerator Service',
			rating: 5,
			date: '2024-01-12',
			text: 'Honest pricing and quality work on our fridge. Highly recommend! They diagnosed the compressor issue quickly and provided genuine Samsung parts.',
			serviceDetails: 'Samsung double door compressor replacement'
		},
		{
			id: '3',
			name: 'Sarah J.',
			location: 'Thiruvalla',
			service: 'Spare Parts',
			rating: 5,
			date: '2024-01-10',
			text: 'Best service in Thiruvalla, got genuine parts delivered same day. The door seal was exactly what we needed and installation guidance was very helpful.',
			serviceDetails: 'LG refrigerator door seal delivery'
		},
		{
			id: '4',
			name: 'Anil R.',
			location: 'Kozhencherry',
			service: 'AC Repair',
			rating: 5,
			date: '2024-01-08',
			text: 'Excellent service! Our office AC was making noise for weeks. They fixed it in 2 hours and gave 6-month warranty. Very satisfied with their work.',
			serviceDetails: '2 ton split AC fan motor replacement'
		},
		{
			id: '5',
			name: 'Meera S.',
			location: 'Mallappally',
			service: 'Electronics',
			rating: 5,
			date: '2024-01-05',
			text: 'Bought a refurbished Samsung fridge from them. Quality is excellent and comes with warranty. Great value for money and professional delivery.',
			serviceDetails: 'Samsung 192L refurbished refrigerator'
		},
		{
			id: '6',
			name: 'Thomas V.',
			location: 'Chengannur',
			service: 'Installation',
			rating: 5,
			date: '2024-01-03',
			text: 'Professional AC installation service. They handled everything from electrical work to copper piping. Clean work and reasonable pricing.',
			serviceDetails: 'Voltas 1.5 ton split AC installation'
		},
		{
			id: '7',
			name: 'Lakshmi P.',
			location: 'Thiruvalla',
			service: 'Refrigerator Service',
			rating: 5,
			date: '2023-12-28',
			text: 'Our Whirlpool fridge stopped cooling suddenly. They came within 3 hours and fixed the thermostat issue. Very reliable service.',
			serviceDetails: 'Whirlpool double door thermostat repair'
		},
		{
			id: '8',
			name: 'Rajesh M.',
			location: 'Adoor',
			service: 'AC Repair',
			rating: 4,
			date: '2023-12-25',
			text: 'Good service for our window AC. Took a bit longer than expected but the repair quality is good. Fair pricing and genuine parts used.',
			serviceDetails: 'Window AC gas leak repair'
		},
		{
			id: '9',
			name: 'Divya K.',
			location: 'Pathanamthitta',
			service: 'Spare Parts',
			rating: 5,
			date: '2023-12-22',
			text: 'Needed urgent parts for our shop. They delivered within hours and helped with bulk pricing. Great support for business customers.',
			serviceDetails: 'Bulk spare parts for service center'
		},
		{
			id: '10',
			name: 'Suresh B.',
			location: 'Pandalam',
			service: 'AC Repair',
			rating: 5,
			date: '2023-12-20',
			text: 'Central AC maintenance for our office building. Very thorough work and professional team. All 5 units serviced perfectly.',
			serviceDetails: 'Commercial central AC maintenance'
		},
		{
			id: '11',
			name: 'Sindhu R.',
			location: 'Thiruvalla',
			service: 'Electronics',
			rating: 4,
			date: '2023-12-18',
			text: 'Purchased a second-hand washing machine. Good condition and working well. Customer service is responsive and helpful.',
			serviceDetails: 'LG 6.5kg washing machine'
		},
		{
			id: '12',
			name: 'Kumar A.',
			location: 'Ranni',
			service: 'Refrigerator Service',
			rating: 5,
			date: '2023-12-15',
			text: 'Excellent work on our old Godrej fridge. They brought it back to life when we thought it was beyond repair. Genuine parts and fair pricing.',
			serviceDetails: 'Godrej single door complete overhaul'
		}
	]

	const stats = [
		{
			number: '1000+',
			label: 'Happy Customers',
			icon: <Users className="h-6 w-6" />
		},
		{
			number: '4.9',
			label: 'Average Rating',
			icon: <Star className="h-6 w-6" />
		},
		{
			number: '95%',
			label: 'Repeat Customers',
			icon: <ThumbsUp className="h-6 w-6" />
		},
		{
			number: '15+',
			label: 'Years Trusted',
			icon: <Award className="h-6 w-6" />
		}
	]

	const serviceIcons = {
		'AC Repair': <Snowflake className="h-4 w-4" />,
		'Refrigerator Service': <Wrench className="h-4 w-4" />,
		'Spare Parts': <ShoppingCart className="h-4 w-4" />,
		'Electronics': <Recycle className="h-4 w-4" />,
		'Installation': <Wrench className="h-4 w-4" />
	}

	const getServiceColor = (service: string) => {
		switch (service) {
			case 'AC Repair': return 'bg-blue-100 text-blue-700'
			case 'Refrigerator Service': return 'bg-green-100 text-green-700'
			case 'Spare Parts': return 'bg-purple-100 text-purple-700'
			case 'Electronics': return 'bg-orange-100 text-orange-700'
			case 'Installation': return 'bg-indigo-100 text-indigo-700'
			default: return 'bg-neutral-100 text-neutral-700'
		}
	}

	const renderStars = (rating: number) => {
		return Array.from({ length: 5 }, (_, i) => (
			<Star
				key={i}
				className={`h-4 w-4 ${
					i < rating ? 'text-yellow-400 fill-current' : 'text-neutral-300'
				}`}
			/>
		))
	}

	return (
		<main>
			{/* Hero Section */}
			<section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-16">
				<div className="mx-auto max-w-6xl px-4">
					<div className="text-center">
						<h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-6">
							Customer Testimonials
						</h1>
						<p className="text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
							Real feedback from our satisfied customers across Thiruvalla & Pathanamthitta. 
							See why families and businesses trust Cool Wind Services.
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

			{/* Featured Testimonials Carousel */}
			<section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
				<div className="mx-auto max-w-6xl px-4">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
							Featured Customer Stories
						</h2>
						<p className="text-lg text-neutral-600">
							Discover why our customers choose Cool Wind Services time and again
						</p>
					</div>
					
					<TestimonialCarouselFixed 
						testimonials={transformTestimonialsForCarousel(testimonials.slice(0, 8))}
						autoScrollInterval={10000}
						showRating={true}
						showIndicators={true}
					/>
				</div>
			</section>

			{/* Testimonials Grid */}
			<section className="py-16 bg-white">
				<div className="mx-auto max-w-6xl px-4">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
							All Customer Reviews
						</h2>
						<p className="text-lg text-neutral-600">
							Browse detailed reviews from real customers who experienced our service
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{testimonials.map((testimonial) => (
							<div key={testimonial.id} className="card p-6 h-full flex flex-col">
								{/* Quote Icon */}
								<div className="flex items-start justify-between mb-4">
									<Quote className="h-8 w-8 text-primary-200 flex-shrink-0" />
									<div className="flex items-center gap-1">
										{renderStars(testimonial.rating)}
									</div>
								</div>

								{/* Review Text */}
								<div className="flex-grow mb-4">
									<p className="text-neutral-700 leading-relaxed mb-3">
										"{testimonial.text}"
									</p>
									{testimonial.serviceDetails && (
										<p className="text-xs text-neutral-500 bg-neutral-50 px-2 py-1 rounded">
											Service: {testimonial.serviceDetails}
										</p>
									)}
								</div>

								{/* Customer Info */}
								<div className="border-t pt-4">
									<div className="flex items-center justify-between mb-2">
										<div>
											<h4 className="font-medium text-neutral-800">
												{testimonial.name}
											</h4>
											<p className="text-sm text-neutral-600 flex items-center gap-1">
												<MapPin className="h-3 w-3" />
												{testimonial.location}
											</p>
										</div>
										<span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getServiceColor(testimonial.service)}`}>
											{serviceIcons[testimonial.service]}
											{testimonial.service}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-xs text-neutral-500 flex items-center gap-1">
											<Calendar className="h-3 w-3" />
											{new Date(testimonial.date).toLocaleDateString('en-US', { 
												month: 'short', 
												day: 'numeric',
												year: 'numeric' 
											})}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Service Categories Summary */}
			<section className="py-16 bg-neutral-50">
				<div className="mx-auto max-w-6xl px-4">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-neutral-800 mb-4">
							Reviews by Service Category
						</h2>
						<p className="text-lg text-neutral-600">
							See what customers say about each of our services
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{Object.entries(
							testimonials.reduce((acc, testimonial) => {
								if (!acc[testimonial.service]) {
									acc[testimonial.service] = []
								}
								acc[testimonial.service].push(testimonial)
								return acc
							}, {} as Record<string, Testimonial[]>)
						).map(([service, reviews]) => {
							const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
							return (
								<div key={service} className="card p-6">
									<div className="flex items-center gap-3 mb-4">
										<div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getServiceColor(service)}`}>
											{serviceIcons[service as keyof typeof serviceIcons]}
										</div>
										<div>
											<h3 className="font-semibold text-neutral-800">{service}</h3>
											<div className="flex items-center gap-2">
												<div className="flex items-center gap-1">
													{renderStars(Math.round(avgRating))}
												</div>
												<span className="text-sm text-neutral-600">
													{avgRating.toFixed(1)} ({reviews.length} reviews)
												</span>
											</div>
										</div>
									</div>
									
									<div className="space-y-3">
										{reviews.slice(0, 2).map((review) => (
											<div key={review.id} className="border-l-2 border-neutral-200 pl-3">
												<p className="text-sm text-neutral-700 mb-1">
													"{review.text.substring(0, 100)}..."
												</p>
												<p className="text-xs text-neutral-500">
													- {review.name}, {review.location}
												</p>
											</div>
										))}
									</div>
									
									{reviews.length > 2 && (
										<p className="text-sm text-primary-600 mt-3">
											+{reviews.length - 2} more {service.toLowerCase()} reviews
										</p>
									)}
								</div>
							)
						})}
					</div>
				</div>
			</section>

			{/* Customer Satisfaction Guarantee */}
			<section className="py-16 bg-white">
				<div className="mx-auto max-w-4xl px-4 text-center">
					<div className="card p-8">
						<div className="flex items-center justify-center mb-6">
							<div className="h-16 w-16 rounded-full bg-secondary-100 flex items-center justify-center">
								<Award className="h-8 w-8 text-secondary-600" />
							</div>
						</div>
						<h2 className="text-3xl font-bold text-neutral-800 mb-4">
							Our Customer Satisfaction Guarantee
						</h2>
						<p className="text-lg text-neutral-600 mb-6 leading-relaxed">
							We're committed to your complete satisfaction. If you're not happy with our service, 
							we'll make it right. That's our promise to every customer in Thiruvalla & Pathanamthitta.
						</p>
						
						<div className="grid gap-4 md:grid-cols-3 mb-8">
							<div className="text-center">
								<div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center mx-auto mb-2">
									<Star className="h-6 w-6 text-primary-600" />
								</div>
								<h4 className="font-medium text-neutral-800 mb-1">Quality Work</h4>
								<p className="text-sm text-neutral-600">Professional service every time</p>
							</div>
							<div className="text-center">
								<div className="h-12 w-12 rounded-lg bg-secondary-100 flex items-center justify-center mx-auto mb-2">
									<ThumbsUp className="h-6 w-6 text-secondary-600" />
								</div>
								<h4 className="font-medium text-neutral-800 mb-1">Fair Pricing</h4>
								<p className="text-sm text-neutral-600">Transparent, competitive rates</p>
							</div>
							<div className="text-center">
								<div className="h-12 w-12 rounded-lg bg-accent-100 flex items-center justify-center mx-auto mb-2">
									<Award className="h-6 w-6 text-accent-600" />
								</div>
								<h4 className="font-medium text-neutral-800 mb-1">6-Month Warranty</h4>
								<p className="text-sm text-neutral-600">Guaranteed on all repairs</p>
							</div>
						</div>

						<div className="flex flex-wrap justify-center gap-4">
							<a 
								href={`tel:${PHONE}`} 
								className="btn-primary inline-flex items-center gap-2"
							>
								<Phone size={20} />
								Call {PHONE}
							</a>
							<a 
								href={`https://wa.me/${WHATSAPP}?text=Hi, I'd like to experience your guaranteed service`}
								className="btn-secondary inline-flex items-center gap-2"
								target="_blank"
								rel="noopener noreferrer"
							>
								<MessageCircle size={20} />
								WhatsApp Us
							</a>
						</div>
					</div>
				</div>
			</section>

			{/* Leave a Review CTA */}
			<section className="py-16 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
				<div className="mx-auto max-w-4xl px-4 text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-6">
						Share Your Experience
					</h2>
					<p className="text-lg mb-8 text-primary-100">
						Have you used our services? We'd love to hear about your experience. 
						Your feedback helps us improve and helps other customers make informed decisions.
					</p>
					
					<div className="flex flex-wrap justify-center gap-4">
						<Link 
							href="/contact"
							className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors duration-200"
						>
							Leave a Review
						</Link>
						<a 
							href={`https://wa.me/${WHATSAPP}?text=Hi, I'd like to share my experience with Cool Wind Services`}
							className="bg-secondary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-secondary-700 transition-colors duration-200 inline-flex items-center gap-2"
							target="_blank"
							rel="noopener noreferrer"
						>
							<MessageCircle size={20} />
							WhatsApp Your Review
						</a>
					</div>
					
					<div className="mt-8 text-primary-200 text-sm">
						<p>Your honest feedback is valuable to us and our community</p>
					</div>
				</div>
			</section>
		</main>
	)
}