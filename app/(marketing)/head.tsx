export default function Head() {
	const ld = {
		"@context": "https://schema.org",
		"@type": "LocalBusiness",
		name: "Cool Wind Services",
		description: "Leading supplier of AC and Refrigerator spare parts with expert servicing in Thiruvalla",
		telephone: "+91-85472-29991",
		address: {
			"@type": "PostalAddress",
			addressLocality: "Thiruvalla",
			addressRegion: "Kerala",
			addressCountry: "IN",
		},
		areaServed: ["Thiruvalla", "Pathanamthitta"],
		openingHours: "Mo-Sa 08:00-20:00",
		priceRange: "₹₹",
		hasOfferCatalog: {
			"@type": "OfferCatalog",
			name: "AC & Refrigerator Parts and Services",
			itemListElement: [
				{ "@type": "Offer", itemOffered: { "@type": "Product", name: "AC & Refrigerator Spare Parts", category: "Appliance Parts" } },
				{ "@type": "Offer", itemOffered: { "@type": "Service", name: "AC & Refrigerator Repair Service", category: "Appliance Repair" } },
			],
		},
	}
	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
		</>
	)
}