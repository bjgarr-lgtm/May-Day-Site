import React from 'react'
import { Link } from 'react-router-dom'
import { Map, Trophy } from 'lucide-react'
import PageShell from '../components/mayday/PageShell'
import { huntRoutes } from '../data/huntData'
import { getRouteCompletionCount, getTotalCompletionCount } from '../lib/huntProgress'

export default function HuntHome() {
  const totalComplete = getTotalCompletionCount()
  const totalStops = huntRoutes.reduce((sum, route) => sum + route.stops.length, 0)

  return (
    <PageShell
      eyebrow="scavenger hunt"
      title="choose a route"
      body="This is the first real hunt structure pass. It gives you route pages, stop pages, and local progress tracking in the browser so people can move through the hunt without getting dumped into a pile of unrelated tools."
    >
      <div className="mb-8 rounded-[2rem] border border-[#f2c4cf]/20 bg-black/20 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f2c4cf]/20 bg-[#f2c4cf]/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.16em] text-[#f7f1e8]">
            <Trophy className="h-4 w-4 text-[#f2c4cf]" />
            {totalComplete} of {totalStops} stops complete
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f2c4cf]/20 bg-[#0c1914]/80 px-4 py-2 text-sm font-semibold text-[#f7f1e8]/84">
            <Map className="h-4 w-4 text-[#f2c4cf]" />
            start anywhere or roam between routes
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {huntRoutes.map((route) => {
          const complete = getRouteCompletionCount(route.slug)
          return (
            <div key={route.slug} className="rounded-[2rem] border border-[#f2c4cf]/20 bg-[#11261e] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[#f2c4cf]/80">{route.stops.length} stops</p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#f7f1e8]">{route.title}</h2>
              <p className="mt-3 leading-7 text-[#f7f1e8]/78">{route.intro}</p>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#f2c4cf]">
                {complete} complete
              </p>
              <div className="mt-5 space-y-3">
                {route.stops.map((stop, index) => (
                  <Link
                    key={stop.id}
                    to={`/hunt/${route.slug}/${stop.id}`}
                    className="block rounded-2xl border border-[#f2c4cf]/15 bg-black/15 px-4 py-3 text-sm font-semibold text-[#f7f1e8]/88 transition hover:border-[#f2c4cf]/35 hover:bg-[#f2c4cf]/10"
                  >
                    stop {index + 1} · {stop.title}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </PageShell>
  )
}
