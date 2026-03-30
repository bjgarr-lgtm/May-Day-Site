import React from 'react'
import { Link } from 'react-router-dom'
import NoiseBackground from './NoiseBackground'

export default function PageShell({ title, eyebrow, body, children, backTo = '/' }) {
  return (
    <div className="min-h-screen bg-[#1d4a39] text-white">
      <NoiseBackground />
      <div className="relative">
        <header className="border-b border-[#f2c4cf]/15 bg-[#163a2d]/85 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link to={backTo} className="text-sm font-black uppercase tracking-[0.18em] text-[#f2c4cf]">
              may day on the harbor
            </Link>
            <nav className="flex items-center gap-2">
              <Link to="/" className="rounded-full border border-[#f2c4cf]/20 px-4 py-2 text-sm font-semibold text-[#f7f1e8]/85 transition hover:border-[#f2c4cf]/45 hover:bg-[#f2c4cf]/10 hover:text-white">
                home
              </Link>
              <Link to="/hunt" className="rounded-full border border-[#f2c4cf]/20 px-4 py-2 text-sm font-semibold text-[#f7f1e8]/85 transition hover:border-[#f2c4cf]/45 hover:bg-[#f2c4cf]/10 hover:text-white">
                scavenger hunt
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4 pb-10">
            {eyebrow ? <p className="text-xs uppercase tracking-[0.28em] text-[#f0d4d9]/70">{eyebrow}</p> : null}
            <h1 className="text-4xl font-black uppercase tracking-tight text-[#f2c4cf] sm:text-5xl">{title}</h1>
            {body ? <p className="text-lg leading-8 text-[#f7f1e8]/88">{body}</p> : null}
          </div>

          {children}
        </main>
      </div>
    </div>
  )
}
