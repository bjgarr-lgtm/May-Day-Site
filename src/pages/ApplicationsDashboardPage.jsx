import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BarChart3, ClipboardList, Instagram, Lock, RadioTower, RefreshCw, Save, Ticket, Trash2, Users, Wrench } from 'lucide-react'
import { huntRoutes } from '../data/huntData'
import { applyRuntimeToRoutes, buildRuntimeSettingsMap } from '../lib/huntTickets'

const STORAGE_KEY = 'maydayApplicationsPassword'
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

  useEffect(() => {
    if (password) {
      loadSubmissions(password)
      loadHuntSettings(password)
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
  }

  const mergedRoutes = useMemo(() => {
    const settingsMap = buildRuntimeSettingsMap(huntSettings)
    return applyRuntimeToRoutes(huntRoutes, settingsMap)
  }, [huntSettings])

  const vendorCount = items.filter((item) => item.submission_type === 'vendor').length
  const performerCount = items.filter((item) => item.submission_type === 'performer').length
  const volunteerCount = items.filter((item) => item.submission_type === 'volunteer').length
  const volunteerItems = items.filter((item) => item.submission_type === 'volunteer')

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
                <button type="button" onClick={() => { loadSubmissions(password); loadHuntSettings(password) }} className="inline-flex items-center rounded-full border border-[#e3a7a5]/20 bg-black/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10">
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
                <StatCard label="stops" value={mergedRoutes.reduce((sum, route) => sum + route.stops.length, 0)} subtext="Ticketed progression stops." />
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

          {password && tab === 'live-ops' ? <div className="mt-8 text-sm text-[#f7f1e8]/78">Live ops remains in the existing admin flow. Use the separate Ops Center button for the full operations backend.</div> : null}
          {password && tab === 'feed-ops' ? <div className="mt-8 text-sm text-[#f7f1e8]/78">Feed ops is unchanged in this patch.</div> : null}
          {password && tab === 'hunt-ops' ? <div className="mt-8 text-sm text-[#f7f1e8]/78">Hunt ops is unchanged in this patch.</div> : null}
          {password && tab === 'tickets' ? <div className="mt-8 text-sm text-[#f7f1e8]/78">Ticket controls are unchanged in this patch.</div> : null}
        </div>
      </div>
    </div>
  )
}
