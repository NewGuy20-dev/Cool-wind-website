export const metadata = {
	title: 'Testimonials | Customer Reviews',
	description: 'What customers say about our spare parts and repair services.',
}

export default function TestimonialsPage() {
	const filters = ['All', 'Spare Parts', 'AC Servicing', 'Refrigerator Servicing']
	return (
		<main className="mx-auto max-w-6xl px-4 py-10">
			<h1 className="text-3xl font-bold">Testimonials</h1>
			<div className="mt-4 flex flex-wrap gap-2">
				{filters.map((f) => (
					<button key={f} className="rounded border px-3 py-1 text-sm">{f}</button>
				))}
			</div>
			<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<article key={i} className="rounded border bg-white p-5">
						<div className="flex items-center gap-2 text-yellow-500">★★★★★</div>
						<p className="mt-2 text-neutral-medium">“Excellent service and genuine parts. Highly recommend.”</p>
						<p className="mt-2 text-sm text-neutral-medium">— John, Thiruvalla</p>
					</article>
				))}
			</div>
			<a href="#" className="mt-6 inline-block text-brand-blue">Add Your Review →</a>
		</main>
	)
}