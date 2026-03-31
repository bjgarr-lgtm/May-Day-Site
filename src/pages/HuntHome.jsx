import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Compass, MapPinned, QrCode, Trophy } from 'lucide-react'
import { huntRoutes } from '../data/huntData'
import { getRouteCompletionCount, getTotalCompletionCount } from '../lib/huntProgress'

function ProgressBar({ value, max }) {
  const ratio = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
        <span>overall progress</span>
        <span>{value}/{max}</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full border border-[#e3a7a5]/15 bg-black/25">
        <div
          className="h-full rounded-full bg-[#e3a7a5] transition-all"
          style={{ width: `${ratio}%` }}
        />
      </div>
    </div>
  )
}

function RouteCard({ route }) {
  const complete = getRouteCompletionCount(route.slug)
  const total = route.stops.length

  return (
    <div className="rounded-[1.75rem] border border-[#e3a7a5]/18 bg-black/20 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/72">route</p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#f7f1e8]">
            {route.title}
          </h2>
        </div>
        <div className="rounded-full border border-[#e3a7a5]/18 bg-[#e3a7a5]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#f7f1e8]">
          {complete}/{total}
        </div>
      </div>

      <p className="mt-3 text-sm leading-7 text-[#f7f1e8]/78">{route.intro}</p>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-black/25">
        <div
          className="h-full rounded-full bg-[#e3a7a5] transition-all"
          style={{ width: `${total > 0 ? (complete / total) * 100 : 0}%` }}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          to={`/hunt/${route.slug}/${route.stops[0]?.id || ''}`}
          className="inline-flex min-h-11 items-center rounded-full bg-[#e3a7a5] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#264636] transition hover:bg-[#efbbb9]"
        >
          enter route
        </Link>
        <span className="inline-flex min-h-11 items-center rounded-full border border-[#e3a7a5]/18 bg-black/20 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8]">
          {total} stops
        </span>
      </div>
    </div>
  )
}

export default function HuntHome() {
  const totalStops = huntRoutes.reduce((sum, route) => sum + route.stops.length, 0)
  const totalComplete = getTotalCompletionCount()

  return (
    <div className="min-h-screen bg-[#264636] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center rounded-full border border-[#e3a7a5]/20 bg-black/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            back to may day
          </Link>
        </div>

        <section className="rounded-[2rem] border border-[#e3a7a5]/18 bg-black/20 p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/80">scavenger hunt</p>
              <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#e3a7a5] sm:text-5xl">
                start at the welcome center
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#f7f1e8]/84">
                Scan the intro code at the welcome center if you are on site. Or start exploring routes manually here if you are browsing first and getting your bearings.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.25rem] border border-[#e3a7a5]/18 bg-black/20 p-4">
                  <Compass className="h-5 w-5 text-[#e3a7a5]" />
                  <p className="mt-3 text-sm font-black uppercase tracking-[0.12em] text-[#f7f1e8]">
                    choose a route
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#f7f1e8]/72">
                    Pick activities, vendors, or indoors.
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-[#e3a7a5]/18 bg-black/20 p-4">
                  <QrCode className="h-5 w-5 text-[#e3a7a5]" />
                  <p className="mt-3 text-sm font-black uppercase tracking-[0.12em] text-[#f7f1e8]">
                    find clues in the world
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#f7f1e8]/72">
                    Some stops only fully work on site.
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-[#e3a7a5]/18 bg-black/20 p-4">
                  <Trophy className="h-5 w-5 text-[#e3a7a5]" />
                  <p className="mt-3 text-sm font-black uppercase tracking-[0.12em] text-[#f7f1e8]">
                    keep going
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#f7f1e8]/72">
                    Your progress stays saved in this browser.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[#e3a7a5]/18 bg-[#e3a7a5]/8 p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/80">progress</p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#f7f1e8]">
                you have completed {totalComplete} of {totalStops} stops
              </h2>
              <div className="mt-5">
                <ProgressBar value={totalComplete} max={totalStops} />
              </div>

              <div className="mt-6 space-y-3">
                <a
                  href="/#map"
                  className="inline-flex min-h-11 items-center rounded-full border border-[#e3a7a5]/18 bg-black/20 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"
                >
                  <MapPinned className="mr-2 h-4 w-4" />
                  check the map
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          {huntRoutes.map((route) => (
            <RouteCard key={route.slug} route={route} />
          ))}
        </section>
      </div>
    </div>
  )
}
