import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Hash,
  Instagram,
  Lock,
  MonitorSmartphone,
  RadioTower,
  RefreshCw,
  Save,
  Ticket,
  Trash2,
  Users,
  Wrench,
} from 'lucide-react'
import { huntRoutes } from '../data/huntData'
import { applyRuntimeToRoutes, buildRuntimeSettingsMap, getDefaultDifficulty, getDefaultTicketValue } from '../lib/huntTickets'

const STORAGE_KEY = 'maydayApplicationsPassword'
const LOCAL_FEED_CACHE_KEY = 'mayday_live_feed_cache_v1'
const filterOptions = [
  { value: 'all', label: 'all submissions' },
  { value: 'vendor', label: 'vendors' },
  { value: 'performer', label: 'performers' },
  { value: 'volunteer', label: 'volunteers' },
]
const tabOptions = [
  { value: 'overview', label: 'overview', icon: BarChart3 },
  { value: 'applications', label: 'applications', icon: ClipboardList },
  { value: 'volunteers', label: 'volunteers', icon: Users },
  { value: 'live-ops', label: 'live ops', icon: RadioTower },
  { value: 'feed-ops', label: 'feed ops', icon: Instagram },
  { value: 'hunt-ops', label: 'hunt ops', icon: Save },
  { value: 'tickets', label: 'tickets', icon: Ticket },
]

function formatDate(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

function formatShortDate(value) {
  if (!value) return 'none'
  try {
    return new Date(value).toLocaleDateString()
  } catch {
    return value
  }
}

function Label({ children }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e3a7a5]/76">{children}</p>
}

function StatCard({ label, value, subtext }) {
  return <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5"><p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">{label}</p><p className="mt-3 text-4xl font-black uppercase tracking-tight text-[#f7f1e8]">{value}</p>{subtext ? <p className="mt-2 text-sm leading-6 text-[#f7f1e8]/68">{subtext}</p> : null}</div>
}

function SubmissionCard({ item, onDelete, deleting }) {
  const payload = item.payload || {}
  const typeLabel = item.submission_type || 'submission'
  const subjectLine = item.subject_name || payload.organization_name || payload.artist_name || payload.preferred_role || item.contact_name || 'untitled submission'

  return (
    <article className="rounded-[1.75rem] border border-[#e3a7a5]/18 bg-black/20 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">{typeLabel}</p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#f7f1e8]">{subjectLine}</h2>
          <p className="mt-2 text-sm text-[#f7f1e8]/62">{formatDate(item.created_at)}</p>
        </div>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          disabled={deleting}
          className="inline-flex min-h-10 items-center rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {deleting ? 'deleting...' : 'delete'}
        </button>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div><Label>contact</Label><p className="mt-1 text-sm text-[#f7f1e8]/84">{item.contact_name || ''}</p></div>
        <div><Label>email</Label><p className="mt-1 text-sm text-[#f7f1e8]/84 break-all">{item.email || ''}</p></div>
        <div><Label>phone</Label><p className="mt-1 text-sm text-[#f7f1e8]/84">{item.phone || ''}</p></div>
        <div><Label>subject</Label><p className="mt-1 text-sm text-[#f7f1e8]/84">{subjectLine}</p></div>
        <div><Label>links / availability</Label><p className="mt-1 text-sm text-[#f7f1e8]/84 break-words">{payload.links || payload.website || payload.availability || ''}</p></div>
        <div><Label>notes</Label><p className="mt-1 text-sm text-[#f7f1e8]/84 break-words">{payload.notes || payload.description || payload.tech_needs || ''}</p></div>
      </div>
    </article>
  )
}

