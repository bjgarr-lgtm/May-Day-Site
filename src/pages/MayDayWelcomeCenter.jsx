import React, { useMemo, useState } from 'react'
import { Accessibility, CalendarDays, ChevronRight, Clock3, ExternalLink, HeartHandshake, Info, MapPinned, Menu, Search, Shield, ShoppingBag, Users, X } from 'lucide-react'
import NoiseBackground from '../components/mayday/NoiseBackground'
import { highlights, huntCategories, infoCards, mapZones, merchItems, practicalInfo, quickLinks, scheduleItems, siteMeta, timeline } from '../data/maydayContent'

const iconMap = { CalendarDays, MapPinned, Search, Info, ShoppingBag }
const infoIconMap = { 'who this is for': Users, 'health and safety': Shield, 'why may day': HeartHandshake }

function SectionTitle({ eyebrow, title, body }) {
  return (
    <div className="max-w-3xl space-y-3">
      {eyebrow ? <p className="text-xs uppercase tracking-[0.28em] text-[#f0d4d9]/70">{eyebrow}</p> : null}
      <h2 className="text-3xl font-black uppercase tracking-tight text-[#f2c4cf] sm:text-4xl">{title}</h2>
      {body ? <p className="text-base leading-7 text-[#f7f1e8]/88">{body}</p> : null}
    </div>
  )
}

