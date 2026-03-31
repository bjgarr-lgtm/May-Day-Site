import React from 'react'
import { ExternalLink } from 'lucide-react'

const sponsors2026 = [
  {
    name: 'Historical Seaport',
    href: 'https://historicalseaport.org/',
    logoSrc: '/sponsors/historical-seaport.png',
    logoAlt: 'Historical Seaport logo',
  },
  {
    name: 'Blackflower Collective',
    href: 'http://blackflowercollective.noblogs.org/',
    logoSrc: '/sponsors/blackflower-collective.png',
    logoAlt: 'Blackflower Collective logo',
  },
]

const sponsors2025 = [
  {
    name: 'Historical Seaport',
    href: 'https://historicalseaport.org/',
  },
  {
    name: 'Blackflower Collective',
    href: 'http://blackflowercollective.noblogs.org/',
  },
  {
    name: 'Go Grays Harbor',
    href: 'https://www.gograysharbor.com/',
  },
  {
    name: 'Tokeland Hotel',
    href: 'https://www.tokelandhotel.com/',
  },
]

export default function SponsorsSection() {
  return (
    <section className="border-t border-[#e3a7a5]/10 bg-black/20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[#e3a7a5]/18 bg-[#183126]/45 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/80">
            2026 sponsors
          </p>
          <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-[#f7f1e8] sm:text-4xl">
            supporting this year
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#f7f1e8]/76 sm:text-base">
            The people and organizations helping make this year happen.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {sponsors2026.map((sponsor) => (
              <a
                key={sponsor.name}
                href={sponsor.href}
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-[12rem] flex-col items-center justify-center rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 px-6 py-6 text-center transition hover:bg-[#e3a7a5]/10"
              >
                <div className="flex h-24 items-center justify-center">
                  <img
                    src={sponsor.logoSrc}
                    alt={sponsor.logoAlt}
                    className="max-h-24 max-w-full object-contain"
                  />
                </div>
                <div className="mt-5 inline-flex items-center gap-2 text-lg font-black uppercase tracking-[0.06em] text-[#f7f1e8]">
                  <span>{sponsor.name}</span>
                  <ExternalLink className="h-4 w-4 opacity-70 transition group-hover:opacity-100" />
                </div>
              </a>
            ))}
          </div>

          <div className="mt-10 border-t border-[#e3a7a5]/10 pt-6">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#e3a7a5]/62">
              2025 sponsors
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#f7f1e8]/62">
              {sponsors2025.map((sponsor, index) => (
                <React.Fragment key={sponsor.name}>
                  <a
                    href={sponsor.href}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-[#e3a7a5]/30 underline-offset-4 transition hover:text-[#f7f1e8]"
                  >
                    {sponsor.name}
                  </a>
                  {index < sponsors2025.length - 1 ? <span className="text-[#e3a7a5]/35">•</span> : null}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}