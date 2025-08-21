import type { Config } from 'tailwindcss'

const config: Config = {
	content: [
		'./app/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
	],
	theme: {
		extend: {
			colors: {
				// Updated brand palette
				primary: {
					50: '#e9f3f8', // lightest tint of Sky Blue #71B5D1
					100: '#d3e7f0',
					200: '#b1d6e4', // Light Cyan-Blue for subtle fills
					300: '#8ec6da',
					400: '#71b5d1', // Sky Blue
					500: '#5aa2bf',
					600: '#4a8da8',
					700: '#3a748a',
					800: '#2e5c6f',
					900: '#244a59',
				},
				secondary: {
					50: '#fbfcea',
					100: '#f6f8c7',
					200: '#eaebac', // Soft Pale Yellow
					300: '#e2e77f',
					400: '#dfdf63', // Yellow-Green accent
					500: '#caca52',
					600: '#acaa3f',
					700: '#8a8733',
					800: '#6c6a2a',
					900: '#585623',
				},
				accent: {
					50: '#f9faf9', // Off-white variants aligned with brand
					100: '#f3f5f3', // Off White for cards/backgrounds
					200: '#e7ece8',
					300: '#d7e0dc',
					400: '#c7d3cf',
					500: '#b6c6c2',
					600: '#9aa9a5',
					700: '#7c8986',
					800: '#606d6a',
					900: '#4e5956',
				},
				neutral: {
					50: '#f3f5f3', // Off White background
					100: '#eef1ef',
					200: '#e1e6e3',
					300: '#cdd5d1',
					400: '#a7b2ad',
					500: '#6e7673',
					600: '#4e5451',
					700: '#363a38',
					800: '#262927',
					900: '#1a1a1a', // Dark Gray text
				},
				// Legacy brand colors retained for compatibility
				brand: {
					blue: '#71b5d1',
					orange: '#dfdf63',
					green: '#b1d6e4',
					yellow: '#eaebac',
				},
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
			},
			minHeight: {
				'44': '11rem',
			},
			boxShadow: {
				'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
				'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
			},
		},
	},
	plugins: [],
}

export default config