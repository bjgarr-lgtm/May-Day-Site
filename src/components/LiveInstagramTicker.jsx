import React, { useEffect, useMemo, useState } from 'react'
import { ExternalLink, Hash, Instagram, Radio, RefreshCw } from 'lucide-react'
import { siteMeta } from '../data/maydayContent'

const HASHTAG = 'MayDayOnTheHarbor'
const HASHTAG_URL = `https://www.instagram.com/explore/tags/${HASHTAG.toLowerCase()}/`

const FALLBACK_ITEMS = [
  {
    id: 'official-instagram',
    source: 'official',
    caption: 'Follow the official event account for live day of posts, reels, and updates.',
    permalink: siteMeta.instagramHref,
    media_url: '',
    timestamp: '',
    username: 'maydayontheharbor',
  },
  {
    id: 'event-hashtag',
    source: 'hashtag',
    caption: `Post with #${HASHTAG} so it can roll into the event feed once the Meta token is wired.`,
    permalink: HASHTAG_URL,
    media_url: '',
    timestamp: '',
    username: `#${HASHTAG}`,
  },
]

function formatTime(value) {
  if (!value) return 'live now'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'live now'
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function FeedCard({ item }) {
  const isHashtag = item.source === 'hashtag'

  return (
    <a
      href={item.permalink || siteMeta.instagramHref}
      target="_blank"
      rel="noreferrer"
      className="group flex min-w-[16rem] max-w-[20rem] snap-start flex-col overflow-hidden rounded-[1.4rem] border border-[#e3a7a5]/18 bg-black/25 transition hover:border-[#e3a7a5]/40 hover:bg-black/35 sm:min-w-[18rem] lg:min-w-[20rem]"
    >
      <div className="flex items-center justify-between border-b border-[#e3a7a5]/10 px-4 py-3">
        <div className="flex items-center gap-2 text-[#f7f1e8]">
          {isHashtag ? <Hash className="h-4 w-4 text-[#e3a7a5]" /> : <Instagram className="h-4 w-4 text-[#e3a7a5]" />}
          <span className="text-[11px] font-black uppercase tracking-[0.16em]">
            {isHashtag ? 'hashtag post' : 'official post'}
          </span>
        </div>
        <ExternalLink className="h-4 w-4 text-[#f7f1e8]/55 transition group-hover:text-[#f7f1e8]" />
      </div>

      {item.media_url ? (
        <div className="aspect-[16/10] w-full overflow-hidden bg-[#102018]">
          <img
            src={item.media_url}
            alt={item.caption || 'Instagram post'}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-[linear-gradient(135deg,rgba(227,167,165,.22),rgba(13,23,19,.92))] px-4 text-center">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#e3a7a5]">live feed ready</p>
            <p className="text-sm leading-6 text-[#f7f1e8]/80">
              {isHashtag ? `watch #${HASHTAG}` : 'official account connection point'}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-xs font-black uppercase tracking-[0.16em] text-[#e3a7a5]/90">
            {item.username || (isHashtag ? `#${HASHTAG}` : '@maydayontheharbor')}
          </p>
          <p className="shrink-0 text-[11px] uppercase tracking-[0.12em] text-[#f7f1e8]/55">{formatTime(item.timestamp)}</p>
        </div>
        <p className="line-clamp-4 text-sm leading-6 text-[#f7f1e8]/82">
          {item.caption || 'Open on Instagram.'}
        </p>
      </div>
    </a>
  )
}

export default function LiveInstagramTicker() {
  const [items, setItems] = useState(FALLBACK_ITEMS)
  const [status, setStatus] = useState('loading')
  const [lastUpdated, setLastUpdated] = useState('')
  const [mode, setMode] = useState('fallback')

  useEffect(() => {
    let ignore = false

    async function loadFeed() {
      try {
        const res = await fetch('/api/live-feed', { headers: { Accept: 'application/json' } })
        if (!res.ok) throw new Error(`Feed request failed: ${res.status}`)
        const data = await res.json()
        if (ignore) return

        const nextItems = Array.isArray(data.items) && data.items.length ? data.items : FALLBACK_ITEMS
        setItems(nextItems)
        setLastUpdated(data.generatedAt || new Date().toISOString())
        setMode(data.mode || 'fallback')
        setStatus(Array.isArray(data.items) && data.items.length ? 'live' : 'fallback')
      } catch {
        if (ignore) return
        setItems(FALLBACK_ITEMS)
        setLastUpdated(new Date().toISOString())
        setMode('fallback')
        setStatus('fallback')
      }
    }

    loadFeed()
    const timer = window.setInterval(loadFeed, 60000)
    return () => {
      ignore = true
      window.clearInterval(timer)
    }
  }, [])

  const itemCountLabel = useMemo(() => {
    if (!items.length) return 'waiting for posts'
    return `${items.length} item${items.length === 1 ? '' : 's'}`
  }, [items])

  const modeLabel = useMemo(() => {
    if (mode === 'meta-live') return 'meta live mode'
    if (mode === 'cached-live') return 'cached live mode'
    return 'fallback mode'
  }, [mode])

  return (
    <section id="live-feed" className="border-t border-[#e3a7a5]/10 bg-black/20">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/75">live feed</p>
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#e3a7a5] sm:text-3xl">
              instagram updates from the harbor
            </h2>
            <p className="text-sm leading-7 text-[#f7f1e8]/84 sm:text-base">
              Day of posts from the official account and anything tagged with <span className="font-black text-[#f7f1e8]">#{HASHTAG}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.14em]">
            <span className="inline-flex min-h-10 items-center rounded-full border border-[#e3a7a5]/18 bg-[#e3a7a5]/10 px-4 py-2 text-[#f7f1e8]">
              <Radio className="mr-2 h-4 w-4 text-[#e3a7a5]" />
              {status === 'live' ? modeLabel : status === 'loading' ? 'loading feed' : 'fallback mode'}
            </span>
            <span className="inline-flex min-h-10 items-center rounded-full border border-[#e3a7a5]/18 bg-black/20 px-4 py-2 text-[#f7f1e8]/80">
              {itemCountLabel}
            </span>
            <span className="inline-flex min-h-10 items-center rounded-full border border-[#e3a7a5]/18 bg-black/20 px-4 py-2 text-[#f7f1e8]/70">
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              {lastUpdated ? `updated ${formatTime(lastUpdated)}` : 'refreshes every minute'}
            </span>
          </div>
        </div>

        <div
          className="flex gap-4 overflow-x-auto pb-2 [scrollbar-color:rgba(227,167,165,.5)_transparent] [scrollbar-width:thin]"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
          }}
        >
          {items.map((item) => (
            <FeedCard key={item.id || item.permalink || item.caption} item={item} />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs font-black uppercase tracking-[0.14em]">
          <a
            href={siteMeta.instagramHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center rounded-full border border-[#e3a7a5]/18 bg-black/20 px-4 py-2 text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"
          >
            <Instagram className="mr-2 h-4 w-4 text-[#e3a7a5]" />
            open official instagram
          </a>
          <a
            href={HASHTAG_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center rounded-full border border-[#e3a7a5]/18 bg-black/20 px-4 py-2 text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"
          >
            <Hash className="mr-2 h-4 w-4 text-[#e3a7a5]" />
            browse #{HASHTAG}
          </a>
        </div>
      </div>
    </section>
  )
}
