'use client'

import { MessageCircle, Phone, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { analytics } from '@/lib/analytics'
import ChatWidget from './ChatWidget'

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
			{/* Desktop Floating CTAs - Positioned above chat widget */}
			<div className="hidden md:flex fixed bottom-20 right-6 z-40 flex-col gap-3">
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

			{/* Chat Support Widget - Replaces Get Quote and WhatsApp */}
			<ChatWidget isVisible={isVisible} />

			{/* Mobile Sticky Bottom Bar */}
			<div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-50 border-t border-neutral-200 shadow-lg no-print">
				<div className="flex items-center">
					{/* Chat Support Button */}
					<a
						href={`https://wa.me/${WHATSAPP}?text=Hi, I need help with my appliance`}
						onClick={() => analytics.chatInteraction('mobile_chat')}
						className="flex-1 flex items-center justify-center gap-1 py-4 px-2 bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors duration-200"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Chat support"
					>
						<MessageCircle size={16} />
						<span className="text-xs">Chat</span>
					</a>

					{/* Get Quote Button */}
					<Link
						href="/contact"
						onClick={() => analytics.quoteRequestClick('mobile_quote')}
						className="flex-1 flex items-center justify-center gap-1 py-4 px-2 bg-secondary-600 text-neutral-900 font-medium hover:bg-secondary-700 transition-colors duration-200"
						aria-label="Get detailed quote"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						<span className="text-xs">Quote</span>
					</Link>
					
					{/* Call Button */}
					<a
						href={`tel:${PHONE}`}
						onClick={() => analytics.phoneCallClick('mobile_sticky')}
						className="flex-1 flex items-center justify-center gap-1 py-4 px-2 bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors duration-200"
						aria-label={`Call us at ${PHONE}`}
					>
						<Phone size={18} />
						<span className="text-xs">Call Now</span>
					</a>
				</div>

				{/* Emergency indicator */}
				<div className="bg-secondary-100 px-4 py-2 text-center">
					<p className="text-xs text-secondary-800">
						🚨 Emergency service available
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