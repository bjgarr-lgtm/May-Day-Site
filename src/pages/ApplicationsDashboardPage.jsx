import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BarChart3, ClipboardList, Eye, EyeOff, Hash, Instagram, Lock, RefreshCw, RadioTower, Save, Search, Ticket } from 'lucide-react'
import { huntRoutes } from '../data/huntData'
import { applyRuntimeToRoutes, buildRuntimeSettingsMap } from '../lib/huntTickets'

const STORAGE_KEY = 'maydayApplicationsPassword'
const filterOptions = [
  { value: 'all', label: 'all submissions' },
  { value: 'vendor', label: 'vendors' },
  { value: 'performer', label: 'performers' },
]
const tabOptions = [
  { value: 'overview', label: 'overview', icon: BarChart3 },
  { value: 'applications', label: 'applications', icon: ClipboardList },
  { value: 'live-ops', label: 'live ops', icon: RadioTower },
  { value: 'feed-ops', label: 'feed ops', icon: Instagram },
  { value: 'hunt-ops', label: 'hunt ops', icon: Save },
  { value: 'tickets', label: 'tickets', icon: Ticket },
]

function formatDate(value) {
  if (!value) return ''
  try { return new Date(value).toLocaleString() } catch { return value }
}
function Label({ children }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e3a7a5]/76">{children}</p>
}
function StatCard({ label, value, subtext }) {
  return <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5"><p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">{label}</p><p className="mt-3 text-4xl font-black uppercase tracking-tight text-[#f7f1e8]">{value}</p>{subtext ? <p className="mt-2 text-sm leading-6 text-[#f7f1e8]/68">{subtext}</p> : null}</div>
}
function SubmissionCard({ item }) {
  const payload = item.payload || {}
  const typeLabel = item.submission_type === 'performer' ? 'performer' : 'vendor'
  return (
    <article className="rounded-[1.75rem] border border-[#e3a7a5]/18 bg-black/20 p-5 sm:p-6">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">{typeLabel}</p>
      <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#f7f1e8]">{item.subject_name || item.contact_name || 'untitled submission'}</h2>
      <p className="mt-2 text-sm text-[#f7f1e8]/62">{formatDate(item.created_at)}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div><Label>contact</Label><p className="mt-1 text-sm text-[#f7f1e8]/84">{item.contact_name || ''}</p></div>
        <div><Label>email</Label><p className="mt-1 text-sm text-[#f7f1e8]/84">{item.email || ''}</p></div>
        <div><Label>subject</Label><p className="mt-1 text-sm text-[#f7f1e8]/84">{item.subject_name || ''}</p></div>
        <div><Label>links</Label><p className="mt-1 text-sm text-[#f7f1e8]/84">{payload.links || payload.website || ''}</p></div>
      </div>
    </article>
  )
}