function NavBar() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 border-b border-[#f2c4cf]/15 bg-[#163a2d]/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="#top" className="max-w-[15rem] text-sm font-black uppercase leading-tight tracking-[0.16em] text-[#f2c4cf]">
          may day on the harbor
          <span className="block text-[#f7f1e8]/70">2026 welcome center</span>
        </a>
        <nav className="hidden items-center gap-2 md:flex">
          {quickLinks.map((item) => (
            <a key={item.id} href={`#${item.id}`} className="rounded-full border border-[#f2c4cf]/20 px-4 py-2 text-sm font-semibold text-[#f7f1e8]/85 transition hover:border-[#f2c4cf]/45 hover:bg-[#f2c4cf]/10 hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>
        <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#f2c4cf]/20 text-[#f7f1e8] md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-[#f2c4cf]/10 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {quickLinks.map((item) => (
              <a key={item.id} href={`#${item.id}`} onClick={() => setOpen(false)} className="rounded-2xl border border-[#f2c4cf]/15 px-4 py-3 text-sm font-semibold text-[#f7f1e8]/88">
                {item.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  )
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-[#f2c4cf]/10">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.2fr_.8fr] lg:px-8 lg:py-24">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-[#f7f1e8]/70">{siteMeta.subtitle}</p>
            <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-tight text-[#f2c4cf] sm:text-7xl lg:text-8xl">
              may day
              <span className="block text-[#f7f1e8]">on the harbor</span>
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[#f7f1e8]/88 sm:text-xl">{siteMeta.description}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-semibold uppercase tracking-[0.16em]">
            {[siteMeta.dateLabel, siteMeta.hoursLabel, siteMeta.freeLabel].map((item) => (
              <span key={item} className="rounded-full border border-[#f2c4cf]/25 bg-[#f2c4cf]/10 px-4 py-2 text-[#f7f1e8]">{item}</span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {quickLinks.map((item) => {
              const Icon = iconMap[item.icon]
              return (
                <a key={item.id} href={`#${item.id}`}>
                  <button type="button" className="inline-flex h-12 items-center rounded-full bg-[#f2c4cf] px-5 text-sm font-black uppercase tracking-[0.15em] text-[#153227] transition hover:bg-[#ffd8e1]">
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </button>
                </a>
              )
            })}
          </div>
        </div>
        <div className="rounded-[2rem] border border-[#f2c4cf]/20 bg-black/25 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-[#f2c4cf]/15 bg-[#f2c4cf]/8 p-4">
              <div className="mb-2 flex items-center gap-2 text-[#f2c4cf]"><Clock3 className="h-4 w-4" /><span className="text-xs uppercase tracking-[0.22em]">hours</span></div>
              <p className="text-lg font-bold uppercase text-[#f7f1e8]">noon to midnight</p>
              <p className="mt-2 text-sm text-[#f7f1e8]/72">Vendors through 7 pm, evening film and music later indoors.</p>
            </div>
            <div className="rounded-3xl border border-[#f2c4cf]/15 bg-[#f2c4cf]/8 p-4">
              <div className="mb-2 flex items-center gap-2 text-[#f2c4cf]"><Accessibility className="h-4 w-4" /><span className="text-xs uppercase tracking-[0.22em]">community care</span></div>
              <p className="text-lg font-bold uppercase text-[#f7f1e8]">masks required</p>
              <p className="mt-2 text-sm text-[#f7f1e8]/72">Masks are provided to help keep the event more accessible and safer.</p>
            </div>
          </div>
          <div className="mt-6">
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#f2c4cf]/80">at a glance</p>
            <div className="flex flex-wrap gap-2">
              {highlights.map((item) => (
                <span key={item} className="rounded-full border border-[#f7f1e8]/10 bg-[#0c1914]/80 px-3 py-2 text-sm text-[#f7f1e8]/82">{item}</span>
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
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {infoCards.map((card) => {
          const Icon = infoIconMap[card.title] || Info
          return (
            <div key={card.title} className="rounded-[2rem] border border-[#f2c4cf]/20 bg-black/20 p-6">
              <div className="mb-4 inline-flex rounded-2xl border border-[#f2c4cf]/20 bg-[#f2c4cf]/10 p-3 text-[#f2c4cf]"><Icon className="h-5 w-5" /></div>
              <h3 className="mb-3 text-xl font-black uppercase tracking-tight text-[#f2c4cf]">{card.title}</h3>
              <p className="leading-7 text-[#f7f1e8]/84">{card.body}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ScheduleSection() {
  const [filter, setFilter] = useState('all')
  const filters = useMemo(() => ['all', 'family', 'vendors', 'film', 'music'], [])
  const visibleItems = scheduleItems.filter((item) => filter === 'all' || item.category === filter)
  return (
    <section id="schedule" className="border-y border-[#f2c4cf]/10 bg-black/15">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="schedule" title="day of programming" body="The final schedule can be updated as details lock. This phase one version gives people a clean structure instead of forcing them to decode a poster like it is a sacred prophecy." />
        <div className="mt-8 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full border px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] transition ${filter === item ? 'border-[#f2c4cf] bg-[#f2c4cf] text-[#153227]' : 'border-[#f2c4cf]/20 bg-[#f2c4cf]/5 text-[#f7f1e8]/82 hover:bg-[#f2c4cf]/10'}`}>
              {item}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {visibleItems.map((item) => (
            <div key={`${item.time}-${item.title}`} className="rounded-[2rem] border border-[#f2c4cf]/20 bg-[#163126]/65 p-6">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#f2c4cf]/80">{item.time}</p>
                  <h3 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#f7f1e8]">{item.title}</h3>
                </div>
                <span className="rounded-full bg-[#0d1713] px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#f2c4cf]">{item.area}</span>
              </div>
              <p className="leading-7 text-[#f7f1e8]/82">{item.blurb}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {timeline.map((item) => (
            <div key={`${item.time}-${item.title}`} className="rounded-3xl border border-[#f2c4cf]/15 bg-[#f2c4cf]/5 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[#f2c4cf]/80">{item.time}</p>
              <p className="mt-3 text-lg font-black uppercase text-[#f7f1e8]">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-[#f7f1e8]/72">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MapSection() {
  return (
    <section id="map" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <div className="space-y-6">
          <SectionTitle eyebrow="map" title="find your way around" body="Phase one uses a stylized zone map placeholder. Next pass can swap in the final event map image, clickable areas, zoom, and hunt overlays." />
          <div className="grid gap-3 sm:grid-cols-2">
            {mapZones.map((zone) => (
              <div key={zone.title} className="rounded-3xl border border-[#f2c4cf]/15 bg-black/15 p-4">
                <div className={`mb-3 h-3 w-20 rounded-full ${zone.swatchClassName}`} />
                <h3 className="text-xl font-black uppercase tracking-tight text-[#f2c4cf]">{zone.title}</h3>
                <p className="mt-2 leading-7 text-[#f7f1e8]/82">{zone.blurb}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-[#f2c4cf]/20 bg-black/20 p-4 sm:p-6">
          <div className="rounded-[2rem] border border-[#f7f1e8]/10 bg-[#d9d9d9] p-6 text-[#111] shadow-inner">
            <div className="mx-auto max-w-xl">
              <div className="mx-auto mb-5 w-fit rounded-md border border-black/20 bg-yellow-300 px-4 py-2 text-center text-sm font-bold">welcome center</div>
              <div className="grid grid-cols-5 gap-4">
                <div className="rounded-md bg-lime-300 p-4 text-center text-sm font-bold">activities</div>
                <div className="rounded-md bg-fuchsia-300 p-4 text-center text-sm font-bold">art center</div>
                <div className="rounded-md bg-rose-400 p-4 text-center text-sm font-bold">vendors</div>
                <div className="rounded-md bg-yellow-200 p-4 text-center text-sm font-bold">indoors</div>
                <div className="rounded-md bg-cyan-300 p-4 text-center text-sm font-bold">outdoors</div>
              </div>
              <div className="mt-6 rounded-3xl border-2 border-black/15 bg-white/50 p-6">
                <div className="grid gap-4 sm:grid-cols-5">
                  <div className="min-h-44 rounded-xl bg-lime-300/75 p-3 text-xs font-semibold">activity route</div>
                  <div className="min-h-44 rounded-xl bg-fuchsia-300/75 p-3 text-xs font-semibold">art route</div>
                  <div className="min-h-44 rounded-xl bg-rose-400/75 p-3 text-xs font-semibold">vendor route</div>
                  <div className="min-h-44 rounded-xl bg-yellow-200 p-3 text-xs font-semibold">indoor route</div>
                  <div className="min-h-44 rounded-xl bg-cyan-300/75 p-3 text-xs font-semibold">outdoor route</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HuntSection() {
  return (
    <section id="hunt" className="border-y border-[#f2c4cf]/10 bg-black/15">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr]">
          <div className="space-y-6">
            <SectionTitle eyebrow="scavenger hunt" title="make the hunt part of the site" body="This should live here instead of being stranded across random platforms. Keep the QR code flow, but let the website handle rules, progress, route info, and finish guidance. Much cleaner. Less cursed." />
            <div className="rounded-[2rem] border border-[#f2c4cf]/20 bg-[#163126]/65 p-6">
              <h3 className="text-xl font-black uppercase tracking-tight text-[#f2c4cf]">how it should work</h3>
              <ul className="mt-4 space-y-3 text-[#f7f1e8]/84">
                <li>start at the welcome center and scan the intro code</li>
                <li>pick a route or roam between categories</li>
                <li>each qr lands on a clean page on this site</li>
                <li>progress saves in the browser on your phone</li>
                <li>finish at the welcome center or prize station</li>
              </ul>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {huntCategories.map((item) => (
              <div key={item.title} className="rounded-[2rem] border border-[#f2c4cf]/20 bg-[#11261e] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[#f2c4cf]/80">{item.stops} stops</p>
                <h3 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#f7f1e8]">{item.title}</h3>
                <p className="mt-3 leading-7 text-[#f7f1e8]/78">{item.detail}</p>
                <button type="button" className="mt-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[#f2c4cf]">view route <ChevronRight className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function InfoSection() {
  return (
    <section id="info" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <SectionTitle eyebrow="event info" title="practical details" body="This is where the useful adult information goes, because somebody always needs to know where to park, whether their kid can come, and whether there is a bathroom before they commit to leaving the house." />
          <div className="grid gap-4">
            {practicalInfo.map((item) => (
              <div key={item.title} className="rounded-3xl border border-[#f2c4cf]/15 bg-black/15 p-5">
                <h3 className="text-xl font-black uppercase tracking-tight text-[#f2c4cf]">{item.title}</h3>
                <p className="mt-2 leading-7 text-[#f7f1e8]/82">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-[#f2c4cf]/20 bg-black/20 p-6 sm:p-8">
          <h3 className="text-2xl font-black uppercase tracking-tight text-[#f2c4cf]">stay in the loop</h3>
          <p className="mt-3 max-w-xl leading-7 text-[#f7f1e8]/82">Use this area for final logistics, contact info, last minute updates, and ways to connect people to your mailing list or organizer contact without making them hunt through six different platforms like it is an initiation ritual.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input type="email" placeholder="email address" className="h-12 flex-1 rounded-full border border-[#f2c4cf]/20 bg-[#0f1c17] px-5 text-[#f7f1e8] placeholder:text-[#f7f1e8]/40 focus:outline-none focus:ring-2 focus:ring-[#f2c4cf]/35" />
            <button type="button" className="h-12 rounded-full bg-[#f2c4cf] px-6 text-sm font-black uppercase tracking-[0.14em] text-[#153227] transition hover:bg-[#ffd8e1]">get updates</button>
          </div>
        </div>
      </div>
    </section>
  )
}

function ShopSection() {
  return (
    <section id="shop" className="border-t border-[#f2c4cf]/10 bg-black/15">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle eyebrow="shop" title="support the event" body="Phase one should link cleanly to your existing merch or fundraiser shop instead of rebuilding ecommerce from the bones up one month out. Preview items here, send checkout elsewhere, keep your sanity barely intact." />
          <a href={siteMeta.shopHref} target="_blank" rel="noreferrer">
            <button type="button" className="inline-flex h-12 items-center rounded-full bg-[#f2c4cf] px-6 text-sm font-black uppercase tracking-[0.14em] text-[#153227] transition hover:bg-[#ffd8e1]">open shop <ExternalLink className="ml-2 h-4 w-4" /></button>
          </a>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {merchItems.map((item) => (
            <div key={item.title} className="rounded-[2rem] border border-[#f2c4cf]/20 bg-[#11261e] p-5">
              <div className="mb-4 aspect-[4/3] rounded-[1.5rem] border border-[#f2c4cf]/15 bg-[linear-gradient(135deg,rgba(242,196,207,.28),rgba(0,0,0,.12))]" />
              <h3 className="text-2xl font-black uppercase tracking-tight text-[#f7f1e8]">{item.title}</h3>
              <p className="mt-3 leading-7 text-[#f7f1e8]/78">{item.desc}</p>
              <button type="button" className="mt-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[#f2c4cf]">{item.cta} <ChevronRight className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-[#f2c4cf]/10">
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-[#f7f1e8]/64 sm:px-6 lg:px-8">
        <p className="font-semibold uppercase tracking-[0.16em] text-[#f2c4cf]">may day on the harbor 2026</p>
        <p className="mt-3 max-w-3xl leading-7">Built as a phase one event site scaffold with room for final copy, real maps, shop links, and the complete scavenger hunt system.</p>
      </div>
    </footer>
  )
}

export default function MayDayWelcomeCenter() {
  return (
    <div className="min-h-screen bg-[#1d4a39] text-white">
      <NoiseBackground />
      <div className="relative">
        <NavBar />
        <Hero />
        <HomeSection />
        <ScheduleSection />
        <MapSection />
        <HuntSection />
        <InfoSection />
        <ShopSection />
        <Footer />
      </div>
    </div>
  )
}
