'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
	Filter, 
	X, 
	ChevronLeft, 
	ChevronRight, 
	Calendar,
	MapPin,
	Tag,
	Phone,
	MessageCircle,
	Snowflake,
	Wrench,
	ShoppingCart,
	Recycle
} from 'lucide-react'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918547229991'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'

interface PortfolioItem {
	id: string
	title: string
	category: 'ac' | 'refrigerator' | 'parts' | 'electronics'
	location: string
	date: string
	description: string
	image: string
	details: string[]
}

export default function PortfolioPage() {
	const [selectedCategory, setSelectedCategory] = useState<string>('all')
	const [lightboxOpen, setLightboxOpen] = useState(false)
	const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)
	const [currentImageIndex, setCurrentImageIndex] = useState(0)

	const categories = [
		{ id: 'all', name: 'All Projects', icon: <Filter className="h-4 w-4" /> },
		{ id: 'ac', name: 'AC Services', icon: <Snowflake className="h-4 w-4" /> },
		{ id: 'refrigerator', name: 'Refrigerator', icon: <Wrench className="h-4 w-4" /> },
		{ id: 'parts', name: 'Parts Supply', icon: <ShoppingCart className="h-4 w-4" /> },
		{ id: 'electronics', name: 'Electronics', icon: <Recycle className="h-4 w-4" /> }
	]

	const portfolioItems: PortfolioItem[] = [
		{
			id: '1',
			title: 'Split AC Installation - Thiruvalla Home',
			category: 'ac',
			location: 'Thiruvalla',
			date: '2024-01-15',
			description: 'Complete 1.5 ton split AC installation with copper piping and electrical work',
			image: '/api/placeholder/400/300',
			details: [
				'Brand: Samsung 1.5 ton split AC',
				'Copper piping installation',
				'Electrical wiring and safety switches',
				'Wall mounting and drainage',
				'Gas charging and testing',
				'Customer training provided'
			]
		},
		{
			id: '2',
			title: 'Refrigerator Compressor Repair',
			category: 'refrigerator',
			location: 'Pathanamthitta',
			date: '2024-01-12',
			description: 'Samsung double door fridge compressor replacement with warranty',
			image: '/api/placeholder/400/300',
			details: [
				'Model: Samsung 253L double door',
				'Compressor replacement',
				'Gas refilling',
				'Thermostat calibration',
				'Performance testing',
				'6-month warranty provided'
			]
		},
		{
			id: '3',
			title: 'Commercial AC Maintenance - Office Complex',
			category: 'ac',
			location: 'Kozhencherry',
			date: '2024-01-10',
			description: 'Annual maintenance of 5 split ACs in commercial office building',
			image: '/api/placeholder/400/300',
			details: [
				'5 units serviced (2 ton each)',
				'Filter cleaning and replacement',
				'Coil cleaning',
				'Gas pressure check',
				'Electrical connections inspection',
				'Preventive maintenance report'
			]
		},
		{
			id: '4',
			title: 'LG Refrigerator Parts Delivery',
			category: 'parts',
			location: 'Thiruvalla',
			date: '2024-01-08',
			description: 'Urgent door seal and thermostat delivery for LG refrigerator',
			image: '/api/placeholder/400/300',
			details: [
				'Genuine LG door seal',
				'Digital thermostat',
				'Same-day delivery',
				'Installation guidance provided',
				'Parts warranty included',
				'Follow-up service call'
			]
		},
		{
			id: '5',
			title: 'Window AC Gas Charging',
			category: 'ac',
			location: 'Mallappally',
			date: '2024-01-05',
			description: 'Gas leak repair and recharging for 1.5 ton window AC',
			image: '/api/placeholder/400/300',
			details: [
				'Leak detection and repair',
				'R22 gas charging',
				'Pressure testing',
				'Performance optimization',
				'Energy efficiency check',
				'Maintenance tips provided'
			]
		},
		{
			id: '6',
			title: 'Refurbished Refrigerator Sale',
			category: 'electronics',
			location: 'Thiruvalla',
			date: '2024-01-03',
			description: 'Quality tested Samsung refrigerator with 3-month warranty',
			image: '/api/placeholder/400/300',
			details: [
				'Samsung 192L single door',
				'Complete refurbishment',
				'New compressor installed',
				'Deep cleaning performed',
				'3-month warranty',
				'Free home delivery'
			]
		},
		{
			id: '7',
			title: 'Central AC Duct Cleaning',
			category: 'ac',
			location: 'Chengannur',
			date: '2023-12-28',
			description: 'Professional duct cleaning for residential central AC system',
			image: '/api/placeholder/400/300',
			details: [
				'Complete duct system inspection',
				'Professional cleaning equipment',
				'Sanitization process',
				'Filter replacement',
				'Air quality improvement',
				'System efficiency restored'
			]
		},
		{
			id: '8',
			title: 'Whirlpool Fridge Motor Replacement',
			category: 'refrigerator',
			location: 'Adoor',
			date: '2023-12-25',
			description: 'Evaporator fan motor replacement for double door refrigerator',
			image: '/api/placeholder/400/300',
			details: [
				'Genuine Whirlpool motor',
				'Complete disassembly required',
				'Electrical wiring update',
				'Temperature sensor check',
				'Performance testing',
				'Extended warranty provided'
			]
		},
		{
			id: '9',
			title: 'Bulk Parts Supply - Service Center',
			category: 'parts',
			location: 'Pathanamthitta',
			date: '2023-12-20',
			description: 'Monthly parts supply to local appliance service center',
			image: '/api/placeholder/400/300',
			details: [
				'50+ assorted spare parts',
				'Compressors and thermostats',
				'Door seals and gaskets',
				'PCB boards and controls',
				'Bulk discount applied',
				'Next-day delivery service'
			]
		}
	]

	const filteredItems = selectedCategory === 'all' 
		? portfolioItems 
		: portfolioItems.filter(item => item.category === selectedCategory)

	const openLightbox = (item: PortfolioItem) => {
		setSelectedItem(item)
		setLightboxOpen(true)
		document.body.style.overflow = 'hidden'
	}

	const closeLightbox = () => {
		setLightboxOpen(false)
		setSelectedItem(null)
		document.body.style.overflow = 'unset'
	}

	const getCategoryIcon = (category: string) => {
		switch (category) {
			case 'ac': return <Snowflake className="h-4 w-4" />
			case 'refrigerator': return <Wrench className="h-4 w-4" />
			case 'parts': return <ShoppingCart className="h-4 w-4" />
			case 'electronics': return <Recycle className="h-4 w-4" />
			default: return <Filter className="h-4 w-4" />
		}
	}

	return (
		<main>
			{/* Hero Section */}
			<section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-16">
				<div className="mx-auto max-w-6xl px-4">
					<div className="text-center">
						<h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-6">
							Our Portfolio
						</h1>
						<p className="text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
							Showcasing our expertise in AC repair, refrigerator service, parts supply, and electronics. 
							Over 1000+ successful projects across Thiruvalla & Pathanamthitta.
						</p>
					</div>
				</div>
			</section>

			{/* Filter Buttons */}
			<section className="py-8 bg-neutral-50 sticky top-20 z-40 border-b">
				<div className="mx-auto max-w-6xl px-4">
					<div className="flex flex-wrap justify-center gap-2 md:gap-4">
						{categories.map((category) => (
							<button
								key={category.id}
								onClick={() => setSelectedCategory(category.id)}
								className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
									selectedCategory === category.id
										? 'bg-primary-600 text-white shadow-lg'
										: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
								}`}
							>
								{category.icon}
								<span className="hidden sm:inline">{category.name}</span>
								<span className="sm:hidden">{category.name.split(' ')[0]}</span>
							</button>
						))}
					</div>
					<div className="text-center mt-4">
						<p className="text-neutral-600">
							Showing {filteredItems.length} of {portfolioItems.length} projects
						</p>
					</div>
				</div>
			</section>

			{/* Portfolio Grid */}
			<section className="py-16 bg-neutral-50">
				<div className="mx-auto max-w-6xl px-4">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{filteredItems.map((item) => (
							<div 
								key={item.id} 
								className="card overflow-hidden group cursor-pointer hover:scale-105 transition-transform duration-200"
								onClick={() => openLightbox(item)}
							>
								{/* Image placeholder */}
								<div className="aspect-[4/3] bg-gradient-to-br from-neutral-100 to-neutral-200 relative overflow-hidden">
									<div className="absolute inset-0 flex items-center justify-center">
										<div className="text-center">
											<div className="mx-auto h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center mb-3">
												{getCategoryIcon(item.category)}
											</div>
											<p className="text-neutral-600 font-medium">Project Image</p>
										</div>
									</div>
									{/* Overlay on hover */}
									<div className="absolute inset-0 bg-primary-600 bg-opacity-0 group-hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center">
										<p className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
											Click to view details
										</p>
									</div>
								</div>

								{/* Content */}
								<div className="p-6">
									<div className="flex items-center justify-between mb-2">
										<span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
											{getCategoryIcon(item.category)}
											{categories.find(c => c.id === item.category)?.name}
										</span>
										<span className="text-xs text-neutral-500 flex items-center gap-1">
											<Calendar className="h-3 w-3" />
											{new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
										</span>
									</div>
									
									<h3 className="font-semibold text-neutral-800 mb-2 line-clamp-2">
										{item.title}
									</h3>
									
									<p className="text-neutral-600 text-sm mb-3 line-clamp-2">
										{item.description}
									</p>
									
									<div className="flex items-center justify-between">
										<span className="text-xs text-neutral-500 flex items-center gap-1">
											<MapPin className="h-3 w-3" />
											{item.location}
										</span>
										<span className="text-primary-600 text-sm font-medium">
											View Details →
										</span>
									</div>
								</div>
							</div>
						))}
					</div>

					{filteredItems.length === 0 && (
						<div className="text-center py-12">
							<div className="mx-auto h-24 w-24 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
								<Filter className="h-12 w-12 text-neutral-400" />
							</div>
							<h3 className="text-lg font-medium text-neutral-800 mb-2">No projects found</h3>
							<p className="text-neutral-600">Try selecting a different category</p>
						</div>
					)}
				</div>
			</section>

			{/* Load More Button */}
			<section className="py-8 bg-neutral-50 text-center">
				<div className="mx-auto max-w-6xl px-4">
					<p className="text-neutral-600 mb-6">
						These are just a few examples of our recent work. We complete 50+ projects every month!
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						<a 
							href={`tel:${PHONE}`} 
							className="btn-primary inline-flex items-center gap-2"
						>
							<Phone size={20} />
							Call for Your Project
						</a>
						<a 
							href={`https://wa.me/${WHATSAPP}?text=Hi, I saw your portfolio and would like to discuss my project`}
							className="btn-secondary inline-flex items-center gap-2"
							target="_blank"
							rel="noopener noreferrer"
						>
							<MessageCircle size={20} />
							WhatsApp Us
						</a>
					</div>
				</div>
			</section>

			{/* Lightbox Modal */}
			{lightboxOpen && selectedItem && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90">
					<div className="bg-neutral-50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
						{/* Modal Header */}
						<div className="flex items-center justify-between p-6 border-b">
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
									{getCategoryIcon(selectedItem.category)}
								</div>
								<div>
									<h2 className="text-xl font-semibold text-neutral-800">
										{selectedItem.title}
									</h2>
									<div className="flex items-center gap-4 text-sm text-neutral-600">
										<span className="flex items-center gap-1">
											<MapPin className="h-3 w-3" />
											{selectedItem.location}
										</span>
										<span className="flex items-center gap-1">
											<Calendar className="h-3 w-3" />
											{new Date(selectedItem.date).toLocaleDateString()}
										</span>
									</div>
								</div>
							</div>
							<button
								onClick={closeLightbox}
								className="p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
								aria-label="Close modal"
							>
								<X className="h-6 w-6" />
							</button>
						</div>

						{/* Modal Content */}
						<div className="p-6">
							{/* Image */}
							<div className="aspect-[16/9] bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg mb-6 flex items-center justify-center">
								<div className="text-center">
									<div className="mx-auto h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center mb-4">
										{getCategoryIcon(selectedItem.category)}
									</div>
									<p className="text-neutral-600 font-medium">Project Image</p>
									<p className="text-sm text-neutral-500 mt-2">High-quality work documentation</p>
								</div>
							</div>

							{/* Description */}
							<div className="mb-6">
								<h3 className="font-semibold text-neutral-800 mb-3">Project Description</h3>
								<p className="text-neutral-600 leading-relaxed">{selectedItem.description}</p>
							</div>

							{/* Project Details */}
							<div className="mb-6">
								<h3 className="font-semibold text-neutral-800 mb-3">Work Details</h3>
								<ul className="space-y-2">
									{selectedItem.details.map((detail, index) => (
										<li key={index} className="flex items-start gap-2 text-neutral-600">
											<div className="h-1.5 w-1.5 rounded-full bg-primary-600 mt-2 flex-shrink-0"></div>
											{detail}
										</li>
									))}
								</ul>
							</div>

							{/* CTA */}
							<div className="flex flex-wrap gap-4 pt-4 border-t">
								<a 
									href={`tel:${PHONE}`} 
									className="btn-primary inline-flex items-center gap-2"
								>
									<Phone size={18} />
									Call for Similar Service
								</a>
								<a 
									href={`https://wa.me/${WHATSAPP}?text=Hi, I saw your ${selectedItem.title} project. I need similar service.`}
									className="btn-secondary inline-flex items-center gap-2"
									target="_blank"
									rel="noopener noreferrer"
								>
									<MessageCircle size={18} />
									WhatsApp About This
								</a>
								<Link href={typeof window !== 'undefined' && window.location.pathname.startsWith('/ml') ? '/ml/contact' : '/contact'} className="btn-accent">
									Get Detailed Quote
								</Link>
							</div>
						</div>
					</div>
				</div>
			)}
		</main>
	)
}