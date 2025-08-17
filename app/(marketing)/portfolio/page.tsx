'use client'

import { useMemo, useState } from 'react'
import data from '@/data/portfolio.json'

type Category = 'all' | 'ac_repair' | 'refrigerator' | 'installations' | 'commercial'

export default function PortfolioPage() {
	const [cat, setCat] = useState<Category>('all')
	const filters: {label: string; value: Category}[] = [
		{ label: 'All', value: 'all' },
		{ label: 'AC Repair', value: 'ac_repair' },
		{ label: 'Refrigerator', value: 'refrigerator' },
		{ label: 'Installations', value: 'installations' },
		{ label: 'Commercial', value: 'commercial' },
	]
	const projects = (data.projects || [])
	const filtered = useMemo(() => cat === 'all' ? projects : projects.filter(p => p.category === cat), [cat, projects])
	const [lightbox, setLightbox] = useState<string|null>(null)

	return (
		<main className="mx-auto max-w-6xl px-4 py-10">
			<h1 className="text-3xl font-bold">Portfolio</h1>
			<div className="mt-4 flex flex-wrap gap-2">
				{filters.map((f) => (
					<button key={f.value} onClick={() => setCat(f.value)} className={`rounded border px-3 py-1 text-sm ${cat === f.value ? 'bg-brand-blue text-white' : ''}`}>{f.label}</button>
				))}
			</div>
			<div className="mt-6 columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]"><div className="contents">
				{filtered.map((p) => (
					<div key={p.id} className="mb-4 break-inside-avoid rounded border bg-white p-2">
						<div className="aspect-[4/3] w-full rounded bg-neutral-light cursor-zoom-in" onClick={() => setLightbox(p.images?.[0] || '')}/>
						<div className="p-2">
							<p className="text-sm font-semibold">{p.title}</p>
							<p className="text-xs text-neutral-medium">{p.location} • {p.date}</p>
						</div>
					</div>
				))}
			</div></div>
			{lightbox && (
				<dialog open className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setLightbox(null)}>
					<div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
						<div className="aspect-[4/3] w-full rounded bg-neutral-light"/>
						<button className="mt-3 rounded bg-white px-4 py-2" onClick={() => setLightbox(null)}>Close</button>
					</div>
				</dialog>
			)}
		</main>
	)
}