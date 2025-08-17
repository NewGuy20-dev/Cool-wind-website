export const metadata = {
	title: 'About Us | Cool Wind Services',
	description: 'Our story, mission, certifications, and why choose us.',
}

export default function AboutPage() {
	return (
		<main className="mx-auto max-w-6xl px-4 py-10">
			<h1 className="text-3xl font-bold">About Cool Wind Services</h1>
			<p className="mt-4 text-neutral-medium">Founded in 2009, serving Thiruvalla & Pathanamthitta with a mission to deliver genuine parts and reliable service.</p>
			<div className="mt-8 grid gap-6 sm:grid-cols-2">
				<div className="rounded border p-5 bg-white">
					<h2 className="text-xl font-semibold">Why Choose Us</h2>
					<ul className="mt-3 list-disc pl-5 text-neutral-medium">
						<li>15+ years of experience</li>
						<li>Genuine parts with warranty</li>
						<li>Local expertise and quick response</li>
						<li>Fair, transparent pricing</li>
					</ul>
				</div>
				<div className="rounded border p-5 bg-white">
					<h2 className="text-xl font-semibold">Service Area</h2>
					<p className="mt-2 text-neutral-medium">Thiruvalla & Pathanamthitta districts</p>
					<div className="mt-3 aspect-[4/3] rounded bg-neutral-light"/>
				</div>
			</div>
		</main>
	)
}