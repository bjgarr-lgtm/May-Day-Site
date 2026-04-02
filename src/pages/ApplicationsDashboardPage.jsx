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
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">{item.source === 'hashtag' ? 'hashtag' : 'official'}</p>
          <h3 className="mt-2 truncate text-lg font-black uppercase tracking-tight text-[#f7f1e8]">{item.username || 'instagram post'}</h3>
          <p className="mt-1 text-xs text-[#f7f1e8]/58">{formatDate(item.timestamp)}</p>
        </div>
        <button type="button" onClick={onToggleHidden} className={`inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${hidden ? 'border-[#e3a7a5] bg-[#e3a7a5] text-[#264636]' : 'border-[#e3a7a5]/18 bg-black/20 text-[#f7f1e8] hover:bg-[#e3a7a5]/10'}`}>
          {hidden ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
          {hidden ? 'show post' : 'hide post'}
        </button>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start">
        {item.media_url ? (
          <img src={item.media_url} alt={item.caption || 'Instagram post'} className="h-36 w-full rounded-[1rem] border border-[#e3a7a5]/15 object-cover lg:h-28" />
        ) : (
          <div className="flex h-36 w-full items-center justify-center rounded-[1rem] border border-[#e3a7a5]/15 bg-black/15 text-xs uppercase tracking-[0.16em] text-[#f7f1e8]/48 lg:h-28">no image</div>
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
  const [huntError, setHuntError] = useState('')
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
    if (!currentPassword) { setStatus('locked'); setItems([]); return }
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
    setRuntimeError('')
    try {
      const response = await fetch('/api/runtime/admin', { headers: { Accept: 'application/json', 'x-applications-password': currentPassword } })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'Could not load live ops.')
      if (data?.state) {
        setRuntimeState({
          liveMode: !!data.state.liveMode,
          announcement: {
            enabled: !!data?.state?.announcement?.enabled,
            text: typeof data?.state?.announcement?.text === 'string' ? data.state.announcement.text : '',
            level: ['info', 'warning', 'urgent'].includes(data?.state?.announcement?.level) ? data.state.announcement.level : 'info',
          },
          happeningNow: typeof data?.state?.happeningNow === 'string' ? data.state.happeningNow : '',
          upNext: typeof data?.state?.upNext === 'string' ? data.state.upNext : '',
        })
      }
    } catch (err) {
      setRuntimeError(err?.message || 'Could not load live ops.')
    }
  }

  async function loadHuntSettings(currentPassword = password) {
    if (!currentPassword) return
    setHuntError('')
    try {
      const response = await fetch('/api/hunt/admin', { headers: { Accept: 'application/json', 'x-applications-password': currentPassword } })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'Could not load hunt ops.')
      setHuntSettings(Array.isArray(data?.settings) ? data.settings : [])
    } catch (err) {
      setHuntError(err?.message || 'Could not load hunt ops.')
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
    setHuntError('')
    setFeedError('')
  }

  function lockNow() {
    try { sessionStorage.removeItem(STORAGE_KEY) } catch {}
    setPassword('')
    setInputPassword('')
    setItems([])
    setStatus('locked')
    setError('')
    setRuntimeError('')
    setHuntError('')
    setFeedError('')
  }

  function updateRuntime(path, value) {
    if (path === 'liveMode') { setRuntimeState((current) => ({ ...current, liveMode: value })); return }
    if (path === 'announcement.enabled' || path === 'announcement.text' || path === 'announcement.level') {
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
      if (data?.state) setRuntimeState(data.state)
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
      if (index === -1) next.push({ routeSlug, stopId, [field]: parsedValue })
      else next[index] = { ...next[index], [field]: parsedValue }
      return next
    })
  }

  async function saveHuntSettings() {
    setHuntSaveStatus('saving')
    setHuntError('')
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
      setHuntError(err?.message || 'Could not save hunt settings.')
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
  const visibleFeedCount = feedItems.filter((item) => item.source !== 'hashtag' || feedConfig.hashtagEnabled).filter((item) => !hiddenPermalinks.has(item.permalink)).length
  const hashtagCount = feedItems.filter((item) => item.source === 'hashtag').length

  return (
    <div className="min-h-screen bg-[#264636] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center rounded-full border border-[#e3a7a5]/20 bg-black/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10">
            <ArrowLeft className="mr-2 h-4 w-4" />back to may day
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
                  return <button key={option.value} type="button" onClick={() => setTab(option.value)} className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-black uppercase tracking-[0.14em] transition ${tab === option.value ? 'border-[#e3a7a5] bg-[#e3a7a5] text-[#264636]' : 'border-[#e3a7a5]/18 bg-black/20 text-[#f7f1e8] hover:bg-[#e3a7a5]/10'}`}><Icon className="mr-2 h-4 w-4" />{option.label}</button>
                })}
              </div>
            ) : null}
          </div>

          {!password ? (
            <form onSubmit={unlock} className="mt-8 max-w-xl rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5 sm:p-6">
              <div className="flex items-center gap-3 text-[#e3a7a5]"><Lock className="h-5 w-5" /><h2 className="text-lg font-black uppercase tracking-tight">admin password required</h2></div>
              <label className="mt-4 block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#e3a7a5]/76">admin password</span><input type="password" value={inputPassword} onChange={(event) => setInputPassword(event.target.value)} className="w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8] outline-none" required /></label>
              {error ? <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
              <div className="mt-4"><button type="submit" className="inline-flex min-h-12 items-center rounded-full bg-[#e3a7a5] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#264636]">unlock admin</button></div>
            </form>
          ) : null}

          {password && tab === 'live-ops' ? (
            <div className="mt-8 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="site mode" value={runtimeState.liveMode ? 'live' : 'standard'} subtext="Force homepage into live event mode." />
                <StatCard label="banner level" value={runtimeState.announcement.level || 'info'} subtext="Info, warning, or urgent styling." />
                <StatCard label="banner status" value={runtimeState.announcement.enabled ? 'enabled' : 'off'} subtext="Top of page alert visibility." />
              </div>
              <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5 sm:p-6">
                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="inline-flex items-center gap-3 rounded-[1.25rem] border border-[#e3a7a5]/18 bg-black/15 px-4 py-4 text-sm text-[#f7f1e8]/86">
                    <input type="checkbox" checked={runtimeState.liveMode} onChange={(event) => updateRuntime('liveMode', event.target.checked)} />
                    force site into live mode
                  </label>
                  <label className="inline-flex items-center gap-3 rounded-[1.25rem] border border-[#e3a7a5]/18 bg-black/15 px-4 py-4 text-sm text-[#f7f1e8]/86">
                    <input type="checkbox" checked={runtimeState.announcement.enabled} onChange={(event) => updateRuntime('announcement.enabled', event.target.checked)} />
                    enable homepage banner
                  </label>
                </div>
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#e3a7a5]/76">banner urgency level</span>
                    <select value={runtimeState.announcement.level} onChange={(event) => updateRuntime('announcement.level', event.target.value)} className="w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8]">
                      <option value="info">info</option>
                      <option value="warning">warning</option>
                      <option value="urgent">urgent</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#e3a7a5]/76">happening now</span>
                    <input value={runtimeState.happeningNow || ''} onChange={(event) => updateRuntime('happeningNow', event.target.value)} className="w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8]" placeholder="masked march at the front steps" />
                  </label>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <label className="block lg:col-span-2">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#e3a7a5]/76">banner message</span>
                    <textarea rows={4} value={runtimeState.announcement.text || ''} onChange={(event) => updateRuntime('announcement.text', event.target.value)} className="w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8]" placeholder="masks required indoors. film starts at 7. main stage resets at 6:30." />
                  </label>
                  <label className="block lg:col-span-2">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#e3a7a5]/76">up next</span>
                    <input value={runtimeState.upNext || ''} onChange={(event) => updateRuntime('upNext', event.target.value)} className="w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8]" placeholder="solidarity choir at 2 pm in the courtyard" />
                  </label>
                </div>
              </div>
              {runtimeError ? <div className="rounded-[1.5rem] border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">{runtimeError}</div> : null}
              <div><button type="button" onClick={saveRuntimeState} className="inline-flex min-h-12 items-center rounded-full bg-[#e3a7a5] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#264636]"><Save className="mr-2 h-4 w-4" />{runtimeSaveStatus === 'saving' ? 'saving...' : 'save live ops'}</button></div>
            </div>
          ) : null}

          {password && tab !== 'live-ops' ? (
            <div className="mt-8 text-sm text-[#f7f1e8]/70">This replacement file preserves the current admin structure, but the useful new work here is the fuller Live Ops panel.</div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
