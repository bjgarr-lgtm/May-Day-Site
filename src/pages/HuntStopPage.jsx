import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, Compass, HelpCircle } from 'lucide-react'
import PageShell from '../components/mayday/PageShell'
import { getStop } from '../data/huntData'
import { isStopComplete, markStopComplete } from '../lib/huntProgress'

export default function HuntStopPage() {
  const { category, stopId } = useParams()
  const stop = getStop(category, stopId)
  const [complete, setComplete] = useState(() => isStopComplete(category, stopId))
  const [showHint, setShowHint] = useState(false)

  if (!stop) {
    return (
      <PageShell
        eyebrow="scavenger hunt"
        title="stop not found"
        body="This hunt stop does not exist or the QR route is pointing somewhere wrong, which would be rude of it."
      >
        <Link
          to="/hunt"
          className="inline-flex rounded-full border border-[#f2c4cf]/20 bg-[#f2c4cf]/10 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8]"
        >
          back to hunt home
        </Link>
      </PageShell>
    )
  }

  const handleComplete = () => {
    markStopComplete(category, stopId)
    setComplete(true)
  }

  return (
    <PageShell
      eyebrow={`${stop.categoryTitle} · stop ${stop.number} of ${stop.totalStops}`}
      title={stop.title}
      body={stop.routeIntro}
      backTo="/hunt"
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-[#f2c4cf]/20 bg-black/20 p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f2c4cf]/20 bg-[#f2c4cf]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#f7f1e8]">
              <Compass className="h-4 w-4 text-[#f2c4cf]" />
              clue
            </div>
            <p className="text-xl leading-8 text-[#f7f1e8]/92">{stop.clue}</p>
          </div>

          <div className="rounded-[2rem] border border-[#f2c4cf]/20 bg-[#11261e] p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f2c4cf]/20 bg-black/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#f7f1e8]">
              <HelpCircle className="h-4 w-4 text-[#f2c4cf]" />
              answer prompt
            </div>
            <p className="text-lg leading-8 text-[#f7f1e8]/88">{stop.answerPrompt}</p>

            <button
              type="button"
              onClick={() => setShowHint((value) => !value)}
              className="mt-5 rounded-full border border-[#f2c4cf]/20 bg-[#f2c4cf]/10 px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#f2c4cf]/15"
            >
              {showHint ? 'hide hint' : 'show hint'}
            </button>

            {showHint ? (
              <div className="mt-4 rounded-2xl border border-[#f2c4cf]/15 bg-black/15 p-4 text-[#f7f1e8]/80">
                {stop.hint}
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-[#f2c4cf]/20 bg-black/20 p-6">
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#f2c4cf]">progress</h2>
            <p className="mt-3 leading-7 text-[#f7f1e8]/84">
              Mark this stop complete after you have found it or answered it. Progress is saved in this browser on this device.
            </p>

            <button
              type="button"
              onClick={handleComplete}
              disabled={complete}
              className={`mt-5 inline-flex items-center rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.14em] transition ${
                complete
                  ? 'cursor-default border border-[#9be1b1]/25 bg-[#9be1b1]/15 text-[#d8ffe3]'
                  : 'bg-[#f2c4cf] text-[#153227] hover:bg-[#ffd8e1]'
              }`}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {complete ? 'completed' : 'mark complete'}
            </button>
          </div>

          <div className="rounded-[2rem] border border-[#f2c4cf]/20 bg-[#11261e] p-6">
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#f2c4cf]">next move</h2>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                to="/hunt"
                className="rounded-full border border-[#f2c4cf]/20 bg-black/15 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#f2c4cf]/10"
              >
                back to all routes
              </Link>
              <Link
                to="/#map"
                className="rounded-full border border-[#f2c4cf]/20 bg-black/15 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#f2c4cf]/10"
              >
                return to map
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
