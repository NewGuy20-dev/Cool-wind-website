/** @type {import('next').NextConfig} */
const nextConfig = {
	// Performance optimizations
	experimental: {
		optimizePackageImports: ['lucide-react', 'framer-motion'],
	},
	
	// Image optimization
	images: {
		formats: ['image/webp', 'image/avif'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
		dangerouslyAllowSVG: true,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},
	
	// Compression
	compress: true,
	
	// Cache optimizations
	onDemandEntries: {
		maxInactiveAge: 25 * 1000,
		pagesBufferLength: 2,
	},
	
	// PWA and SEO optimizations
	generateEtags: true,
	poweredByHeader: false,
	
	// Redirect optimizations for SEO
	async redirects() {
		return [
			{
				source: '/ac-repair',
				destination: '/services/ac-repair-thiruvalla',
				permanent: true,
			},
			{
				source: '/refrigerator-repair',
				destination: '/services/refrigerator-service-kerala',
				permanent: true,
			},
			{
				source: '/appliance-repair',
				destination: '/services/appliance-repair-pathanamthitta',
				permanent: true,
			}
		]
	},

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
					// Security headers
					{ key: 'X-Frame-Options', value: 'DENY' },
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
					{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
					{ key: 'Content-Security-Policy', value: csp },
					
					// Performance headers
					{ key: 'X-DNS-Prefetch-Control', value: 'on' },
					
					// SEO headers
					{ key: 'X-Robots-Tag', value: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
				],
			},
			{
				source: '/sitemap.xml',
				headers: [
					{ key: 'Content-Type', value: 'application/xml' },
					{ key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
				],
			},
			{
				source: '/robots.txt',
				headers: [
					{ key: 'Content-Type', value: 'text/plain' },
					{ key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
				],
			},
			{
				source: '/_next/static/(.*)',
				headers: [
					{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
				],
			},
			{
				source: '/images/(.*)',
				headers: [
					{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
				],
			},
			{
				source: '/logo.png',
				headers: [
					{ key: 'Cache-Control', value: 'public, max-age=31536000' },
				],
			}
		]
	},
}

export default nextConfig