import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Accessibility,
  ChevronRight,
  Clock3,
  ExternalLink,
  HeartHandshake,
  Info,
  Menu,
  Search,
  Shield,
  ShoppingBag,
  Users,
  X,
  HandCoins,
  Link2,
  ClipboardPenLine,
  Facebook,
  Instagram,
  BookOpen
} from 'lucide-react'

import NoiseBackground from '../components/mayday/NoiseBackground'
import {
  highlights,
  huntCategories,
  infoCards,
  mapZones,
  merchItems,
  practicalInfo,
  quickLinks,
  scheduleItems,
  siteMeta,
  timeline
} from '../data/maydayContent'

import { huntRoutes } from '../data/huntData'
import { getRouteCompletionCount, getTotalCompletionCount } from '../lib/huntProgress'

const iconMap = {
  Search,
  ShoppingBag
}

const infoIconMap = {
  'who this is for': Users,
  'health and safety': Shield,
  'why may day': HeartHandshake
}

function scrollToSection(id, closeMenu) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
  if (closeMenu) closeMenu(false)
}

function SectionTitle({ eyebrow, title, body }) {
  return (
    <div className="space-y-3 max-w-3xl">
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.24em] text-[#f0d4d9]/70">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-[#f2c4cf]">
        {title}
      </h2>
      {body && (
        <p className="text-sm sm:text-base leading-7 text-[#f7f1e8]/85">
          {body}
        </p>
      )}
    </div>
  )
}

function NavBar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#163a2d]/90 border-b border-[#f2c4cf]/10 backdrop-blur">
      <div className="flex justify-between items-center px-4 py-3">
        <button
          onClick={() => scrollToSection('top')}
          className="text-xs font-black uppercase text-[#f2c4cf]"
        >
          may day on the harbor
        </button>

        <button onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-2">
          {quickLinks.map((l) => (
            <button key={l.id} onClick={() => scrollToSection(l.id, setOpen)}>
              {l.label}
            </button>
          ))}
          <Link to="/hunt">Hunt</Link>
        </div>
      )}
    </header>
  )
}

function Hero() {
  const complete = getTotalCompletionCount()
  const total = huntRoutes.reduce((s, r) => s + r.stops.length, 0)

  return (
    <section id="top" className="px-4 py-10 grid gap-8 lg:grid-cols-2">
      <div className="space-y-5">
        <h1 className="text-4xl sm:text-6xl font-black uppercase text-[#f2c4cf]">
          may day
          <span className="block text-white">on the harbor</span>
        </h1>

        <p className="text-sm sm:text-base text-[#f7f1e8]/85">
          {siteMeta.description}
        </p>

        <div className="flex flex-wrap gap-2 text-xs">
          <span>{siteMeta.dateLabel}</span>
          <span>{siteMeta.hoursLabel}</span>
          <span>{siteMeta.freeLabel}</span>
          <span>hunt {complete}/{total}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to="/hunt">
            <button className="px-4 py-3 bg-[#f2c4cf] text-black rounded-full">
              start hunt
            </button>
          </Link>
        </div>
      </div>

      {/* POSTER */}
      <div className="rounded-xl overflow-hidden border border-[#f2c4cf]/20">
        <img
          src="/poster-2026-pink-green.png"
          alt="poster"
          className="w-full object-cover"
        />
      </div>
    </section>
  )
}

function ShopSection() {
  return (
    <section id="shop" className="px-4 py-12">
      <SectionTitle title="support the event" />

      <div className="grid gap-4 md:grid-cols-3 mt-6">
        {merchItems.map((item) => (
          <div key={item.title} className="border p-4 rounded-xl">
            {item.imageSrc && (
              <img src={item.imageSrc} className="mb-3 rounded-lg" />
            )}

            <h3 className="font-bold">{item.title}</h3>
            <p className="text-sm">{item.desc}</p>

            {/* FIXED LINK */}
            <a
              href={siteMeta.shopHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex mt-3 text-[#f2c4cf]"
            >
              {item.cta} <ChevronRight />
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}

function InfoSection() {
  return (
    <section id="info" className="px-4 py-12">
      <SectionTitle title="info" />

      <div className="mt-6 space-y-4">
        <p>{siteMeta.venueName}</p>
        <p>{siteMeta.venueAddress}</p>
        <p className="break-all">{siteMeta.contactEmail}</p>

        <div className="flex gap-3 mt-4">
          {siteMeta.facebookHref && (
            <a href={siteMeta.facebookHref}><Facebook /></a>
          )}
          {siteMeta.instagramHref && (
            <a href={siteMeta.instagramHref}><Instagram /></a>
          )}
        </div>
      </div>
    </section>
  )
}

export default function Page() {
  return (
    <div className="bg-[#1d4a39] text-white min-h-screen">
      <NoiseBackground />
      <NavBar />
      <Hero />
      <ShopSection />
      <InfoSection />
    </div>
  )
}