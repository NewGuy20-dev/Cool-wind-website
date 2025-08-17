'use client'

import Link from 'next/link'
import { Phone, MessageCircle } from 'lucide-react'
import { analytics } from '@/lib/analytics'
import ContactForm from '@/components/ContactForm'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918547229991'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'

export default function HomePage() {
	return (
		<main>
			<section className="bg-neutral-light">
				<div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
					<div className="grid gap-8 md:grid-cols-2 items-center">
						<div>
							<h1 className="text-4xl font-bold text-neutral-dark">Kerala's Leading AC & Refrigerator Spare Parts Supplier</h1>
							<p className="mt-4 text-lg text-neutral-medium">Genuine parts, expert servicing, 15+ years serving Thiruvalla & Pathanamthitta.</p>
							<div className="mt-6 flex flex-wrap gap-3">
								<Link href="#contact" onClick={() => analytics.partsInquiryClick()} className="inline-flex items-center gap-2 rounded-md bg-brand-blue px-5 py-3 text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-blue">Order Parts Now</Link>
								<Link href="#contact" onClick={() => analytics.serviceBookingClick()} className="inline-flex items-center gap-2 rounded-md border border-brand-blue px-5 py-3 text-brand-blue hover:bg-brand-blue/10">Emergency Service</Link>
								<a href={`tel:${PHONE}`} onClick={() => analytics.phoneCallClick()} className="inline-flex items-center gap-2 rounded-md border px-4 py-3"><Phone size={18}/> {PHONE}</a>
								<a aria-label="WhatsApp" onClick={() => analytics.whatsappClick()} href={`https://wa.me/${WHATSAPP}`} className="inline-flex items-center gap-2 rounded-full bg-green-500 text-white px-4 py-3"><MessageCircle size={18}/> WhatsApp</a>
							</div>
						</div>
						<div className="aspect-[4/3] rounded-lg bg-white shadow"></div>
					</div>
				</div>
			</section>

			<section className="mx-auto max-w-6xl px-4 py-12">
				<h2 className="text-2xl font-semibold">Our Services</h2>
				<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<div className="rounded-lg border p-5 shadow-sm bg-white">
						<h3 className="text-xl font-semibold">Spare Parts Supply</h3>
						<p className="mt-2 text-sm text-neutral-medium">Genuine Parts • Bulk Orders • Same Day Delivery</p>
						<Link className="mt-4 inline-block text-brand-blue" onClick={() => analytics.partsInquiryClick()} href="/services#spare-parts">Request Parts Quote →</Link>
					</div>
					<div className="rounded-lg border p-5 shadow-sm bg-white">
						<h3 className="text-xl font-semibold">AC & Refrigerator Servicing</h3>
						<p className="mt-2 text-sm text-neutral-medium">Expert Repairs • All Brands • Emergency Available</p>
						<Link className="mt-4 inline-block text-brand-blue" onClick={() => analytics.serviceBookingClick()} href="/services#ac-repair">Book Service Call →</Link>
					</div>
					<div className="rounded-lg border p-5 shadow-sm bg-white">
						<h3 className="text-xl font-semibold">AC & Refrigerator Sales</h3>
						<p className="mt-2 text-sm text-neutral-medium">New and refurbished units with installation</p>
					</div>
					<div className="rounded-lg border p-5 shadow-sm bg-white">
						<h3 className="text-xl font-semibold">Second-hand Electronics</h3>
						<p className="mt-2 text-sm text-neutral-medium">Quality-tested appliances with warranty</p>
					</div>
				</div>
			</section>

			<section className="bg-neutral-light">
				<div className="mx-auto max-w-6xl px-4 py-12">
					<h2 className="text-2xl font-semibold">Featured Projects</h2>
					<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<div className="rounded-lg border p-5 bg-white">Project 1</div>
						<div className="rounded-lg border p-5 bg-white">Project 2</div>
						<div className="rounded-lg border p-5 bg-white">Project 3</div>
					</div>
					<Link className="mt-6 inline-block text-brand-blue" href="/portfolio">View All Projects →</Link>
				</div>
			</section>

			<section className="mx-auto max-w-6xl px-4 py-12" id="contact">
				<h2 className="text-2xl font-semibold">Get in Touch</h2>
				<ContactForm compact/>
				<p className="mt-4 text-sm text-neutral-medium">Serving Thiruvalla & Pathanamthitta • 08:00–20:00 Mon–Sat</p>
			</section>
		</main>
	)
}