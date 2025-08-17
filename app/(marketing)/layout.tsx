import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Cool Wind Services',
	description: 'AC & Refrigerator spare parts and repairs in Thiruvalla & Pathanamthitta.',
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
	return children
}