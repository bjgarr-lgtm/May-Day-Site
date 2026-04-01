import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Compass, Lock, MapPinned, Ticket, Trophy } from 'lucide-react'
import { huntRoutes } from '../data/huntData'
import { getFirstAvailableStop, getRouteCompletionCount, getTotalCompletionCount, getUnlockedStopCount } from '../lib/huntGate'

const HOME_SECTION_TARGET_KEY = 'maydayHomeSectionTarget'

function ProgressBar({ value, max }) {
  const ratio = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
        <span>overall progress</span>
        <span>{value}/{max}</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full border border-[#e3a7a5]/15 bg-black/25">
        <div className="h-full rounded-full bg-[#e3a7a5] transition-all" style={{ width: `${ratio}%` }} />
      </div>
    </div>
  )
}

function RouteCard({ route }) {
  const complete = getRouteCompletionCount(route)
  const total = route.stops.length
  const unlockedCount = getUnlockedStopCount(route)
  const lockedCount = Math.max(0, total - unlockedCount)
  const nextStop = getFirstAvailableStop(route)

  return (
    <div className="rounded-[1.75rem] border border-[#e3a7a5]/18 bg-black/20 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/72">route</p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#f7f1e8]">{route.title}</h2>
        </div>
        <div className="rounded-full border border-[#e3a7a5]/18 bg-[#e3a7a5]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#f7f1e8]">
          {complete}/{total}
        </div>
      </div>
      <p className="mt-3 text-sm leading-7 text-[#f7f1e8]/78">{route.intro}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex min-h-10 items-center rounded-full border border-[#e3a7a5]/18 bg-black/20 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#f7f1e8]">
          {unlockedCount} visible
        </span>
        {lockedCount > 0 ? (
          <span className="inline-flex min-h-10 items-center rounded-full border border-[#e3a7a5]/18 bg-black/20 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#f7f1e8]">
            <Lock className="mr-2 h-3.5 w-3.5" />
            {lockedCount} locked
          </span>
        ) : null}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link to={nextStop ? `/hunt/${route.slug}/${nextStop.id}` : '/hunt'} className="inline-flex min-h-11 items-center rounded-full bg-[#e3a7a5] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#264636] transition hover:bg-[#efbbb9]">
          {complete > 0 ? 'continue route' : 'enter route'}
        </Link>
      </div>
    </div>
  )
}

export default function HuntHome() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])
  const totalStops = huntRoutes.reduce((sum, route) => sum + route.stops.length, 0)
  const totalComplete = getTotalCompletionCount(huntRoutes)

  function goToHomeSection(sectionId) {
    try { sessionStorage.setItem(HOME_SECTION_TARGET_KEY, sectionId) } catch {}
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#264636] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center rounded-full border border-[#e3a7a5]/20 bg-black/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10">
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
                Five routes. First three stops visible. Real world tasks, answer checks, and volunteer handoffs where the hunt needs a human witness.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.25rem] border border-[#e3a7a5]/18 bg-black/20 p-4">
                  <Compass className="h-5 w-5 text-[#e3a7a5]" />
                  <p className="mt-3 text-sm font-black uppercase tracking-[0.12em] text-[#f7f1e8]">pick a route</p>
                  <p className="mt-2 text-sm leading-6 text-[#f7f1e8]/72">Activities, Art Center, Vendors, History, or Indoors.</p>
                </div>
                <div className="rounded-[1.25rem] border border-[#e3a7a5]/18 bg-black/20 p-4">
                  <Ticket className="h-5 w-5 text-[#e3a7a5]" />
                  <p className="mt-3 text-sm font-black uppercase tracking-[0.12em] text-[#f7f1e8]">earn tickets</p>
                  <p className="mt-2 text-sm leading-6 text-[#f7f1e8]/72">Volunteers still handle real world checkpoints and ticket handoffs.</p>
                </div>
                <div className="rounded-[1.25rem] border border-[#e3a7a5]/18 bg-black/20 p-4">
                  <Trophy className="h-5 w-5 text-[#e3a7a5]" />
                  <p className="mt-3 text-sm font-black uppercase tracking-[0.12em] text-[#f7f1e8]">unlock forward</p>
                  <p className="mt-2 text-sm leading-6 text-[#f7f1e8]/72">Every completed stop unlocks the next one.</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-[#e3a7a5]/18 bg-[#e3a7a5]/8 p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/80">progress</p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#f7f1e8]">
                you have completed {totalComplete} of {totalStops} stops
              </h2>
              <div className="mt-5"><ProgressBar value={totalComplete} max={totalStops} /></div>
              <div className="mt-6 space-y-3">
                <button type="button" onClick={() => goToHomeSection('map')} className="inline-flex min-h-11 items-center rounded-full border border-[#e3a7a5]/18 bg-black/20 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10">
                  <MapPinned className="mr-2 h-4 w-4" />
                  check the map
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          {huntRoutes.map((route) => <RouteCard key={route.slug} route={route} />)}
        </section>
      </div>
    </div>
  )
}
