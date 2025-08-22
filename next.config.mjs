/** @type {import('next').NextConfig} */
const nextConfig = {
	headers: async () => {
		const isDev = process.env.NODE_ENV !== 'production'

		const scriptSrc = [
			"'self'",
			"'unsafe-inline'",
			'https://www.googletagmanager.com',
			'https://www.google-analytics.com',
			'https://translate.google.com',
			'https://translate.googleapis.com',
			'https://translate-pa.googleapis.com',
			isDev ? "'unsafe-eval'" : null, // needed for Next.js React Refresh in dev
		]
			.filter(Boolean)
			.join(' ')

		const connectSrc = [
			"'self'",
			'https://www.google-analytics.com',
			'https://translate.googleapis.com',
			'https://translate.google.com',
			'https://translate-pa.googleapis.com',
			isDev ? 'ws:' : null, // allow HMR websocket in dev
			isDev ? 'http://localhost:*' : null,
		]
			.filter(Boolean)
			.join(' ')

		const imgSrc = [
			"'self'",
			'data:',
			'https://www.google-analytics.com',
			'https://translate.googleapis.com',
			'https://translate.google.com',
			'https://fonts.gstatic.com',
			'https://www.gstatic.com',
			'https://www.google.com',
		].join(' ')

		const csp = [
			`default-src 'self'`,
			`script-src ${scriptSrc}`,
			"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com",
			`img-src ${imgSrc}`,
			"font-src 'self' https://fonts.gstatic.com",
			`connect-src ${connectSrc}`,
			"frame-src 'self' https://translate.google.com",
		].join('; ') + ';'

		return [
			{
				source: '/(.*)',
				headers: [
					{ key: 'X-Frame-Options', value: 'DENY' },
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					{ key: 'Content-Security-Policy', value: csp },
				],
			},
		]
	},
}

export default nextConfig