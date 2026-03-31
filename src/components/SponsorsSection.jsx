
import React from 'react'

const sponsors2026 = [
  { name: 'Historical Seaport' },
  { name: 'Blackflower Collective' },
]

const sponsors2025 = [
  'Historical Seaport',
  'Blackflower Collective',
  'Go Grays Harbor - Jodesha Broadcasting',
  'Tokeland Hotel',
]

export default function SponsorsSection() {
  return (
    <section className="border-t border-[#e3a7a5]/10 bg-black/20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/80">
            2026 sponsors
          </p>
          <h2 className="mt-2 text-3xl font-black uppercase text-[#f7f1e8]">
            supporting this year
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {sponsors2026.map((s) => (
              <div
                key={s.name}
                className="rounded-xl border border-[#e3a7a5]/20 bg-[#183126]/70 px-5 py-4 text-center text-lg font-bold text-[#e3a7a5]"
              >
                {s.name}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/60">
            2025 sponsors
          </p>
          <p className="mt-3 text-sm text-[#f7f1e8]/60">
            {sponsors2025.join(' · ')}
          </p>
        </div>

      </div>
    </section>
  )
}
