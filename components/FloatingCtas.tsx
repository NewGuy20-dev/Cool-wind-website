'use client'

import { MessageCircle, Phone, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { analytics } from '@/lib/analytics'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918547229991'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+918547229991'

export default function FloatingCtas() {
	const [isVisible, setIsVisible] = useState(false)
	const [isExpanded, setIsExpanded] = useState(false)

	useEffect(() => {
		const handleScroll = () => {
			// Show floating CTAs after scrolling down 100px
			setIsVisible(window.scrollY > 100)
		}

		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	if (!isVisible) return null

	return (
		<>
			{/* Desktop Floating CTAs */}
			<div className="hidden md:flex fixed bottom-6 right-6 z-50 flex-col gap-3">
				<a
					href={`https://wa.me/${WHATSAPP}?text=Hi, I need help with my appliance`}
					onClick={() => analytics.whatsappClick()}
					className="group inline-flex items-center gap-3 rounded-full bg-secondary-600 px-4 py-3 text-white shadow-lg hover:bg-secondary-700 hover:shadow-xl transition-all duration-200"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Contact us on WhatsApp"
				>
					<MessageCircle size={20} />
					<span className="hidden group-hover:block whitespace-nowrap">WhatsApp Us</span>
				</a>
				<a
					href={`tel:${PHONE}`}
					onClick={() => analytics.phoneCallClick('floating_call')}
					className="group inline-flex items-center gap-3 rounded-full bg-primary-600 px-4 py-3 text-white shadow-lg hover:bg-primary-700 hover:shadow-xl transition-all duration-200"
					aria-label={`Call us at ${PHONE}`}
				>
					<Phone size={20} />
					<span className="hidden group-hover:block whitespace-nowrap">Call Now</span>
				</a>
			</div>

			{/* Mobile Sticky Bottom Bar */}
			<div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 shadow-lg no-print">
				<div className="flex items-center">
					{/* WhatsApp Button */}
					<a
						href={`https://wa.me/${WHATSAPP}?text=Hi, I need help with my appliance`}
						onClick={() => analytics.whatsappClick()}
						className="flex-1 flex items-center justify-center gap-2 py-4 px-3 bg-secondary-600 text-white font-medium hover:bg-secondary-700 transition-colors duration-200"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Contact us on WhatsApp"
					>
						<MessageCircle size={20} />
						<span className="text-sm">WhatsApp</span>
					</a>
					
					{/* Call Button */}
					<a
						href={`tel:${PHONE}`}
						onClick={() => analytics.phoneCallClick('mobile_sticky')}
						className="flex-1 flex items-center justify-center gap-2 py-4 px-3 bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors duration-200"
						aria-label={`Call us at ${PHONE}`}
					>
						<Phone size={20} />
						<span className="text-sm">Call Now</span>
					</a>
				</div>

				{/* Emergency indicator */}
				<div className="bg-accent-50 px-4 py-2 text-center">
					<p className="text-xs text-accent-800">
						🚨 Emergency service available 24/7
					</p>
				</div>
			</div>

			{/* Add padding to body on mobile to account for sticky bar */}
			<style jsx global>{`
				@media (max-width: 768px) {
					body {
						padding-bottom: 100px;
					}
				}
			`}</style>
		</>
	)
}