import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Accessibility,
  CalendarDays,
  ChevronRight,
  Clock3,
  ExternalLink,
  HeartHandshake,
  Info,
  MapPinned,
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
  BookOpen,
  Mail,
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
  timeline,
} from '../data/maydayContent'

import { huntRoutes } from '../data/huntData'
import { getTotalCompletionCount } from '../lib/huntProgress'
import SponsorsSection from '../components/SponsorsSection'
import MobileActionBar from '../components/MobileActionBar'
import LiveInstagramTicker from '../components/LiveInstagramTicker'

const iconMap = {
  CalendarDays,
  MapPinned,
  Search,
  Info,
  ShoppingBag,
}

const infoIconMap = {
  'who this is for': Users,
  'health and safety': Shield,
  'why may day': HeartHandshake,
}

const archiveCollections = [
  {
    title: 'Aberdeen Free Speech Fights',
    detail: 'IWW organizing, arrests, speaking bans, and the fight over who gets to speak in public at all.',
  },
  {
    title: 'Murder of William McKay',
    detail: 'Bay City Mill violence, strike conflict, and one of the Harbor’s most brutal labor killings.',
  },
  {
    title: 'Murder of Laura Law',
    detail: 'Anti labor terror, civil rights violations, and the deadly machinery protecting local power.',
  },
  {
    title: 'Everett, Centralia, Seattle',
    detail: 'Regional flashpoints, massacres, and labor conflict far beyond a single town line.',
  },
  {
    title: 'Miscellaneous Labor History',
    detail: 'Scans, clippings, and supporting material tied to Harbor labor history across the wider region.',
  },
]

const arrivalMapHref =
  'https://www.canva.com/design/DAHFduoDYkw/rN3wULGKMsnB9NBCxMtbkA/view?utm_content=DAHFduoDYkw&utm_campaign=designshare&utm_medium=embeds&utm_source=link'

const arrivalMapEmbed =
  'https://www.canva.com/design/DAHFduoDYkw/rN3wULGKMsnB9NBCxMtbkA/view?embed'

const buildingMapHref =
  'https://www.canva.com/design/DAGiCuDHo70/kE429pS-5JdBHRcyJB4JqQ/view?utm_content=DAGiCuDHo70&utm_campaign=designshare&utm_medium=embeds&utm_source=link'

const buildingMapEmbed =
  'https://www.canva.com/design/DAGiCuDHo70/kE429pS-5JdBHRcyJB4JqQ/view?embed'

const HOME_SECTION_TARGET_KEY = 'maydayHomeSectionTarget'

function scrollToSection(id, closeMenu) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
  if (closeMenu) closeMenu(false)
}

