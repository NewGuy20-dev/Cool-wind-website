import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
	const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
	const paths = ['', '/services', '/portfolio', '/about', '/contact', '/testimonials', '/privacy']
	const items: MetadataRoute.Sitemap = []
	for (const p of paths) {
		items.push({
			url: `${base}${p}`,
			changeFrequency: 'weekly',
			priority: p === '' ? 1 : 0.8,
			alternates: { languages: { en: `${base}${p}`, ml: `${base}/ml${p}` } },
		})
		if (p !== '') {
			items.push({ url: `${base}/ml${p}`, changeFrequency: 'weekly', priority: 0.8 })
		}
	}
	return items
}