import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  Lock,
  RefreshCw,
  RadioTower,
  Save,
} from 'lucide-react'

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

function SubmissionCard({ item }) {
  const payload = item.payload || {}
  const typeLabel = item.submission_type === 'performer' ? 'performer' : 'vendor'
  const linksValue = payload.links || payload.website || payload.social_links || payload.socialLinks || ''

  return (
    <article className="rounded-[1.75rem] border border-[#e3a7a5]/18 bg-black/20 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">{typeLabel}</p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#f7f1e8]">
            {item.subject_name || item.contact_name || 'untitled submission'}
          </h2>
          <p className="mt-2 text-sm text-[#f7f1e8]/62">{formatDate(item.created_at)}</p>
        </div>
        <div className="rounded-full border border-[#e3a7a5]/18 bg-[#e3a7a5]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#f7f1e8]">
          {typeLabel}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {item.contact_name ? <div><Label>contact name</Label><p className="mt-1 text-sm leading-6 text-[#f7f1e8]/86">{item.contact_name}</p></div> : null}
        {item.subject_name ? <div><Label>subject</Label><p className="mt-1 text-sm leading-6 text-[#f7f1e8]/86">{item.subject_name}</p></div> : null}
        {item.email ? <div><Label>email</Label><a href={`mailto:${item.email}`} className="mt-1 block break-words text-sm leading-6 text-[#f7f1e8]/86 underline decoration-[#e3a7a5]/35 underline-offset-4">{item.email}</a></div> : null}
        {item.phone ? <div><Label>phone</Label><a href={`tel:${item.phone}`} className="mt-1 block break-words text-sm leading-6 text-[#f7f1e8]/86 underline decoration-[#e3a7a5]/35 underline-offset-4">{item.phone}</a></div> : null}
      </div>

      <div className="mt-5 grid gap-4">
        {linksValue ? <div><Label>links</Label><a href={linksValue} target="_blank" rel="noreferrer" className="mt-1 block break-words text-sm leading-6 text-[#f7f1e8]/86 underline decoration-[#e3a7a5]/35 underline-offset-4">{linksValue}</a></div> : null}
        {payload.description ? <div><Label>description</Label><p className="mt-1 text-sm leading-6 text-[#f7f1e8]/86">{payload.description}</p></div> : null}
        {payload.needs || payload.tech_needs ? <div><Label>setup or tech needs</Label><p className="mt-1 text-sm leading-6 text-[#f7f1e8]/86">{payload.needs || payload.tech_needs}</p></div> : null}
        {payload.notes ? <div><Label>notes</Label><p className="mt-1 text-sm leading-6 text-[#f7f1e8]/86">{payload.notes}</p></div> : null}
      </div>
    </article>
  )
}

function StatCard({ label, value, subtext }) {
  return (
    <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">{label}</p>
      <p className="mt-3 text-4xl font-black uppercase tracking-tight text-[#f7f1e8]">{value}</p>
      {subtext ? <p className="mt-2 text-sm leading-6 text-[#f7f1e8]/68">{subtext}</p> : null}
    </div>
  )
}

