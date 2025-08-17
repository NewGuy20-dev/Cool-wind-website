export default function Footer() {
	return (
		<footer className="border-t bg-white">
			<div className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-medium">
				<div className="grid gap-6 sm:grid-cols-3">
					<div>
						<p className="font-semibold text-neutral-dark">Cool Wind Services</p>
						<p>Thiruvalla, Pathanamthitta, Kerala</p>
					</div>
					<div>
						<p className="font-semibold text-neutral-dark">Hours</p>
						<p>Mon–Sat 08:00–20:00</p>
					</div>
					<div>
						<p className="font-semibold text-neutral-dark">Service Areas</p>
						<p>Thiruvalla • Pathanamthitta</p>
					</div>
				</div>
				<p className="mt-6">© {new Date().getFullYear()} Cool Wind Services</p>
			</div>
		</footer>
	)
}