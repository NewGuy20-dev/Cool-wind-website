import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
	const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
	
	// Main pages with locales
	const mainPaths = ['', '/services', '/portfolio', '/about', '/contact', '/testimonials', '/privacy']
	
	// Service-specific pages for better local SEO
	const servicePaths = [
		'/services/ac-repair-thiruvalla',
		'/services/refrigerator-service-kerala', 
		'/services/appliance-repair-pathanamthitta',
		'/services/ac-installation',
		'/services/refrigerator-repair',
		'/services/spare-parts',
		'/services/second-hand-electronics'
	]
	
	// Location-specific pages
	const locationPaths = [
		'/locations/thiruvalla',
		'/locations/pathanamthitta',
		'/locations/kerala'
	]
	
	const items: MetadataRoute.Sitemap = []
	
	// Add main pages
	for (const path of mainPaths) {
		const priority = path === '' ? 1.0 : path === '/services' ? 0.9 : 0.8
		const changeFreq = path === '' ? 'daily' : path === '/services' ? 'weekly' : 'monthly'
		
		items.push({
			url: `${base}${path}`,
			lastModified: new Date(),
			changeFrequency: changeFreq as 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
			priority: priority,
			alternates: { 
				languages: { 
					en: `${base}${path}`, 
					ml: `${base}/ml${path}` 
				} 
			},
		})
		
		// Add Malayalam versions
		if (path !== '') {
			items.push({ 
				url: `${base}/ml${path}`, 
				lastModified: new Date(),
				changeFrequency: changeFreq as 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
				priority: priority * 0.9,
				alternates: { 
					languages: { 
						en: `${base}${path}`, 
						ml: `${base}/ml${path}` 
					} 
				}
			})
		}
	}
	
	// Add service-specific pages for local SEO
	for (const path of servicePaths) {
		items.push({
			url: `${base}${path}`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.8,
			alternates: { 
				languages: { 
					en: `${base}${path}`, 
					ml: `${base}/ml${path}` 
				} 
			}
		})
		
		// Add Malayalam versions
		items.push({
			url: `${base}/ml${path}`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.7
		})
	}
	
	// Add location-specific pages
	for (const path of locationPaths) {
		items.push({
			url: `${base}${path}`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.7,
			alternates: { 
				languages: { 
					en: `${base}${path}`, 
					ml: `${base}/ml${path}` 
				} 
			}
		})
		
		// Add Malayalam versions  
		items.push({
			url: `${base}/ml${path}`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.6
		})
	}
	
	return items
}