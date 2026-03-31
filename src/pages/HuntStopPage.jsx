import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  Home,
  MapPinned,
  Route,
  Sparkles,
} from 'lucide-react'
import { getRouteBySlug, getStop } from '../data/huntData'

function getStorageKey(category, stopId) {
  return `mayday-hunt-stop:${category}:${stopId}`
}

function isCompleted(category, stopId) {
  try {
    return localStorage.getItem(getStorageKey(category, stopId)) === 'done'
  } catch {
    return false
  }
}

function markCompleted(category, stopId) {
  try {
    localStorage.setItem(getStorageKey(category, stopId), 'done')
  } catch {}
}

function ProgressPill({ complete, total }) {
  return (
    <div className="rounded-full border border-[#e3a7a5]/18 bg-[#e3a7a5]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#f7f1e8]">
      stop {complete} of {total}
    </div>
  )
}

function InfoCard({ label, value }) {
  if (!value) return null
  return (
    <div className="rounded-[1.25rem] border border-[#e3a7a5]/18 bg-black/20 p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">{label}</p>
      <p className="mt-2 text-sm leading-7 text-[#f7f1e8]/84">{value}</p>
    </div>
  )
}

export default function HuntStopPage() {
  const { category, stopId } = useParams()
  const route = useMemo(() => getRouteBySlug(category), [category])
  const stop = useMemo(() => getStop(category, stopId), [category, stopId])

  const [complete, setComplete] = useState(() =>
    category && stopId ? isCompleted(category, stopId) : false
  )

  useEffect(() => {
    if (category && stopId) {
      setComplete(isCompleted(category, stopId))
    }
  }, [category, stopId])

  if (!route || !stop) {
    return (
      <div className="min-h-screen bg-[#264636] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#e3a7a5]/18 bg-black/20 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/80">hunt</p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#e3a7a5] sm:text-5xl">
            stop not found
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#f7f1e8]/84">
            This clue wandered off into the fog. Go back to the hunt home and choose a live route.
          </p>
          <div className="mt-6">
            <Link
              to="/hunt"
              className="inline-flex min-h-12 items-center rounded-full bg-[#e3a7a5] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#264636] transition hover:bg-[#efbbb9]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              back to hunt
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentIndex = route.stops.findIndex((item) => item.id === stop.id)
  const previousStop = currentIndex > 0 ? route.stops[currentIndex - 1] : null
  const nextStop = currentIndex < route.stops.length - 1 ? route.stops[currentIndex + 1] : null

  function onMarkComplete() {
    markCompleted(category, stop.id)
    setComplete(true)
  }

  return (
    <div className="min-h-screen bg-[#264636] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            to="/hunt"
            className="inline-flex items-center rounded-full border border-[#e3a7a5]/20 bg-black/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            back to hunt
          </Link>
          <Link
            to="/"
            className="inline-flex items-center rounded-full border border-[#e3a7a5]/20 bg-black/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"
          >
            <Home className="mr-2 h-4 w-4" />
            home
          </Link>
        </div>

        <section className="rounded-[2rem] border border-[#e3a7a5]/18 bg-black/20 p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/80">{route.title}</p>
              <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#e3a7a5] sm:text-5xl">
                {stop.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[#f7f1e8]/84">
                {stop.clue}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <ProgressPill complete={stop.number} total={stop.totalStops} />
              <div
                className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${
                  complete
                    ? 'border-[#e3a7a5] bg-[#e3a7a5] text-[#264636]'
                    : 'border-[#e3a7a5]/18 bg-black/20 text-[#f7f1e8]'
                }`}
              >
                {complete ? 'completed' : 'in progress'}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-[#e3a7a5]/8 p-5 sm:p-6">
                <div className="flex items-center gap-3 text-[#e3a7a5]">
                  <Sparkles className="h-5 w-5" />
                  <h2 className="text-lg font-black uppercase tracking-tight">what to do</h2>
                </div>
                <p className="mt-4 text-base leading-8 text-[#f7f1e8]/86">{stop.answerPrompt}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard label="hint" value={stop.hint} />
                <InfoCard label="completion type" value={stop.completionType} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5 sm:p-6">
                <div className="flex items-center gap-3 text-[#e3a7a5]">
                  <Compass className="h-5 w-5" />
                  <h2 className="text-lg font-black uppercase tracking-tight">route context</h2>
                </div>
                <p className="mt-4 text-sm leading-7 text-[#f7f1e8]/78">{route.intro}</p>
              </div>

              <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5 sm:p-6">
                <div className="flex items-center gap-3 text-[#e3a7a5]">
                  <Route className="h-5 w-5" />
                  <h2 className="text-lg font-black uppercase tracking-tight">next move</h2>
                </div>
                <p className="mt-4 text-sm leading-7 text-[#f7f1e8]/78">
                  Mark this stop complete when you have done the thing, solved the clue, or checked in with the human being guarding the next piece of chaos.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={onMarkComplete}
                    className={`inline-flex min-h-12 items-center rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.14em] transition ${
                      complete
                        ? 'border border-[#e3a7a5]/18 bg-black/20 text-[#f7f1e8]'
                        : 'bg-[#e3a7a5] text-[#264636] hover:bg-[#efbbb9]'
                    }`}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {complete ? 'completed' : 'mark complete'}
                  </button>

                  {nextStop ? (
                    <Link
                      to={`/hunt/${category}/${nextStop.id}`}
                      className="inline-flex min-h-12 items-center rounded-full border border-[#e3a7a5]/18 bg-black/20 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"
                    >
                      next stop
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  ) : (
                    <Link
                      to="/hunt"
                      className="inline-flex min-h-12 items-center rounded-full border border-[#e3a7a5]/18 bg-black/20 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"
                    >
                      route complete
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {previousStop ? (
              <Link
                to={`/hunt/${category}/${previousStop.id}`}
                className="inline-flex min-h-11 items-center rounded-full border border-[#e3a7a5]/18 bg-black/20 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                previous stop
              </Link>
            ) : null}

            <a
              href="/#map"
              className="inline-flex min-h-11 items-center rounded-full border border-[#e3a7a5]/18 bg-black/20 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"
            >
              <MapPinned className="mr-2 h-4 w-4" />
              venue map
            </a>

            <Link
              to="/hunt"
              className="inline-flex min-h-11 items-center rounded-full border border-[#e3a7a5]/18 bg-black/20 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"
            >
              all routes
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