function renderTextWithInstagramLinks(text) {
  if (!text) return null
  const parts = text.split(/(@[A-Za-z0-9._]+)/g)

  return parts.map((part, index) => {
    if (/^@[A-Za-z0-9._]+$/.test(part)) {
      const handle = part.slice(1)
      return (
        <a
          key={`${part}-${index}`}
          href={`https://www.instagram.com/${handle}/`}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-[#e3a7a5]/60 underline-offset-4 transition hover:text-[#e3a7a5]"
        >
          {part}
        </a>
      )
    }

    return <React.Fragment key={`${index}-${part}`}>{part}</React.Fragment>
  })
}

function SectionTitle({ eyebrow, title, body }) {
  return (
    <div className="max-w-3xl space-y-3">
      {eyebrow ? <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/72">{eyebrow}</p> : null}
      <h2 className="text-2xl font-black uppercase tracking-tight text-[#e3a7a5] sm:text-3xl lg:text-4xl">{title}</h2>
      {body ? <p className="text-sm leading-7 text-[#f7f1e8]/88 sm:text-base">{body}</p> : null}
    </div>
  )
}

function FacebookEventBanner() {
  if (!siteMeta.facebookEventHref) return null

  return (
    <a
      href={siteMeta.facebookEventHref}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center rounded-full border border-[#e3a7a5]/25 bg-[#e3a7a5]/12 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/18 sm:text-sm"
    >
      <Facebook className="mr-2 h-4 w-4 shrink-0" />
      RSVP on Facebook
      <ExternalLink className="ml-2 h-4 w-4 shrink-0" />
    </a>
  )
}

function NavBar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[#e3a7a5]/12 bg-[#1f3a2c]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => scrollToSection('top')}
          className="max-w-[13rem] text-left text-xs font-black uppercase leading-tight tracking-[0.14em] text-[#e3a7a5] sm:max-w-[15rem] sm:text-sm"
        >
          may day on the harbor
          <span className="block text-[#f7f1e8]/70">2026 welcome center</span>
        </button>

        <nav className="hidden items-center gap-2 md:flex">
          {quickLinks
            .filter((item) => item.label !== 'Hunt Routes' && item.id !== 'hunt-routes')
            .map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="rounded-full border border-[#e3a7a5]/18 px-4 py-2 text-sm font-semibold text-[#f7f1e8]/85 transition hover:border-[#e3a7a5]/45 hover:bg-[#e3a7a5]/10 hover:text-white"
              >
                {item.label}
              </button>
            ))}
          <button
            type="button"
            onClick={() => scrollToSection('labor-history')}
            className="rounded-full border border-[#e3a7a5]/18 px-4 py-2 text-sm font-semibold text-[#f7f1e8]/85 transition hover:border-[#e3a7a5]/45 hover:bg-[#e3a7a5]/10 hover:text-white"
          >
            Labor History
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('live-feed')}
            className="rounded-full border border-[#e3a7a5]/18 px-4 py-2 text-sm font-semibold text-[#f7f1e8]/85 transition hover:border-[#e3a7a5]/45 hover:bg-[#e3a7a5]/10 hover:text-white"
          >
            Live Feed
          </button>
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e3a7a5]/18 text-[#f7f1e8] md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-[#e3a7a5]/10 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {quickLinks
              .filter((item) => item.label !== 'Hunt Routes' && item.id !== 'hunt-routes')
              .map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id, setOpen)}
                  className="rounded-2xl border border-[#e3a7a5]/15 px-4 py-3 text-left text-sm font-semibold text-[#f7f1e8]/88"
                >
                  {item.label}
                </button>
              ))}
            <button
              type="button"
              onClick={() => scrollToSection('labor-history', setOpen)}
              className="rounded-2xl border border-[#e3a7a5]/15 px-4 py-3 text-left text-sm font-semibold text-[#f7f1e8]/88"
            >
              Labor History
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('live-feed', setOpen)}
              className="rounded-2xl border border-[#e3a7a5]/15 px-4 py-3 text-left text-sm font-semibold text-[#f7f1e8]/88"
            >
              Live Feed
            </button>
          </div>
        </div>
      ) : null}
    </header>
  )
}

