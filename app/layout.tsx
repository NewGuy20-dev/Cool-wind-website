import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
	title: 'Cool Wind Services | AC & Refrigerator Spare Parts, Repairs in Thiruvalla',
	description:
		'Genuine AC & refrigerator spare parts and expert servicing in Thiruvalla & Pathanamthitta. Same-day parts delivery. Call +91 85472 29991.',
	metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
	alternates: { languages: { en: '/', ml: '/ml' } },
	icons: {
		icon: [
			{ url: '/logo.png', type: 'image/png' },
		],
		apple: [{ url: '/logo.png' }],
		shortcut: ['/logo.png'],
	},
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="min-h-screen antialiased">
				{children}
			</body>
		</html>
	)
}