export default function ApplicationsDashboardPage() {
  const [tab, setTab] = useState('overview')
  const [filter, setFilter] = useState('all')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [password, setPassword] = useState(() => {
    try { return sessionStorage.getItem(STORAGE_KEY) || '' } catch { return '' }
  })
  const [inputPassword, setInputPassword] = useState(() => {
    try { return sessionStorage.getItem(STORAGE_KEY) || '' } catch { return '' }
  })
  const [runtimeState, setRuntimeState] = useState({
    liveMode: false,
    announcement: { enabled: false, text: '', level: 'info' },
    happeningNow: '',
    upNext: '',
  })
  const [runtimeSaveStatus, setRuntimeSaveStatus] = useState('idle')
  const [runtimeError, setRuntimeError] = useState('')

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
      const response = await fetch(endpoint, {
        headers: { Accept: 'application/json', 'x-applications-password': currentPassword },
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) throw new Error('Incorrect dashboard password.')
        throw new Error(data?.error || 'Could not load submissions.')
      }
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
      const response = await fetch('/api/runtime/admin', {
        headers: { Accept: 'application/json', 'x-applications-password': currentPassword },
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'Could not load live ops.')
      if (data?.state) {
        setRuntimeState({
          liveMode: !!data.state.liveMode,
          announcement: data.state.announcement || { enabled: false, text: '', level: 'info' },
          happeningNow: data.state.happeningNow || '',
          upNext: data.state.upNext || '',
        })
      }
    } catch (err) {
      setRuntimeError(err?.message || 'Could not load live ops.')
    }
  }

  useEffect(() => {
    if (password) {
      loadSubmissions(password)
      loadRuntimeState(password)
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
  }

  function lockNow() {
    try { sessionStorage.removeItem(STORAGE_KEY) } catch {}
    setPassword('')
    setInputPassword('')
    setItems([])
    setStatus('locked')
    setError('')
  }

  function updateRuntime(path, value) {
    if (path === 'liveMode') return setRuntimeState((current) => ({ ...current, liveMode: value }))
    if (path.startsWith('announcement.')) {
      const key = path.split('.')[1]
      return setRuntimeState((current) => ({ ...current, announcement: { ...current.announcement, [key]: value } }))
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

  const vendorCount = items.filter((item) => item.submission_type === 'vendor').length
  const performerCount = items.filter((item) => item.submission_type === 'performer').length
  const newest = items[0]?.created_at ? formatDate(items[0].created_at) : 'none yet'

  return (
    <div className="min-h-screen bg-[#264636] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center rounded-full border border-[#e3a7a5]/20 bg-black/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10">
            <ArrowLeft className="mr-2 h-4 w-4" /> back to may day
          </Link>

          {password ? (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => { loadSubmissions(password); loadRuntimeState(password) }} className="inline-flex items-center rounded-full border border-[#e3a7a5]/20 bg-black/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10">
                <RefreshCw className="mr-2 h-4 w-4" /> refresh
              </button>
              <button type="button" onClick={lockNow} className="inline-flex items-center rounded-full border border-[#e3a7a5]/20 bg-black/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10">
                <Lock className="mr-2 h-4 w-4" /> lock
              </button>
            </div>
          ) : null}
        </div>

        <div className="rounded-[2rem] border border-[#e3a7a5]/18 bg-black/20 p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/80">admin</p>
              <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#e3a7a5] sm:text-5xl">may day admin</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#f7f1e8]/84">
                Forms, basic numbers, and day of controls without doing desktop edits like a punishment ritual.
              </p>
            </div>

            {password ? (
              <div className="flex flex-wrap gap-2">
                {tabOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTab(option.value)}
                      className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-black uppercase tracking-[0.14em] transition ${
                        tab === option.value
                          ? 'border-[#e3a7a5] bg-[#e3a7a5] text-[#264636]'
                          : 'border-[#e3a7a5]/18 bg-black/20 text-[#f7f1e8] hover:bg-[#e3a7a5]/10'
                      }`}
                    >
                      <Icon className="mr-2 h-4 w-4" /> {option.label}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>

          {!password ? (
            <form onSubmit={unlock} className="mt-8 max-w-xl rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5 sm:p-6">
              <div className="flex items-center gap-3 text-[#e3a7a5]">
                <Lock className="h-5 w-5" />
                <h2 className="text-lg font-black uppercase tracking-tight">admin password required</h2>
              </div>
              <p className="mt-3 text-sm leading-7 text-[#f7f1e8]/78">Enter the password set in your worker environment to unlock admin.</p>
              <label className="mt-4 block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#e3a7a5]/76">admin password</span>
                <input type="password" value={inputPassword} onChange={(event) => setInputPassword(event.target.value)} className="w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8] placeholder:text-[#f7f1e8]/40 focus:border-[#e3a7a5]/50 focus:outline-none" required />
              </label>
              {error ? <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
              <div className="mt-4">
                <button type="submit" className="inline-flex min-h-12 items-center rounded-full bg-[#e3a7a5] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#264636] transition hover:bg-[#efbbb9]">
                  unlock admin
                </button>
              </div>
            </form>
          ) : null}

          {password && tab === 'overview' ? (
            <div className="mt-8 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="total submissions" value={items.length} subtext="Everything currently visible in admin." />
                <StatCard label="vendors" value={vendorCount} subtext="Vendor or organization applications." />
                <StatCard label="performers" value={performerCount} subtext="Band, performer, or artist applications." />
              </div>
              <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">latest activity</p>
                  <p className="mt-3 text-lg font-black uppercase tracking-tight text-[#f7f1e8]">{newest}</p>
                  <p className="mt-2 text-sm leading-6 text-[#f7f1e8]/68">Most recent submission timestamp currently loaded.</p>
                </div>
                <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">admin tools</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" onClick={() => setTab('applications')} className="inline-flex min-h-11 items-center rounded-full border border-[#e3a7a5]/18 bg-[#e3a7a5]/10 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/15">
                      <ClipboardList className="mr-2 h-4 w-4" /> view applications
                    </button>
                    <button type="button" onClick={() => setTab('live-ops')} className="inline-flex min-h-11 items-center rounded-full border border-[#e3a7a5]/18 bg-black/15 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10">
                      <RadioTower className="mr-2 h-4 w-4" /> live ops
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {password && tab === 'applications' ? (
            <div className="mt-8">
              <div className="mb-5 flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <button key={option.value} type="button" onClick={() => setFilter(option.value)} className={`rounded-full border px-4 py-2 text-sm font-black uppercase tracking-[0.14em] transition ${
                    filter === option.value
                      ? 'border-[#e3a7a5] bg-[#e3a7a5] text-[#264636]'
                      : 'border-[#e3a7a5]/18 bg-black/20 text-[#f7f1e8] hover:bg-[#e3a7a5]/10'
                  }`}>{option.label}</button>
                ))}
              </div>
              {status === 'loading' ? <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-6 text-sm text-[#f7f1e8]/78">loading submissions...</div> : null}
              {status === 'error' ? <div className="rounded-[1.5rem] border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-100">{error}</div> : null}
              {status === 'ready' && items.length === 0 ? <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-6 text-sm text-[#f7f1e8]/78">no submissions yet.</div> : null}
              <div className="grid gap-4">
                {items.map((item) => <SubmissionCard key={item.id} item={item} />)}
              </div>
            </div>
          ) : null}

          {password && tab === 'live-ops' ? (
            <div className="mt-8 space-y-6">
              <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">site live mode</p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <label className="inline-flex items-center gap-3 text-sm text-[#f7f1e8]/86">
                    <input type="checkbox" checked={runtimeState.liveMode} onChange={(event) => updateRuntime('liveMode', event.target.checked)} />
                    force site into live mode
                  </label>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">announcement banner</p>
                <div className="mt-4 grid gap-4">
                  <label className="inline-flex items-center gap-3 text-sm text-[#f7f1e8]/86">
                    <input type="checkbox" checked={!!runtimeState.announcement.enabled} onChange={(event) => updateRuntime('announcement.enabled', event.target.checked)} />
                    show announcement banner
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#e3a7a5]/76">banner level</span>
                    <select value={runtimeState.announcement.level || 'info'} onChange={(event) => updateRuntime('announcement.level', event.target.value)} className="w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8] focus:border-[#e3a7a5]/50 focus:outline-none">
                      <option value="info">info</option>
                      <option value="warning">warning</option>
                      <option value="urgent">urgent</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#e3a7a5]/76">banner text</span>
                    <textarea rows={3} value={runtimeState.announcement.text || ''} onChange={(event) => updateRuntime('announcement.text', event.target.value)} className="w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8] placeholder:text-[#f7f1e8]/40 focus:border-[#e3a7a5]/50 focus:outline-none" />
                  </label>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">hero runtime text</p>
                <div className="mt-4 grid gap-4">
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#e3a7a5]/76">happening now</span>
                    <input value={runtimeState.happeningNow || ''} onChange={(event) => updateRuntime('happeningNow', event.target.value)} className="w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8] placeholder:text-[#f7f1e8]/40 focus:border-[#e3a7a5]/50 focus:outline-none" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#e3a7a5]/76">up next</span>
                    <input value={runtimeState.upNext || ''} onChange={(event) => updateRuntime('upNext', event.target.value)} className="w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8] placeholder:text-[#f7f1e8]/40 focus:border-[#e3a7a5]/50 focus:outline-none" />
                  </label>
                </div>
              </div>

              {runtimeError ? <div className="rounded-[1.5rem] border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">{runtimeError}</div> : null}
              {runtimeSaveStatus === 'saved' ? <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-[#e3a7a5]/10 p-4 text-sm text-[#f7f1e8]">live ops saved.</div> : null}

              <div>
                <button type="button" onClick={saveRuntimeState} className="inline-flex min-h-12 items-center rounded-full bg-[#e3a7a5] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#264636] transition hover:bg-[#efbbb9]">
                  <Save className="mr-2 h-4 w-4" />
                  {runtimeSaveStatus === 'saving' ? 'saving...' : 'save live ops'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}