import type { Config } from 'tailwindcss'

export default {
	content: [
		'./app/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
	],
	theme: {
		extend: {
			colors: {
				brand: {
					blue: '#0066CC',
					orange: '#FF6B35',
					green: '#10B981',
					yellow: '#F59E0B',
				},
				neutral: {
					dark: '#1F2937',
					medium: '#6B7280',
					light: '#F3F4F6',
				},
			},
		},
	},
	plugins: [],
} satisfies Config