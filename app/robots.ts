import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
	const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
	
	return {
		rules: [
			{
				userAgent: '*',
				allow: [
					'/',
					'/services/',
					'/portfolio/',
					'/about/',
					'/contact/',
					'/testimonials/',
					'/privacy/',
					'/locations/',
					'/ml/',
					'/*.png',
					'/*.jpg',
					'/*.jpeg',
					'/*.webp',
					'/*.svg'
				],
				disallow: [
					'/api/',
					'/admin/',
					'/_next/',
					'/private/',
					'/temp/',
					'/*.json',
					'/test*'
				],
				crawlDelay: 1
			},
			{
				userAgent: 'Googlebot',
				allow: '/',
				disallow: [
					'/api/',
					'/admin/',
					'/private/'
				]
			},
			{
				userAgent: 'Bingbot',
				allow: '/',
				disallow: [
					'/api/',
					'/admin/',
					'/private/'
				],
				crawlDelay: 2
			}
		],
		sitemap: `${base}/sitemap.xml`,
		host: base
	}
}