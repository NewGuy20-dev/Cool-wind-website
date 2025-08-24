/** @type {import('next').NextConfig} */
const nextConfig = {
	headers: async () => [
		{
			source: '/(.*)',
			headers: [
				{ key: 'X-Frame-Options', value: 'DENY' },
				{ key: 'X-Content-Type-Options', value: 'nosniff' },
				{ key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://translate.google.com https://translate.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://www.google-analytics.com https://translate.googleapis.com https://translate.google.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://www.google-analytics.com https://translate.googleapis.com https://translate.google.com; frame-src 'self' https://translate.google.com;" },
			],
		},
	],
}

export default nextConfig