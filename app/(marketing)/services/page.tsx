import Link from 'next/link'

export const metadata = {
	title: 'Services | AC & Refrigerator Spare Parts & Servicing in Thiruvalla',
	description:
		'Primary focus on spare parts supply and expert servicing. Genuine parts, bulk orders, same-day delivery in Thiruvalla.',
}

export default function ServicesPage() {
	return (
		<main className="mx-auto max-w-6xl px-4 py-10">
			<h1 className="text-3xl font-bold">Our Services</h1>

			<section id="spare-parts" className="mt-8">
				<h2 className="text-2xl font-semibold">Spare Parts Supply</h2>
				<p className="mt-3 text-neutral-medium">
					We stock a comprehensive range of genuine refrigeration and AC spare parts designed for long-term reliability and performance. Our inventory covers critical components such as compressors, thermostats, filter driers, evaporator and condenser coils, control boards, relays, sensors, and door gaskets—sourced from trusted brands including Samsung, LG, Whirlpool, Voltas, Blue Star, and Godrej. Each part is backed by a genuine-parts guarantee with warranty support and the assurance that we never compromise on quality. For shops and service centers, we offer competitive bulk order pricing and scheduled procurement support to keep your operations running efficiently. Same-day delivery is available within Thiruvalla and next-day delivery to Pathanamthitta to minimize downtime. Not sure which part is correct for your model? Our technical support can help you identify the exact match using model numbers, provide compatibility guidance, and share best-practice installation tips. Whether you need a single replacement item or a recurring supply plan, we are your reliable local partner for fast, accurate, and dependable parts fulfillment.
				</p>
				<Link href="/contact?type=spare_parts" className="mt-4 inline-block rounded bg-brand-blue px-5 py-3 text-white">Request Parts Quote</Link>
			</section>

			<section id="ac-repair" className="mt-12">
				<h2 className="text-2xl font-semibold">AC & Refrigerator Servicing</h2>
				<p className="mt-3 text-neutral-medium">
					Our expert technicians diagnose and repair ACs and refrigerators across all major brands with a focus on safety, durability, and transparent pricing. We resolve common issues like poor cooling, abnormal noise, water leakage, electrical faults, and frequent tripping. Services include gas charging with leakage checks, deep cleaning of coils and filters, compressor and fan motor replacements, thermostat and control board repairs, and complete preventive maintenance. We only use genuine parts, ensuring optimal performance and longer equipment life. Emergency service is available 24/7 for urgent breakdowns, and we provide free diagnosis with confirmed repair booking. To protect your investment, every repair is backed by a 6‑month service warranty. If you manage multiple units for a shop or apartment, ask about our affordable annual maintenance plans that reduce breakdowns and energy costs while extending equipment life.
				</p>
				<Link href="/contact?type=service" className="mt-4 inline-block rounded bg-brand-blue px-5 py-3 text-white">Book Service Call</Link>
			</section>

			<section className="mt-12">
				<h2 className="text-2xl font-semibold">Sales</h2>
				<p className="mt-3 text-neutral-medium">We supply new and certified refurbished ACs and refrigerators with professional installation and warranty. Trade-in options available for upgrades and bulk purchase support for shops and commercial properties.</p>
			</section>

			<section className="mt-12">
				<h2 className="text-2xl font-semibold">Second-hand Electronics</h2>
				<p className="mt-3 text-neutral-medium">Quality-tested refurbished appliances with a 3-month warranty. Inventory changes frequently—contact us for current models and availability.</p>
			</section>
		</main>
	)
}