function Hero() {
  const totalComplete = getTotalCompletionCount()
  const totalStops = huntRoutes.reduce((sum, route) => sum + route.stops.length, 0)

  return (
    <section id="top" className="relative overflow-hidden border-b border-[#e3a7a5]/10">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-20">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.24em] text-[#f7f1e8]/70 sm:text-sm sm:tracking-[0.3em]">{siteMeta.subtitle}</p>
            <h1 className="max-w-4xl text-4xl font-black uppercase leading-[0.9] tracking-tight text-[#e3a7a5] sm:text-6xl lg:text-8xl">
              may day
              <span className="block text-[#f7f1e8]">on the harbor</span>
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[#f7f1e8]/88 sm:text-lg sm:leading-8">{siteMeta.description}</p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] sm:gap-3 sm:text-sm sm:tracking-[0.16em]">
            {[siteMeta.dateLabel, siteMeta.hoursLabel, siteMeta.freeLabel].map((item) => (
              <span key={item} className="rounded-full border border-[#e3a7a5]/25 bg-[#e3a7a5]/10 px-3 py-2 text-[#f7f1e8] sm:px-4">
                {item}
              </span>
            ))}
            <span className="rounded-full border border-[#e3a7a5]/25 bg-[#e3a7a5]/12 px-3 py-2 text-[#f7f1e8] sm:px-4">
              hunt progress {totalComplete}/{totalStops}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            {[
              { id: 'schedule', label: 'Schedule', icon: CalendarDays },
              { id: 'map', label: 'Map', icon: MapPinned },
              { id: 'hunt', label: 'Scavenger Hunt', icon: Search },
            ].map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="inline-flex h-auto min-h-11 items-center rounded-full bg-[#e3a7a5] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#264636] transition hover:bg-[#efbbb9] sm:px-5 sm:text-sm sm:tracking-[0.15em]"
                >
                  <Icon className="mr-2 h-4 w-4 shrink-0" />
                  {item.label}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => scrollToSection('labor-history')}
              className="inline-flex h-auto min-h-11 items-center rounded-full border border-[#e3a7a5]/25 bg-black/20 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10 sm:px-5 sm:text-sm sm:tracking-[0.15em]"
            >
              <BookOpen className="mr-2 h-4 w-4 shrink-0" />
              labor history
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('live-feed')}
              className="inline-flex h-auto min-h-11 items-center rounded-full border border-[#e3a7a5]/25 bg-black/20 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10 sm:px-5 sm:text-sm sm:tracking-[0.15em]"
            >
              <Instagram className="mr-2 h-4 w-4 shrink-0" />
              live feed
            </button>
          </div>

          <div className="rounded-[1.75rem] border border-[#e3a7a5]/18 bg-black/20 p-5 sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
              <div className="max-w-xl">
                <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/80">get involved</p>
                <h3 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#f7f1e8] sm:text-3xl">
                  join, apply, or support
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#f7f1e8]/78 sm:text-base">
                  Apply as a vendor or performer, support the event, or reach out directly if you want to help make the day happen.
                </p>
                {siteMeta.facebookEventHref ? (
                  <div className="mt-4">
                    <a
                      href={siteMeta.facebookEventHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center rounded-full border border-[#e3a7a5]/18 bg-black/15 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"
                    >
                      <Facebook className="mr-2 h-4 w-4 shrink-0" />
                      RSVP on Facebook
                    </a>
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to={siteMeta.vendorHref}
                  className="inline-flex min-h-14 items-center justify-center rounded-[1.25rem] border border-[#e3a7a5]/18 bg-[#e3a7a5]/10 px-4 py-4 text-center text-sm font-black uppercase tracking-[0.08em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/15"
                >
                  <span className="flex flex-col items-center gap-2 leading-tight">
                    <ClipboardPenLine className="h-4 w-4 shrink-0" />
                    <span>vendor application</span>
                  </span>
                </Link>
                <Link
                  to={siteMeta.performerHref}
                  className="inline-flex min-h-14 items-center justify-center rounded-[1.25rem] border border-[#e3a7a5]/18 bg-[#e3a7a5]/10 px-4 py-4 text-center text-sm font-black uppercase tracking-[0.08em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/15"
                >
                  <span className="flex flex-col items-center gap-2 leading-tight">
                    <ClipboardPenLine className="h-4 w-4 shrink-0" />
                    <span>performer application</span>
                  </span>
                </Link>
                <a
                  href={siteMeta.donateHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-14 items-center justify-center rounded-[1.25rem] border border-[#e3a7a5]/18 bg-black/15 px-4 py-4 text-center text-sm font-black uppercase tracking-[0.08em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"
                >
                  <span className="flex flex-col items-center gap-2 leading-tight">
                    <HandCoins className="h-4 w-4 shrink-0" />
                    <span>donate</span>
                  </span>
                </a>
                <a
                  href={siteMeta.volunteerEmail}
                  className="inline-flex min-h-14 items-center justify-center rounded-[1.25rem] border border-[#e3a7a5]/18 bg-black/15 px-4 py-4 text-center text-sm font-black uppercase tracking-[0.08em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"
                >
                  <span className="flex flex-col items-center gap-2 leading-tight">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span>email to help</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#e3a7a5]/18 bg-black/25 p-4 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-6">
          <div className="relative aspect-[4/5] max-h-[36rem] overflow-hidden rounded-[1.5rem] border border-[#e3a7a5]/15 bg-black/20">
            <img
              src="poster-2026-pink-green.png"
              alt="May Day on the Harbor 2026 poster art"
              className="absolute inset-0 h-full w-full object-cover object-bottom"
              onError={(event) => {
                if (event.currentTarget.dataset.fallbackApplied === 'true') return
                event.currentTarget.dataset.fallbackApplied = 'true'
                event.currentTarget.src = 'poster-2026-pink-green.png'
              }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.18)_55%,rgba(0,0,0,.55))]" />
            <div className="absolute left-4 top-4">
              <span className="rounded-full border border-[#e3a7a5]/30 bg-black/35 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#f7f1e8] sm:text-xs">
                2026 poster art
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:mt-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-[#e3a7a5]/15 bg-[#e3a7a5]/8 p-4">
              <div className="mb-2 flex items-center gap-2 text-[#e3a7a5]"><Clock3 className="h-4 w-4" /><span className="text-xs uppercase tracking-[0.22em]">hours</span></div>
              <p className="text-base font-bold uppercase text-[#f7f1e8] sm:text-lg">noon to midnight</p>
              <p className="mt-2 text-sm text-[#f7f1e8]/72">Vendors through 7 pm, evening film and music later indoors.</p>
            </div>
            <div className="rounded-3xl border border-[#e3a7a5]/15 bg-[#e3a7a5]/8 p-4">
              <div className="mb-2 flex items-center gap-2 text-[#e3a7a5]"><Accessibility className="h-4 w-4" /><span className="text-xs uppercase tracking-[0.22em]">community care</span></div>
              <p className="text-base font-bold uppercase text-[#f7f1e8] sm:text-lg">masks required</p>
              <p className="mt-2 text-sm text-[#f7f1e8]/72">Masks are provided to help keep the event more accessible and safer.</p>
            </div>
          </div>

          <div className="mt-4 sm:mt-6">
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#e3a7a5]/80">at a glance</p>
            <div className="flex flex-wrap gap-2">
              {highlights.map((item) => (
                <span key={item} className="rounded-full border border-[#f7f1e8]/10 bg-[#0c1914]/80 px-3 py-2 text-xs text-[#f7f1e8]/82 sm:text-sm">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HomeSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {infoCards.map((card) => {
          const Icon = infoIconMap[card.title] || Info
          return (
            <div key={card.title} className="rounded-[2rem] border border-[#e3a7a5]/18 bg-black/20 p-6">
              <div className="mb-4 inline-flex rounded-2xl border border-[#e3a7a5]/18 bg-[#e3a7a5]/10 p-3 text-[#e3a7a5]"><Icon className="h-5 w-5" /></div>
              <h3 className="mb-3 text-xl font-black uppercase tracking-tight text-[#e3a7a5]">{card.title}</h3>
              <p className="leading-7 text-[#f7f1e8]/84">{card.body}</p>
              {card.title === 'why may day' && siteMeta.laborHistoryHref ? (
                <Link
                  to={siteMeta.laborHistoryHref}
                  className="mt-5 inline-flex items-center rounded-full border border-[#e3a7a5]/18 bg-[#e3a7a5]/10 px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/15"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  labor history of the harbor
                </Link>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function LaborHistorySection() {
  return (
    <section id="labor-history" className="border-y border-[#e3a7a5]/10 bg-black/15">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            eyebrow="archive"
            title="labor history of the harbor"
            body="Browse scanned newspapers, labor conflict records, strike material, and local working class history from Aberdeen, Grays Harbor, and the wider region."
          />
          <div className="flex flex-wrap gap-3">
            <Link
              to={siteMeta.laborHistoryHref}
              className="inline-flex min-h-12 items-center rounded-full bg-[#e3a7a5] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#264636] transition hover:bg-[#efbbb9]"
            >
              <BookOpen className="mr-2 h-4 w-4 shrink-0" />
              open archive
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {archiveCollections.map((item) => (
            <div key={item.title} className="rounded-[2rem] border border-[#e3a7a5]/18 bg-[#183126]/75 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/80">collection</p>
              <h3 className="mt-2 text-xl font-black uppercase tracking-tight text-[#f7f1e8] sm:text-2xl">{item.title}</h3>
              <p className="mt-3 leading-7 text-[#f7f1e8]/78">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[2rem] border border-[#e3a7a5]/18 bg-black/20 p-6">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/80">why it matters</p>
              <h3 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#f7f1e8]">history should not be hidden behind one tiny button</h3>
              <p className="mt-3 max-w-3xl leading-7 text-[#f7f1e8]/78">
                This archive gives people a way to move from event language into real local history. Not abstract labor history. Not generic slogans. The Harbor. The fights. The violence. The organizing. The dead. The records that still remain.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                to={siteMeta.laborHistoryHref}
                className="inline-flex min-h-12 items-center rounded-full border border-[#e3a7a5]/18 bg-[#e3a7a5]/10 px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/15"
              >
                explore labor history
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ScheduleSection() {
  const [filter, setFilter] = useState('all')
  const filters = useMemo(() => ['all', 'family', 'vendors', 'film', 'music'], [])
  const visibleItems = scheduleItems.filter((item) => filter === 'all' || item.category === filter)

  return (
    <section id="schedule" className="border-y border-[#e3a7a5]/10 bg-black/15">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SectionTitle eyebrow="schedule" title="day of programming" />
        <div className="mt-8 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full border px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] transition ${filter === item ? 'border-[#e3a7a5] bg-[#e3a7a5] text-[#264636]' : 'border-[#e3a7a5]/18 bg-[#e3a7a5]/5 text-[#f7f1e8]/82 hover:bg-[#e3a7a5]/10'}`}>
              {item}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {visibleItems.map((item) => (
            <div key={`${item.time}-${item.title}`} className="rounded-[2rem] border border-[#e3a7a5]/18 bg-[#183126]/75 p-6">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/80">{item.time}</p>
                  <h3 className="mt-2 text-xl font-black uppercase tracking-tight text-[#f7f1e8] sm:text-2xl">{item.title}</h3>
                </div>
                <span className="rounded-full bg-[#0d1713] px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#e3a7a5]">{item.area}</span>
              </div>
              <p className="leading-7 text-[#f7f1e8]/82">{renderTextWithInstagramLinks(item.blurb)}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {timeline.map((item) => (
            <div key={`${item.time}-${item.title}`} className="rounded-3xl border border-[#e3a7a5]/15 bg-[#e3a7a5]/5 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/80">{item.time}</p>
              <p className="mt-3 text-base font-black uppercase text-[#f7f1e8] sm:text-lg">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-[#f7f1e8]/72">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MapSection() { return null }
function HuntSection() { return null }
function InfoSection() { return null }
function ShopSection() { return null }
function Footer() { return null }

export default function MayDayWelcomeCenter() {
  useEffect(() => {
    try {
      const pendingSection = sessionStorage.getItem(HOME_SECTION_TARGET_KEY)
      if (!pendingSection) return

      sessionStorage.removeItem(HOME_SECTION_TARGET_KEY)

      requestAnimationFrame(() => {
        setTimeout(() => {
          const el = document.getElementById(pendingSection)
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }, 50)
      })
    } catch {}
  }, [])

  return (
    <div className="min-h-screen bg-[#264636] pb-24 text-white md:pb-0">
      <NoiseBackground />
      <div className="relative">
        <NavBar />
        <Hero />
        <HomeSection />
        <LaborHistorySection />
        <ScheduleSection />
        <MapSection />
        <HuntSection />
        <ShopSection />
        <InfoSection />
        <SponsorsSection />
        <LiveInstagramTicker />
        <Footer />
        <MobileActionBar />
      </div>
    </div>
  )
}