function FeedItemCard({ item, hidden, onToggleHidden }) {
  return (
    <article className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">
            {item.source === 'hashtag' ? 'hashtag' : 'official'}
          </p>
          <h3 className="mt-2 truncate text-lg font-black uppercase tracking-tight text-[#f7f1e8]">
            {item.username || 'instagram post'}
          </h3>
          <p className="mt-1 text-xs text-[#f7f1e8]/58">{formatDate(item.timestamp)}</p>
        </div>
        <button
          type="button"
          onClick={onToggleHidden}
          className={`inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${hidden ? 'border-[#e3a7a5] bg-[#e3a7a5] text-[#264636]' : 'border-[#e3a7a5]/18 bg-black/20 text-[#f7f1e8] hover:bg-[#e3a7a5]/10'}`}
        >
          {hidden ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
          {hidden ? 'show post' : 'hide post'}
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start">
        {item.media_url ? (
          <img
            src={item.media_url}
            alt={item.caption || 'Instagram post'}
            className="h-36 w-full rounded-[1rem] border border-[#e3a7a5]/15 object-cover lg:h-28"
          />
        ) : (
          <div className="flex h-36 w-full items-center justify-center rounded-[1rem] border border-[#e3a7a5]/15 bg-black/15 text-xs uppercase tracking-[0.16em] text-[#f7f1e8]/48 lg:h-28">
            no image
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm leading-6 text-[#f7f1e8]/82">{item.caption || 'No caption found.'}</p>
          <div className="mt-3 break-all text-xs leading-5 text-[#f7f1e8]/56">{item.permalink || ''}</div>
        </div>
      </div>
    </article>
  )
}

export default function ApplicationsDashboardPage() {
  const [tab, setTab] = useState('overview')
  const [filter, setFilter] = useState('all')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [password, setPassword] = useState(() => { try { return sessionStorage.getItem(STORAGE_KEY) || '' } catch { return '' } })
  const [inputPassword, setInputPassword] = useState(() => { try { return sessionStorage.getItem(STORAGE_KEY) || '' } catch { return '' } })
  const [runtimeState, setRuntimeState] = useState({ liveMode: false, announcement: { enabled: false, text: '', level: 'info' }, happeningNow: '', upNext: '' })
  const [runtimeSaveStatus, setRuntimeSaveStatus] = useState('idle')
  const [runtimeError, setRuntimeError] = useState('')
  const [huntSettings, setHuntSettings] = useState([])
  const [huntSaveStatus, setHuntSaveStatus] = useState('idle')
  const [ticketLookupKey, setTicketLookupKey] = useState('')
  const [ticketLookupState, setTicketLookupState] = useState(null)
  const [ticketLookupError, setTicketLookupError] = useState('')
  const [ticketAdjustAmount, setTicketAdjustAmount] = useState('0')
  const [ticketAdjustMode, setTicketAdjustMode] = useState('claimed')
  const [feedConfig, setFeedConfig] = useState({ hashtagEnabled: false, hiddenPermalinks: [] })
  const [feedItems, setFeedItems] = useState([])
  const [feedGeneratedAt, setFeedGeneratedAt] = useState('')
  const [feedSaveStatus, setFeedSaveStatus] = useState('idle')
  const [feedError, setFeedError] = useState('')

  const endpoint = useMemo(() => {
    const query = filter === 'all' ? '' : `?type=${encodeURIComponent(filter)}`
    return `/api/forms/submissions${query}`
  }, [filter])

  async function loadSubmissions(currentPassword = password) {
    if (!currentPassword) {
      setStatus('locked')
      setItems([])
      return
    }
    setStatus('loading')
    setError('')
    try {
      const response = await fetch(endpoint, { headers: { Accept: 'application/json', 'x-applications-password': currentPassword } })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'Could not load submissions.')
      setItems(Array.isArray(data?.items) ? data.items : [])
      setStatus('ready')
    } catch (err) {
      setItems([])
      setStatus('locked')
      setError(err?.message || 'Could not load submissions.')
      try { sessionStorage.removeItem(STORAGE_KEY) } catch {}
      setPassword('')
    }
  }

  async function loadRuntimeState(currentPassword = password) {
    if (!currentPassword) return
    try {
      const response = await fetch('/api/runtime/admin', { headers: { Accept: 'application/json', 'x-applications-password': currentPassword } })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'Could not load live ops.')
      if (data?.state) setRuntimeState(data.state)
    } catch (err) {
      setRuntimeError(err?.message || 'Could not load live ops.')
    }
  }

  async function loadHuntSettings(currentPassword = password) {
    if (!currentPassword) return
    try {
      const response = await fetch('/api/hunt/admin', { headers: { Accept: 'application/json', 'x-applications-password': currentPassword } })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'Could not load hunt ops.')
      setHuntSettings(Array.isArray(data?.settings) ? data.settings : [])
    } catch (err) {
      setRuntimeError(err?.message || 'Could not load hunt ops.')
    }
  }

  async function loadFeedOps(currentPassword = password) {
    if (!currentPassword) return
    setFeedError('')
    try {
      const response = await fetch('/api/instagram/admin', { headers: { Accept: 'application/json', 'x-applications-password': currentPassword } })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'Could not load feed ops.')
      setFeedConfig(data?.config || { hashtagEnabled: false, hiddenPermalinks: [] })
      setFeedItems(Array.isArray(data?.items) ? data.items : [])
      setFeedGeneratedAt(data?.generatedAt || '')
    } catch (err) {
      setFeedError(err?.message || 'Could not load feed ops.')
    }
  }

  useEffect(() => {
    if (password) {
      loadSubmissions(password)
      loadRuntimeState(password)
      loadHuntSettings(password)
      loadFeedOps(password)
    } else {
      setStatus('locked')
    }
  }, [endpoint, password])

  function unlock(event) {
    event.preventDefault()
    const next = inputPassword.trim()
    if (!next) return
    try { sessionStorage.setItem(STORAGE_KEY, next) } catch {}
    setPassword(next)
    setError('')
    setRuntimeError('')
    setFeedError('')
  }

  function lockNow() {
    try { sessionStorage.removeItem(STORAGE_KEY) } catch {}
    setPassword('')
    setInputPassword('')
    setItems([])
    setStatus('locked')
    setError('')
    setFeedError('')
  }

  function updateRuntime(path, value) {
    if (path === 'liveMode') { setRuntimeState((current) => ({ ...current, liveMode: value })); return }
    if (path.startsWith('announcement.')) {
      const key = path.split('.')[1]
      setRuntimeState((current) => ({ ...current, announcement: { ...current.announcement, [key]: value } }))
      return
    }
    setRuntimeState((current) => ({ ...current, [path]: value }))
  }

  async function saveRuntimeState() {
    setRuntimeSaveStatus('saving')
    setRuntimeError('')
    try {
      const response = await fetch('/api/runtime/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-applications-password': password },
        body: JSON.stringify(runtimeState),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'Could not save live ops.')
      setRuntimeSaveStatus('saved')
    } catch (err) {
      setRuntimeSaveStatus('idle')
      setRuntimeError(err?.message || 'Could not save live ops.')
    }
  }

  const mergedRoutes = useMemo(() => {
    const settingsMap = buildRuntimeSettingsMap(huntSettings)
    return applyRuntimeToRoutes(huntRoutes, settingsMap)
  }, [huntSettings])

  function updateStopSetting(routeSlug, stopId, field, value) {
    setHuntSettings((current) => {
      const next = [...current]
      const index = next.findIndex((item) => item.routeSlug === routeSlug && item.stopId === stopId)
      const parsedValue = field === 'difficulty' || field === 'ticketValue' ? Number(value || 0) : field === 'revealNextInUI' ? !!value : value
      if (index === -1) {
        next.push({ routeSlug, stopId, [field]: parsedValue })
      } else {
        next[index] = { ...next[index], [field]: parsedValue }
      }
      return next
    })
  }

  async function saveHuntSettings() {
    setHuntSaveStatus('saving')
    try {
      const response = await fetch('/api/hunt/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-applications-password': password },
        body: JSON.stringify({ action: 'upsert_settings', settings: huntSettings }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'Could not save hunt settings.')
      setHuntSettings(Array.isArray(data?.settings) ? data.settings : huntSettings)
      setHuntSaveStatus('saved')
    } catch (err) {
      setHuntSaveStatus('idle')
      setRuntimeError(err?.message || 'Could not save hunt settings.')
    }
  }

  async function lookupTickets() {
    if (!ticketLookupKey.trim()) return
    setTicketLookupError('')
    try {
      const response = await fetch(`/api/hunt/admin?playerKey=${encodeURIComponent(ticketLookupKey.trim())}`, { headers: { Accept: 'application/json', 'x-applications-password': password } })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'Could not load ticket lookup.')
      setTicketLookupState(data)
    } catch (err) {
      setTicketLookupError(err?.message || 'Could not load ticket lookup.')
    }
  }

  async function adjustTickets() {
    const amount = Number(ticketAdjustAmount || 0)
    if (!ticketLookupKey.trim() || amount <= 0) return
    setTicketLookupError('')
    try {
      const response = await fetch('/api/hunt/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-applications-password': password },
        body: JSON.stringify({ action: 'redeem_tickets', playerKey: ticketLookupKey.trim(), amount, mode: ticketAdjustMode }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'Could not update ticket status.')
      setTicketLookupState(data)
    } catch (err) {
      setTicketLookupError(err?.message || 'Could not update ticket status.')
    }
  }

  function toggleHiddenPermalink(permalink) {
    setFeedConfig((current) => {
      const hidden = new Set(current.hiddenPermalinks || [])
      if (hidden.has(permalink)) hidden.delete(permalink)
      else hidden.add(permalink)
      return { ...current, hiddenPermalinks: Array.from(hidden) }
    })
  }

  async function saveFeedConfig() {
    setFeedSaveStatus('saving')
    setFeedError('')
    try {
      const response = await fetch('/api/instagram/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-applications-password': password },
        body: JSON.stringify(feedConfig),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'Could not save feed ops.')
      setFeedConfig(data?.config || feedConfig)
      setFeedSaveStatus('saved')
      await loadFeedOps(password)
    } catch (err) {
      setFeedSaveStatus('idle')
      setFeedError(err?.message || 'Could not save feed ops.')
    }
  }

  const vendorCount = items.filter((item) => item.submission_type === 'vendor').length
  const performerCount = items.filter((item) => item.submission_type === 'performer').length
  const hiddenPermalinks = new Set(feedConfig.hiddenPermalinks || [])
  const visibleFeedCount = feedItems
    .filter((item) => item.source !== 'hashtag' || feedConfig.hashtagEnabled)
    .filter((item) => !hiddenPermalinks.has(item.permalink)).length
  const hashtagCount = feedItems.filter((item) => item.source === 'hashtag').length

  return (
    <div className="min-h-screen bg-[#264636] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center rounded-full border border-[#e3a7a5]/20 bg-black/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10">
            <ArrowLeft className="mr-2 h-4 w-4" />
            back to may day
          </Link>
          <div className="flex flex-wrap gap-2">
            {password ? (
              <>
                <button type="button" onClick={() => { loadSubmissions(password); loadRuntimeState(password); loadHuntSettings(password); loadFeedOps(password) }} className="inline-flex items-center rounded-full border border-[#e3a7a5]/20 bg-black/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10">
                  <RefreshCw className="mr-2 h-4 w-4" />refresh
                </button>
                <button type="button" onClick={lockNow} className="inline-flex items-center rounded-full border border-[#e3a7a5]/20 bg-black/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10">
                  <Lock className="mr-2 h-4 w-4" />lock
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#e3a7a5]/18 bg-black/20 p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/80">admin</p>
              <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#e3a7a5] sm:text-5xl">may day admin</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#f7f1e8]/84">Forms, live ops, hunt stop settings, ticket redemption, and feed controls without making you edit code on event day.</p>
            </div>
            {password ? (
              <div className="flex flex-wrap gap-2">
                {tabOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <button key={option.value} type="button" onClick={() => setTab(option.value)} className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-black uppercase tracking-[0.14em] transition ${tab === option.value ? 'border-[#e3a7a5] bg-[#e3a7a5] text-[#264636]' : 'border-[#e3a7a5]/18 bg-black/20 text-[#f7f1e8] hover:bg-[#e3a7a5]/10'}`}>
                      <Icon className="mr-2 h-4 w-4" />{option.label}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>

          {!password ? (
            <form onSubmit={unlock} className="mt-8 max-w-xl rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5 sm:p-6">
              <div className="flex items-center gap-3 text-[#e3a7a5]"><Lock className="h-5 w-5" /><h2 className="text-lg font-black uppercase tracking-tight">admin password required</h2></div>
              <label className="mt-4 block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#e3a7a5]/76">admin password</span>
                <input type="password" value={inputPassword} onChange={(event) => setInputPassword(event.target.value)} className="w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8] outline-none" required />
              </label>
              {error ? <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
              <div className="mt-4"><button type="submit" className="inline-flex min-h-12 items-center rounded-full bg-[#e3a7a5] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#264636]">unlock admin</button></div>
            </form>
          ) : null}

          {password && tab === 'overview' ? (
            <div className="mt-8 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="total submissions" value={items.length} subtext="Everything currently visible in admin." />
                <StatCard label="vendors" value={vendorCount} subtext="Vendor or organization applications." />
                <StatCard label="performers" value={performerCount} subtext="Band, performer, or artist applications." />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="hunt routes" value={mergedRoutes.length} subtext="Five route hunt now active." />
                <StatCard label="stops" value={mergedRoutes.reduce((sum, route) => sum + route.stops.length, 0)} subtext="Ticketed progression stops." />
                <StatCard label="visible feed posts" value={visibleFeedCount} subtext="Current homepage feed output." />
              </div>
            </div>
          ) : null}

          {password && tab === 'applications' ? (
            <div className="mt-8">
              <div className="mb-5 flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <button key={option.value} type="button" onClick={() => setFilter(option.value)} className={`rounded-full border px-4 py-2 text-sm font-black uppercase tracking-[0.14em] transition ${filter === option.value ? 'border-[#e3a7a5] bg-[#e3a7a5] text-[#264636]' : 'border-[#e3a7a5]/18 bg-black/20 text-[#f7f1e8] hover:bg-[#e3a7a5]/10'}`}>
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="grid gap-4">
                {items.map((item) => <SubmissionCard key={item.id} item={item} />)}
              </div>
            </div>
          ) : null}

          {password && tab === 'live-ops' ? (
            <div className="mt-8 space-y-6">
              <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5">
                <label className="inline-flex items-center gap-3 text-sm text-[#f7f1e8]/86">
                  <input type="checkbox" checked={runtimeState.liveMode} onChange={(event) => updateRuntime('liveMode', event.target.checked)} />
                  force site into live mode
                </label>
                <label className="mt-4 block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#e3a7a5]/76">banner text</span>
                  <textarea rows={3} value={runtimeState.announcement?.text || ''} onChange={(event) => updateRuntime('announcement.text', event.target.value)} className="w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8]" />
                </label>
              </div>
              {runtimeError ? <div className="rounded-[1.5rem] border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">{runtimeError}</div> : null}
              <div><button type="button" onClick={saveRuntimeState} className="inline-flex min-h-12 items-center rounded-full bg-[#e3a7a5] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#264636]"><Save className="mr-2 h-4 w-4" />{runtimeSaveStatus === 'saving' ? 'saving...' : 'save live ops'}</button></div>
            </div>
          ) : null}

          {password && tab === 'feed-ops' ? (
            <div className="mt-8 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="current feed items" value={feedItems.length} subtext={feedGeneratedAt ? `last ingest ${formatDate(feedGeneratedAt)}` : 'Waiting for desktop watcher.'} />
                <StatCard label="visible on homepage" value={visibleFeedCount} subtext="After source toggles and hidden post filtering." />
                <StatCard label="hashtag items" value={hashtagCount} subtext="Kept ingested even when hidden." />
              </div>

              <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <h2 className="text-xl font-black uppercase tracking-tight text-[#e3a7a5]">feed switches</h2>
                    <p className="mt-2 text-sm leading-7 text-[#f7f1e8]/78">Leave the desktop watcher running and control what the homepage actually shows here instead of editing code every time the hashtag gets weird.</p>
                  </div>
                  <button type="button" onClick={() => loadFeedOps(password)} className="inline-flex min-h-11 items-center rounded-full border border-[#e3a7a5]/18 bg-black/20 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10">
                    <RefreshCw className="mr-2 h-4 w-4" />reload feed
                  </button>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <label className="inline-flex items-center gap-3 rounded-[1.25rem] border border-[#e3a7a5]/18 bg-black/15 px-4 py-4 text-sm text-[#f7f1e8]/86">
                    <input type="checkbox" checked={feedConfig.hashtagEnabled} onChange={(event) => setFeedConfig((current) => ({ ...current, hashtagEnabled: event.target.checked }))} />
                    <span className="inline-flex items-center"><Hash className="mr-2 h-4 w-4 text-[#e3a7a5]" />show hashtag posts on homepage</span>
                  </label>
                  <div className="rounded-[1.25rem] border border-[#e3a7a5]/18 bg-black/15 px-4 py-4 text-sm text-[#f7f1e8]/84">
                    <p className="font-black uppercase tracking-[0.12em] text-[#e3a7a5]">hidden post count</p>
                    <p className="mt-2 text-2xl font-black uppercase tracking-tight text-[#f7f1e8]">{hiddenPermalinks.size}</p>
                  </div>
                </div>

                {feedError ? <div className="mt-5 rounded-[1.25rem] border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">{feedError}</div> : null}

                <div className="mt-5">
                  <button type="button" onClick={saveFeedConfig} className="inline-flex min-h-12 items-center rounded-full bg-[#e3a7a5] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#264636]">
                    <Save className="mr-2 h-4 w-4" />{feedSaveStatus === 'saving' ? 'saving...' : 'save feed ops'}
                  </button>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {feedItems.map((item) => (
                  <FeedItemCard
                    key={item.permalink || item.id}
                    item={item}
                    hidden={hiddenPermalinks.has(item.permalink)}
                    onToggleHidden={() => toggleHiddenPermalink(item.permalink)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {password && tab === 'hunt-ops' ? (
            <div className="mt-8 space-y-8">
              {mergedRoutes.map((route) => (
                <div key={route.slug} className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5 sm:p-6">
                  <h2 className="text-2xl font-black uppercase tracking-tight text-[#e3a7a5]">{route.title}</h2>
                  <div className="mt-5 grid gap-4">
                    {route.stops.map((stop) => (
                      <div key={stop.id} className="rounded-[1.25rem] border border-[#e3a7a5]/18 bg-black/15 p-4">
                        <p className="text-sm font-black uppercase tracking-[0.12em] text-[#f7f1e8]">{stop.number}. {stop.title}</p>
                        <div className="mt-4 grid gap-4 lg:grid-cols-6">
                          <label className="block"><span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">difficulty</span><input type="number" value={stop.difficulty || 0} onChange={(e) => updateStopSetting(route.slug, stop.id, 'difficulty', e.target.value)} className="w-full rounded-xl border border-[#e3a7a5]/18 bg-black/20 px-3 py-2 text-sm text-[#f7f1e8]" /></label>
                          <label className="block"><span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">ticket value</span><input type="number" value={stop.ticketValue || 0} onChange={(e) => updateStopSetting(route.slug, stop.id, 'ticketValue', e.target.value)} className="w-full rounded-xl border border-[#e3a7a5]/18 bg-black/20 px-3 py-2 text-sm text-[#f7f1e8]" /></label>
                          <label className="block"><span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">mode</span><select value={stop.validationMode || 'manual'} onChange={(e) => updateStopSetting(route.slug, stop.id, 'validationMode', e.target.value)} className="w-full rounded-xl border border-[#e3a7a5]/18 bg-black/20 px-3 py-2 text-sm text-[#f7f1e8]"><option value="answer">answer</option><option value="volunteer">volunteer</option><option value="onsite_qr_only">onsite qr only</option><option value="manual">manual</option></select></label>
                          <label className="block"><span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">volunteer code</span><input value={stop.volunteerCode || ''} onChange={(e) => updateStopSetting(route.slug, stop.id, 'volunteerCode', e.target.value)} className="w-full rounded-xl border border-[#e3a7a5]/18 bg-black/20 px-3 py-2 text-sm text-[#f7f1e8]" /></label>
                          <label className="block"><span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">proof answer</span><input value={stop.proofAnswer || ''} onChange={(e) => updateStopSetting(route.slug, stop.id, 'proofAnswer', e.target.value)} className="w-full rounded-xl border border-[#e3a7a5]/18 bg-black/20 px-3 py-2 text-sm text-[#f7f1e8]" /></label>
                          <label className="inline-flex items-center gap-2 pt-7 text-sm text-[#f7f1e8]/84"><input type="checkbox" checked={stop.revealNextInUI !== false} onChange={(e) => updateStopSetting(route.slug, stop.id, 'revealNextInUI', e.target.checked)} />reveal next in UI</label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div><button type="button" onClick={saveHuntSettings} className="inline-flex min-h-12 items-center rounded-full bg-[#e3a7a5] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#264636]"><Save className="mr-2 h-4 w-4" />{huntSaveStatus === 'saving' ? 'saving...' : 'save hunt ops'}</button></div>
            </div>
          ) : null}

          {password && tab === 'tickets' ? (
            <div className="mt-8 space-y-6">
              <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5 sm:p-6">
                <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                  <div>
                    <Label>player key</Label>
                    <input value={ticketLookupKey} onChange={(e) => setTicketLookupKey(e.target.value)} className="mt-2 w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8]" placeholder="MDH-ABC123" />
                  </div>
                  <div className="pt-6"><button type="button" onClick={lookupTickets} className="inline-flex min-h-12 items-center rounded-full bg-[#e3a7a5] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#264636]"><Search className="mr-2 h-4 w-4" />lookup</button></div>
                </div>
                {ticketLookupError ? <p className="mt-4 text-sm text-[#ffb0b0]">{ticketLookupError}</p> : null}
              </div>

              {ticketLookupState?.summary ? (
                <>
                  <div className="grid gap-4 md:grid-cols-4">
                    <StatCard label="earned" value={ticketLookupState.summary.earnedTotal || 0} />
                    <StatCard label="claimed" value={ticketLookupState.summary.claimedTotal || 0} />
                    <StatCard label="spent" value={ticketLookupState.summary.spentTotal || 0} />
                    <StatCard label="available" value={ticketLookupState.summary.availableTotal || 0} />
                  </div>
                  <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5 sm:p-6">
                    <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                      <label className="block"><span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">amount</span><input type="number" value={ticketAdjustAmount} onChange={(e) => setTicketAdjustAmount(e.target.value)} className="w-full rounded-xl border border-[#e3a7a5]/18 bg-black/20 px-3 py-2 text-sm text-[#f7f1e8]" /></label>
                      <label className="block"><span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">mode</span><select value={ticketAdjustMode} onChange={(e) => setTicketAdjustMode(e.target.value)} className="w-full rounded-xl border border-[#e3a7a5]/18 bg-black/20 px-3 py-2 text-sm text-[#f7f1e8]"><option value="claimed">claimed</option><option value="spent">spent</option></select></label>
                      <div className="pt-6"><button type="button" onClick={adjustTickets} className="inline-flex min-h-11 items-center rounded-full border border-[#e3a7a5]/18 bg-[#e3a7a5]/10 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8]">apply</button></div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {(ticketLookupState.ledger || []).map((entry) => (
                        <div key={entry.id} className="rounded-xl border border-[#e3a7a5]/18 bg-black/15 px-4 py-3 text-sm text-[#f7f1e8]/84">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="font-black uppercase tracking-[0.12em] text-[#e3a7a5]">{entry.event_type}</span>
                            <span>{entry.amount}</span>
                          </div>
                          <div className="mt-1 text-xs text-[#f7f1e8]/62">{entry.route_slug || ''} {entry.stop_id || ''} {entry.created_at || ''}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
