import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, MapPinned, Ticket, Trophy, PartyPopper } from 'lucide-react'
import { huntRoutes } from '../data/huntData'
import { getFirstAvailableStop, getRouteCompletionCount, getUnlockedStopCount } from '../lib/huntGate'
import { applyRuntimeToRoutes, buildRuntimeSettingsMap, fetchHuntPublicState, getPlayerKey } from '../lib/huntTickets'

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

function StatPill({ label, value }) {
  return (
    <div className="rounded-full border border-[#e3a7a5]/18 bg-black/20 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#f7f1e8]">
      {label}: {value}
    </div>
  )
}

function RouteCard({ route, summary }) {
  const complete = getRouteCompletionCount(route)
  const total = route.stops.length
  const unlockedCount = getUnlockedStopCount(route)
  const lockedCount = Math.max(0, total - unlockedCount)
  const nextStop = getFirstAvailableStop(route)
  const bonusKey = `route_bonus:${route.slug}`
  const routeBonusEarned = (summary?.earnedEventKeys || []).includes(bonusKey)
  const routeTickets = route.stops.reduce((sum, stop) => sum + (stop.ticketValue || 0), 0)

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

      <p className="mt-3 leading-7 text-[#f7f1e8]/78">{route.intro}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <StatPill label="visible" value={unlockedCount} />
        <StatPill label="route tickets" value={routeTickets} />
        {lockedCount > 0 ? <StatPill label="locked" value={lockedCount} /> : null}
        {routeBonusEarned ? <StatPill label="bonus" value="+10 claimed" /> : null}
      </div>

      <div className="mt-5">
        <Link to={nextStop ? `/hunt/${route.slug}/${nextStop.id}` : '/hunt'} className="inline-flex min-h-11 items-center rounded-full bg-[#e3a7a5] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#264636] transition hover:bg-[#efbbb9]">
          {complete > 0 ? 'continue route' : 'enter route'}
        </Link>
      </div>
    </div>
  )
}

function CelebrationBanner({ summary }) {
  if ((summary?.earnedEventKeys || []).includes('full_bonus:all')) {
    return (
      <div className="rounded-[1.75rem] border border-[#e3a7a5] bg-[#e3a7a5]/12 p-5 sm:p-6">
        <div className="flex items-center gap-3 text-[#e3a7a5]">
          <PartyPopper className="h-5 w-5" />
          <p className="text-xs font-black uppercase tracking-[0.24em]">full hunt complete</p>
        </div>
        <p className="mt-3 text-xl font-black uppercase tracking-tight text-[#f7f1e8]">
          all 50 stops complete. +50 bonus tickets already awarded.
        </p>
      </div>
    )
  }
  return null
}

export default function HuntHome() {
  const navigate = useNavigate()
  const [publicState, setPublicState] = useState({ settings: [], summary: null })
  const [playerKey, setPlayerKey] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    const nextKey = getPlayerKey()
    setPlayerKey(nextKey)
    fetchHuntPublicState(nextKey).then(setPublicState).catch((err) => setError(err.message || 'Could not load hunt state.'))
  }, [])

  const routes = useMemo(() => {
    const settingsMap = buildRuntimeSettingsMap(publicState.settings || [])
    return applyRuntimeToRoutes(huntRoutes, settingsMap)
  }, [publicState])

  const totalStops = routes.reduce((sum, route) => sum + route.stops.length, 0)
  const totalComplete = routes.reduce((sum, route) => sum + getRouteCompletionCount(route), 0)

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

        <CelebrationBanner summary={publicState.summary} />

        <section className="mt-6 rounded-[2rem] border border-[#e3a7a5]/18 bg-black/20 p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/80">scavenger hunt</p>
              <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#e3a7a5] sm:text-5xl">start at the welcome center</h1>
              <div className="mt-4 max-w-2xl space-y-3 text-base leading-7 text-[#f7f1e8]/84">
                <p>start at the welcome center and scan the intro code</p>
                <p>pick a route or roam between categories</p>
                <p>some clues can be read online, but certain qr codes are intentionally only available in the real world</p>
                <p>progress saves in the browser on your phone</p>
              </div>
              {error ? <p className="mt-4 text-sm text-[#ffb0b0]">{error}</p> : null}
            </div>

            <div className="rounded-[1.75rem] border border-[#e3a7a5]/18 bg-[#e3a7a5]/8 p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/80">progress and tickets</p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#f7f1e8]">
                you have completed {totalComplete} of {totalStops} stops
              </h2>
              <div className="mt-5"><ProgressBar value={totalComplete} max={totalStops} /></div>
              <div className="mt-5 flex flex-wrap gap-2">
                <StatPill label="earned" value={publicState.summary?.earnedTotal ?? 0} />
                <StatPill label="claimed" value={publicState.summary?.claimedTotal ?? 0} />
                <StatPill label="spent" value={publicState.summary?.spentTotal ?? 0} />
                <StatPill label="available" value={publicState.summary?.availableTotal ?? 0} />
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#f7f1e8]/68">player code: {playerKey || 'loading'}</p>
              <div className="mt-6">
                <button type="button" onClick={() => goToHomeSection('map')} className="inline-flex min-h-11 items-center rounded-full border border-[#e3a7a5]/18 bg-black/20 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10">
                  <MapPinned className="mr-2 h-4 w-4" />
                  check the map
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          {routes.map((route) => <RouteCard key={route.slug} route={route} summary={publicState.summary} />)}
        </section>
      </div>
    </div>
  )
}