function ActionLinkCard({ to, title, body }) {
  return (
    <Link to={to} className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5 transition hover:bg-[#e3a7a5]/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">admin shortcut</p>
          <h3 className="mt-2 text-xl font-black uppercase tracking-tight text-[#f7f1e8]">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-[#f7f1e8]/72">{body}</p>
        </div>
        <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-[#e3a7a5]" />
      </div>
    </Link>
  )
}

function FeedStatusCard({ status }) {
  return (
    <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">feed status</p>
          <h3 className="mt-2 text-xl font-black uppercase tracking-tight text-[#f7f1e8]">{status.modeLabel}</h3>
          <p className="mt-3 text-sm leading-6 text-[#f7f1e8]/72">{status.message}</p>
        </div>
        {status.ok ? <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#e3a7a5]" /> : <MonitorSmartphone className="mt-1 h-5 w-5 shrink-0 text-[#e3a7a5]" />}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e3a7a5]/14 bg-black/20 p-4"><Label>items</Label><p className="mt-2 text-2xl font-black uppercase tracking-tight text-[#f7f1e8]">{status.itemCount}</p></div>
        <div className="rounded-2xl border border-[#e3a7a5]/14 bg-black/20 p-4"><Label>last update</Label><p className="mt-2 text-sm font-bold uppercase tracking-[0.08em] text-[#f7f1e8]">{status.updatedLabel}</p></div>
        <div className="rounded-2xl border border-[#e3a7a5]/14 bg-black/20 p-4"><Label>source</Label><p className="mt-2 text-sm font-bold uppercase tracking-[0.08em] text-[#f7f1e8]">{status.sourceLabel}</p></div>
      </div>
    </div>
  )
}

function HuntRouteEditor({ route, onFieldChange }) {
  return (
    <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5">
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">route</p>
        <h3 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#f7f1e8]">{route.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#f7f1e8]/68">{route.intro}</p>
      </div>
      <div className="space-y-4">
        {route.stops.map((stop, index) => (
          <div key={stop.id} className="rounded-[1.25rem] border border-[#e3a7a5]/14 bg-black/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">stop {index + 1}</p>
                <h4 className="mt-1 text-lg font-black uppercase tracking-tight text-[#f7f1e8]">{stop.title}</h4>
                <p className="mt-2 text-xs leading-6 text-[#f7f1e8]/62">{stop.id}</p>
              </div>
              <div className="rounded-full border border-[#e3a7a5]/14 bg-black/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#f7f1e8]/72">
                {stop.validationMode || 'manual'}
              </div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-6">
              <label className="block">
                <Label>difficulty</Label>
                <input type="number" min="1" value={stop.difficulty ?? ''} onChange={(event) => onFieldChange(route.slug, stop.id, 'difficulty', event.target.value)} className="mt-2 w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8] outline-none" />
              </label>
              <label className="block">
                <Label>ticket value</Label>
                <input type="number" min="0" value={stop.ticketValue ?? ''} onChange={(event) => onFieldChange(route.slug, stop.id, 'ticketValue', event.target.value)} className="mt-2 w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8] outline-none" />
              </label>
              <label className="block lg:col-span-2">
                <Label>validation mode</Label>
                <select value={stop.validationMode || 'manual'} onChange={(event) => onFieldChange(route.slug, stop.id, 'validationMode', event.target.value)} className="mt-2 w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8] outline-none">
                  <option value="manual">manual</option>
                  <option value="answer">answer</option>
                  <option value="volunteer">volunteer</option>
                  <option value="onsite_qr_only">onsite qr only</option>
                </select>
              </label>
              <label className="block lg:col-span-2">
                <Label>volunteer code</Label>
                <input type="text" value={stop.volunteerCode || ''} onChange={(event) => onFieldChange(route.slug, stop.id, 'volunteerCode', event.target.value)} className="mt-2 w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8] outline-none" />
              </label>
              <label className="block lg:col-span-4">
                <Label>proof answer</Label>
                <input type="text" value={stop.proofAnswer || ''} onChange={(event) => onFieldChange(route.slug, stop.id, 'proofAnswer', event.target.value)} className="mt-2 w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8] outline-none" />
              </label>
              <label className="flex min-h-[3.5rem] items-center gap-3 rounded-2xl border border-[#e3a7a5]/14 bg-black/20 px-4 py-3 lg:col-span-2">
                <input type="checkbox" checked={stop.revealNextInUI !== false} onChange={(event) => onFieldChange(route.slug, stop.id, 'revealNextInUI', event.target.checked)} />
                <span className="text-sm font-bold uppercase tracking-[0.08em] text-[#f7f1e8]">reveal next in ui</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ApplicationsDashboardPage() {
  const [tab, setTab] = useState('overview')
  const [filter, setFilter] = useState('all')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [deleteState, setDeleteState] = useState({ id: '', error: '' })
  const [password, setPassword] = useState(() => { try { return sessionStorage.getItem(STORAGE_KEY) || '' } catch { return '' } })
  const [inputPassword, setInputPassword] = useState(() => { try { return sessionStorage.getItem(STORAGE_KEY) || '' } catch { return '' } })
  const [huntSettings, setHuntSettings] = useState([])
  const [huntError, setHuntError] = useState('')
  const [huntSaving, setHuntSaving] = useState(false)
  const [huntMessage, setHuntMessage] = useState('')
  const [ticketPlayerKey, setTicketPlayerKey] = useState('')
  const [ticketAmount, setTicketAmount] = useState('')
  const [ticketMode, setTicketMode] = useState('claimed')
  const [ticketMessage, setTicketMessage] = useState('')
  const [ticketSummary, setTicketSummary] = useState(null)
  const [ticketLoading, setTicketLoading] = useState(false)
  const [feedStatus, setFeedStatus] = useState({ ok: false, modeLabel: 'loading feed', itemCount: 0, updatedLabel: 'checking', sourceLabel: 'api', message: 'Checking the live feed endpoint so this tab stops being a decorative lie.' })

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

  async function deleteSubmission(id) {
    if (!id) return
    const confirmed = window.confirm('Delete this application permanently?')
    if (!confirmed) return
    setDeleteState({ id, error: '' })
    try {
      const response = await fetch(`/api/forms/submissions?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json', 'x-applications-password': password },
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'Could not delete submission.')
      setItems((current) => current.filter((item) => item.id !== id))
      setDeleteState({ id: '', error: '' })
    } catch (err) {
      setDeleteState({ id: '', error: err?.message || 'Could not delete submission.' })
    }
  }

  async function loadHuntSettings(currentPassword = password, playerKey = ticketPlayerKey) {
    if (!currentPassword) return
    setHuntError('')
    try {
      const query = playerKey ? `?playerKey=${encodeURIComponent(playerKey)}` : ''
      const response = await fetch(`/api/hunt/admin${query}`, { headers: { Accept: 'application/json', 'x-applications-password': currentPassword } })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'Could not load hunt ops.')
      setHuntSettings(Array.isArray(data?.settings) ? data.settings : [])
      if (data?.summary) setTicketSummary(data.summary)
    } catch (err) {
      setHuntError(err?.message || 'Could not load hunt ops.')
    }
  }

  async function loadFeedStatus() {
    try {
      const response = await fetch('/api/live-feed', { headers: { Accept: 'application/json' } })
      const data = await response.json().catch(() => ({}))
      const items = Array.isArray(data?.items) ? data.items : []
      const mode = data?.mode || 'fallback'
      const modeLabel = mode === 'desktop-live' ? 'desktop live mode' : mode === 'desktop-cached' ? 'desktop cached' : mode === 'local-cached' ? 'saved on this device' : 'fallback mode'
      setFeedStatus({
        ok: response.ok,
        modeLabel,
        itemCount: items.length,
        updatedLabel: formatDate(data?.generatedAt || '' ) || 'not available',
        sourceLabel: response.ok ? 'api live-feed' : 'fallback response',
        message: response.ok ? 'The feed endpoint is responding. Human civilization limps on.' : (data?.error || 'Feed endpoint is not returning clean data.'),
      })
    } catch {
      let cachedItems = 0
      try {
        const raw = window.localStorage.getItem(LOCAL_FEED_CACHE_KEY)
        const parsed = raw ? JSON.parse(raw) : null
        cachedItems = Array.isArray(parsed?.items) ? parsed.items.length : 0
      } catch {}
      setFeedStatus({
        ok: false,
        modeLabel: 'offline or watcher idle',
        itemCount: cachedItems,
        updatedLabel: 'unavailable',
        sourceLabel: cachedItems ? 'local cache' : 'none',
        message: cachedItems ? 'The API did not answer, but this device still has cached feed items.' : 'No API response and no local cache. The watcher is probably asleep again.',
      })
    }
  }

  useEffect(() => {
    if (password) {
      loadSubmissions(password)
      loadHuntSettings(password)
      loadFeedStatus()
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
    setHuntError('')
  }

  function lockNow() {
    try { sessionStorage.removeItem(STORAGE_KEY) } catch {}
    setPassword('')
    setInputPassword('')
    setItems([])
    setStatus('locked')
    setError('')
    setHuntError('')
    setTicketSummary(null)
    setTicketMessage('')
  }

  function updateHuntSetting(routeSlug, stopId, key, value) {
    setHuntMessage('')
    setHuntSettings((current) => {
      const next = [...current]
      const index = next.findIndex((item) => item.routeSlug === routeSlug && item.stopId === stopId)
      const stop = huntRoutes.find((route) => route.slug === routeSlug)?.stops.find((item) => item.id === stopId)
      const stopIndex = huntRoutes.find((route) => route.slug === routeSlug)?.stops.findIndex((item) => item.id === stopId) ?? 0
      const base = index >= 0
        ? next[index]
        : {
            routeSlug,
            stopId,
            difficulty: stop?.difficulty ?? getDefaultDifficulty(stopIndex + 1),
            ticketValue: stop?.ticketValue ?? getDefaultTicketValue(stopIndex + 1),
            validationMode: stop?.validationMode || 'manual',
            volunteerCode: stop?.volunteerCode || '',
            proofAnswer: stop?.proofAnswer || '',
            revealNextInUI: stop?.revealNextInUI !== false,
          }
      const normalizedValue = key === 'difficulty' || key === 'ticketValue' ? Number(value || 0) : value
      const nextItem = { ...base, [key]: normalizedValue }
      if (index >= 0) next[index] = nextItem
      else next.push(nextItem)
      return next
    })
  }

  async function saveHuntSettings() {
    setHuntSaving(true)
    setHuntMessage('')
    setHuntError('')
    try {
      const response = await fetch('/api/hunt/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'x-applications-password': password },
        body: JSON.stringify({ action: 'upsert_settings', settings: huntSettings }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'Could not save hunt settings.')
      setHuntSettings(Array.isArray(data?.settings) ? data.settings : [])
      setHuntMessage('Hunt settings saved.')
    } catch (err) {
      setHuntError(err?.message || 'Could not save hunt settings.')
    } finally {
      setHuntSaving(false)
    }
  }

  async function lookupTickets() {
    if (!ticketPlayerKey.trim()) {
      setTicketMessage('Enter a player key first.')
      return
    }
    setTicketLoading(true)
    setTicketMessage('')
    try {
      const response = await fetch(`/api/hunt/admin?playerKey=${encodeURIComponent(ticketPlayerKey.trim())}`, {
        headers: { Accept: 'application/json', 'x-applications-password': password },
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'Could not load ticket summary.')
      setTicketSummary(data?.summary || null)
      setTicketMessage('Ticket summary loaded.')
    } catch (err) {
      setTicketMessage(err?.message || 'Could not load ticket summary.')
    } finally {
      setTicketLoading(false)
    }
  }

  async function redeemTickets() {
    const amount = Number(ticketAmount || 0)
    if (!ticketPlayerKey.trim() || amount <= 0) {
      setTicketMessage('Enter a player key and a positive amount.')
      return
    }
    setTicketLoading(true)
    setTicketMessage('')
    try {
      const response = await fetch('/api/hunt/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'x-applications-password': password },
        body: JSON.stringify({ action: 'redeem_tickets', playerKey: ticketPlayerKey.trim(), amount, mode: ticketMode }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'Could not update tickets.')
      setTicketSummary(data?.summary || null)
      setTicketMessage(ticketMode === 'spent' ? 'Tickets marked spent.' : 'Tickets marked claimed.')
      setTicketAmount('')
    } catch (err) {
      setTicketMessage(err?.message || 'Could not update tickets.')
    } finally {
      setTicketLoading(false)
    }
  }

  const mergedRoutes = useMemo(() => {
    const settingsMap = buildRuntimeSettingsMap(huntSettings)
    return applyRuntimeToRoutes(huntRoutes, settingsMap)
  }, [huntSettings])

  const vendorCount = items.filter((item) => item.submission_type === 'vendor').length
  const performerCount = items.filter((item) => item.submission_type === 'performer').length
  const volunteerCount = items.filter((item) => item.submission_type === 'volunteer').length
  const volunteerItems = items.filter((item) => item.submission_type === 'volunteer')
  const totalStops = mergedRoutes.reduce((sum, route) => sum + route.stops.length, 0)
  const volunteerValidatedStops = mergedRoutes.reduce((sum, route) => sum + route.stops.filter((stop) => stop.validationMode === 'volunteer').length, 0)
  const answerValidatedStops = mergedRoutes.reduce((sum, route) => sum + route.stops.filter((stop) => stop.validationMode === 'answer').length, 0)
  const liveOpsSummary = useMemo(() => ({
    submissions: items.length,
    volunteers: volunteerItems.length,
    routes: mergedRoutes.length,
    stops: totalStops,
  }), [items.length, volunteerItems.length, mergedRoutes.length, totalStops])

  return (
    <div className="min-h-screen bg-[#264636] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center rounded-full border border-[#e3a7a5]/20 bg-black/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10">
            <ArrowLeft className="mr-2 h-4 w-4" />
            back to may day
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/ops" className="inline-flex items-center rounded-full border border-[#e3a7a5] bg-[#e3a7a5] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-[#264636] transition hover:bg-[#efbbb9]">
              <Wrench className="mr-2 h-4 w-4" />ops center
            </Link>
            <Link to="/volunteer-application" className="inline-flex items-center rounded-full border border-[#e3a7a5]/20 bg-black/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10">
              <Users className="mr-2 h-4 w-4" />volunteer form
            </Link>
            {password ? (
              <>
                <button type="button" onClick={() => { loadSubmissions(password); loadHuntSettings(password, ticketPlayerKey); loadFeedStatus() }} className="inline-flex items-center rounded-full border border-[#e3a7a5]/20 bg-black/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10">
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
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#f7f1e8]/84">Forms, volunteers, live ops, and event controls without making you edit code on event day.</p>
            </div>
            {password ? (
              <div className="flex flex-wrap gap-2">
                {tabOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <button key={option.value} type="button" onClick={() => { setTab(option.value); if (option.value === 'volunteers') setFilter('volunteer'); if (option.value === 'applications' && filter === 'volunteer') setFilter('all') }} className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-black uppercase tracking-[0.14em] transition ${tab === option.value ? 'border-[#e3a7a5] bg-[#e3a7a5] text-[#264636]' : 'border-[#e3a7a5]/18 bg-black/20 text-[#f7f1e8] hover:bg-[#e3a7a5]/10'}`}>
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
              <div className="grid gap-4 md:grid-cols-4">
                <StatCard label="total submissions" value={items.length} subtext="Everything currently visible in admin." />
                <StatCard label="vendors" value={vendorCount} subtext="Vendor or organization applications." />
                <StatCard label="performers" value={performerCount} subtext="Band, performer, or artist applications." />
                <StatCard label="volunteers" value={volunteerCount} subtext="Volunteer applications and role interest." />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="hunt routes" value={mergedRoutes.length} subtext="Five route hunt now active." />
                <StatCard label="stops" value={totalStops} subtext="Ticketed progression stops." />
                <StatCard label="admin ready" value={password ? 'yes' : 'no'} subtext="Ops center and forms unlocked in this session." />
              </div>
              {huntError ? <div className="rounded-[1.5rem] border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">{huntError}</div> : null}
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
              {deleteState.error ? <div className="mb-4 rounded-[1.25rem] border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">{deleteState.error}</div> : null}
              <div className="grid gap-4">
                {items.map((item) => <SubmissionCard key={item.id} item={item} onDelete={deleteSubmission} deleting={deleteState.id === item.id} />)}
              </div>
            </div>
          ) : null}

          {password && tab === 'volunteers' ? (
            <div className="mt-8 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm leading-6 text-[#f7f1e8]/78">Volunteer submissions live in their own lane now, because stuffing them under general applications was needlessly annoying.</p>
                <Link to="/volunteer-application" className="inline-flex items-center rounded-full border border-[#e3a7a5] bg-[#e3a7a5] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-[#264636] transition hover:bg-[#efbbb9]">
                  open volunteer form
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="volunteer submissions" value={volunteerItems.length} subtext="People who filled the public volunteer form." />
                <StatCard label="latest response" value={volunteerItems[0] ? formatDate(volunteerItems[0].created_at).split(',')[0] : 'none'} subtext="Most recent volunteer form hit." />
                <StatCard label="ops center" value="ready" subtext="Use Ops Center to assign shifts and roles." />
              </div>
              <div className="grid gap-4">
                {volunteerItems.length ? volunteerItems.map((item) => <SubmissionCard key={item.id} item={item} onDelete={deleteSubmission} deleting={deleteState.id === item.id} />) : <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5 text-sm text-[#f7f1e8]/72">No volunteer submissions yet.</div>}
              </div>
            </div>
          ) : null}

          {password && tab === 'live-ops' ? (
            <div className="mt-8 space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <StatCard label="submissions" value={liveOpsSummary.submissions} subtext="Total forms currently visible." />
                <StatCard label="volunteer forms" value={liveOpsSummary.volunteers} subtext="Potential staffing pool." />
                <StatCard label="hunt routes" value={liveOpsSummary.routes} subtext="Configured route groups." />
                <StatCard label="hunt stops" value={liveOpsSummary.stops} subtext="Stops currently in play." />
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <ActionLinkCard to="/admin/ops/dashboard" title="dashboard" body="Top level problem scan, readiness, and the stuff on fire first. Human tradition." />
                <ActionLinkCard to="/admin/ops/timeline" title="timeline" body="Immediate day of flow, sequence collisions, and what is supposed to happen when." />
                <ActionLinkCard to="/admin/ops/volunteers" title="volunteers" body="Shift assignments, coverage gaps, and who is actually showing up." />
                <ActionLinkCard to="/admin/ops/run-of-show" title="run of show" body="Operational checklist for live event use instead of vague spiritual hope." />
              </div>
            </div>
          ) : null}

          {password && tab === 'feed-ops' ? (
            <div className="mt-8 space-y-6">
              <FeedStatusCard status={feedStatus} />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <ActionLinkCard to="/" title="homepage live feed" body="Jump to the public homepage and inspect the ticker in the actual rendered environment." />
                <ActionLinkCard to="/admin" title="admin overview" body="Return to the admin shell after checking feed output, because humans enjoy walking in circles." />
                <ActionLinkCard to="/vendor-application" title="vendor form" body="Quick sanity check for public form rendering and route health." />
                <ActionLinkCard to="/performer-application" title="performer form" body="Same idea, different public intake path, same eternal browser nonsense." />
              </div>
              <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">feed actions</p>
                    <h3 className="mt-2 text-xl font-black uppercase tracking-tight text-[#f7f1e8]">refresh feed status</h3>
                    <p className="mt-3 text-sm leading-6 text-[#f7f1e8]/72">This tab was hardcoded to placeholder copy. Now it at least checks the live-feed endpoint and gives you actual state instead of decorative lies.</p>
                  </div>
                  <button type="button" onClick={loadFeedStatus} className="inline-flex items-center rounded-full border border-[#e3a7a5] bg-[#e3a7a5] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-[#264636] transition hover:bg-[#efbbb9]">
                    <RefreshCw className="mr-2 h-4 w-4" />refresh feed
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {password && tab === 'hunt-ops' ? (
            <div className="mt-8 space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <StatCard label="routes" value={mergedRoutes.length} subtext="Configured route groups." />
                <StatCard label="stops" value={totalStops} subtext="All hunt stops." />
                <StatCard label="volunteer stops" value={volunteerValidatedStops} subtext="Stops gated by volunteer code." />
                <StatCard label="answer stops" value={answerValidatedStops} subtext="Stops gated by typed answer." />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">hunt settings</p>
                  <h3 className="mt-2 text-xl font-black uppercase tracking-tight text-[#f7f1e8]">edit stop runtime controls</h3>
                  <p className="mt-3 text-sm leading-6 text-[#f7f1e8]/72">This is the part that was replaced with placeholder text in admin. It is now wired back into /api/hunt/admin so you can actually edit the damn thing.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => loadHuntSettings(password, ticketPlayerKey)} className="inline-flex items-center rounded-full border border-[#e3a7a5]/18 bg-black/20 px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10">
                    <RefreshCw className="mr-2 h-4 w-4" />reload
                  </button>
                  <button type="button" onClick={saveHuntSettings} disabled={huntSaving} className="inline-flex items-center rounded-full border border-[#e3a7a5] bg-[#e3a7a5] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-[#264636] transition hover:bg-[#efbbb9] disabled:opacity-70">
                    <Save className="mr-2 h-4 w-4" />{huntSaving ? 'saving...' : 'save hunt settings'}
                  </button>
                </div>
              </div>
              {huntError ? <div className="rounded-[1.25rem] border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">{huntError}</div> : null}
              {huntMessage ? <div className="rounded-[1.25rem] border border-[#e3a7a5]/18 bg-[#e3a7a5]/10 p-4 text-sm text-[#f7f1e8]">{huntMessage}</div> : null}
              <div className="space-y-5">
                {mergedRoutes.map((route) => <HuntRouteEditor key={route.slug} route={route} onFieldChange={updateHuntSetting} />)}
              </div>
            </div>
          ) : null}

          {password && tab === 'tickets' ? (
            <div className="mt-8 space-y-6">
              <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5 sm:p-6">
                <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr_.8fr_.8fr_auto] lg:items-end">
                  <label className="block">
                    <Label>player key</Label>
                    <input type="text" value={ticketPlayerKey} onChange={(event) => setTicketPlayerKey(event.target.value)} placeholder="MDH-XXXXXX" className="mt-2 w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8] outline-none" />
                  </label>
                  <label className="block">
                    <Label>amount</Label>
                    <input type="number" min="1" value={ticketAmount} onChange={(event) => setTicketAmount(event.target.value)} className="mt-2 w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8] outline-none" />
                  </label>
                  <label className="block">
                    <Label>mode</Label>
                    <select value={ticketMode} onChange={(event) => setTicketMode(event.target.value)} className="mt-2 w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8] outline-none">
                      <option value="claimed">claimed</option>
                      <option value="spent">spent</option>
                    </select>
                  </label>
                  <div className="flex flex-wrap gap-2 lg:col-span-2">
                    <button type="button" onClick={lookupTickets} disabled={ticketLoading} className="inline-flex items-center rounded-full border border-[#e3a7a5]/18 bg-black/20 px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10 disabled:opacity-70">
                      <RefreshCw className="mr-2 h-4 w-4" />lookup
                    </button>
                    <button type="button" onClick={redeemTickets} disabled={ticketLoading} className="inline-flex items-center rounded-full border border-[#e3a7a5] bg-[#e3a7a5] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-[#264636] transition hover:bg-[#efbbb9] disabled:opacity-70">
                      <Ticket className="mr-2 h-4 w-4" />apply
                    </button>
                  </div>
                </div>
                {ticketMessage ? <div className="mt-4 rounded-[1.25rem] border border-[#e3a7a5]/18 bg-[#e3a7a5]/10 p-4 text-sm text-[#f7f1e8]">{ticketMessage}</div> : null}
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <StatCard label="earned" value={ticketSummary?.earnedTotal ?? 0} subtext="All stop and bonus tickets." />
                <StatCard label="claimed" value={ticketSummary?.claimedTotal ?? 0} subtext="Marked claimed by admin." />
                <StatCard label="spent" value={ticketSummary?.spentTotal ?? 0} subtext="Marked spent by admin." />
                <StatCard label="available" value={ticketSummary?.availableTotal ?? 0} subtext="What should still be redeemable." />
              </div>

              <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">ledger</p>
                    <h3 className="mt-2 text-xl font-black uppercase tracking-tight text-[#f7f1e8]">ticket event history</h3>
                    <p className="mt-3 text-sm leading-6 text-[#f7f1e8]/72">This was another dead placeholder. Now it actually looks up a player ledger and lets you mark tickets claimed or spent.</p>
                  </div>
                  {ticketSummary?.playerKey ? <div className="rounded-full border border-[#e3a7a5]/14 bg-black/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#f7f1e8]/72">{ticketSummary.playerKey}</div> : null}
                </div>
                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">
                        <th className="px-3 py-2">type</th>
                        <th className="px-3 py-2">amount</th>
                        <th className="px-3 py-2">route</th>
                        <th className="px-3 py-2">stop</th>
                        <th className="px-3 py-2">note</th>
                        <th className="px-3 py-2">created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(ticketSummary?.ledger || []).map((entry) => (
                        <tr key={entry.id || `${entry.event_key}-${entry.created_at}`} className="rounded-2xl border border-[#e3a7a5]/14 bg-black/20 text-[#f7f1e8]/84">
                          <td className="px-3 py-3 font-bold uppercase">{entry.event_type}</td>
                          <td className="px-3 py-3">{entry.amount}</td>
                          <td className="px-3 py-3">{entry.route_slug || '—'}</td>
                          <td className="px-3 py-3">{entry.stop_id || '—'}</td>
                          <td className="px-3 py-3">{entry.note || '—'}</td>
                          <td className="px-3 py-3">{formatDate(entry.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!ticketSummary?.ledger?.length ? <div className="rounded-[1.25rem] border border-[#e3a7a5]/14 bg-black/20 p-4 text-sm text-[#f7f1e8]/72">No ledger loaded yet. Lookup a player key first.</div> : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
