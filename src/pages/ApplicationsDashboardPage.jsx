import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  Lock,
  Mail,
  Phone,
  RefreshCw,
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
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e3a7a5]/76">
      {children}
    </p>
  )
}

function DetailBlock({ label, value, href }) {
  if (!value) return null
  const internal = href && (href.startsWith('mailto:') || href.startsWith('tel:'))

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {href ? (
        <a
          href={href}
          target={internal ? '_self' : '_blank'}
          rel={internal ? undefined : 'noreferrer'}
          className="break-words text-sm leading-6 text-[#f7f1e8]/86 underline decoration-[#e3a7a5]/35 underline-offset-4"
        >
          {value}
        </a>
      ) : (
        <p className="break-words text-sm leading-6 text-[#f7f1e8]/86">{value}</p>
      )}
    </div>
  )
}

function SubmissionCard({ item }) {
  const payload = item.payload || {}
  const typeLabel = item.submission_type === 'performer' ? 'performer' : 'vendor'
  const linksValue =
    payload.links || payload.website || payload.social_links || payload.socialLinks || ''

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
        <DetailBlock label="contact name" value={item.contact_name} />
        <DetailBlock label="subject" value={item.subject_name} />
        <DetailBlock
          label="email"
          value={item.email}
          href={item.email ? `mailto:${item.email}` : undefined}
        />
        <DetailBlock
          label="phone"
          value={item.phone}
          href={item.phone ? `tel:${item.phone}` : undefined}
        />
        <DetailBlock label="location" value={payload.location} />
        <DetailBlock label="genre" value={payload.genre} />
      </div>

      <div className="mt-5 grid gap-4">
        <DetailBlock label="links" value={linksValue} href={linksValue} />
        <DetailBlock label="description" value={payload.description} />
        <DetailBlock label="setup or tech needs" value={payload.needs || payload.tech_needs} />
        <DetailBlock label="notes" value={payload.notes} />
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
    try {
      return sessionStorage.getItem(STORAGE_KEY) || ''
    } catch {
      return ''
    }
  })
  const [inputPassword, setInputPassword] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) || ''
    } catch {
      return ''
    }
  })

  const endpoint = useMemo(() => {
    const query = filter === 'all' ? '' : `?type=${encodeURIComponent(filter)}`
    return `/api/forms/submissions${query}`
  }, [filter])

  async function load(currentPassword = password) {
    if (!currentPassword) {
      setStatus('locked')
      setItems([])
      return
    }

    setStatus('loading')
    setError('')

    try {
      const response = await fetch(endpoint, {
        headers: {
          Accept: 'application/json',
          'x-applications-password': currentPassword,
        },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Incorrect dashboard password.')
        }
        throw new Error(data?.error || 'Could not load submissions.')
      }

      setItems(Array.isArray(data?.items) ? data.items : [])
      setStatus('ready')
    } catch (err) {
      setItems([])
      setStatus('locked')
      setError(err?.message || 'Could not load submissions.')
      try {
        sessionStorage.removeItem(STORAGE_KEY)
      } catch {}
      setPassword('')
    }
  }

  useEffect(() => {
    if (password) {
      load(password)
    } else {
      setStatus('locked')
    }
  }, [endpoint, password])

  function unlock(event) {
    event.preventDefault()
    const next = inputPassword.trim()
    if (!next) return
    try {
      sessionStorage.setItem(STORAGE_KEY, next)
    } catch {}
    setPassword(next)
    setError('')
  }

  function lockNow() {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {}
    setPassword('')
    setInputPassword('')
    setItems([])
    setStatus('locked')
    setError('')
  }

  const vendorCount = items.filter((item) => item.submission_type === 'vendor').length
  const performerCount = items.filter((item) => item.submission_type === 'performer').length
  const newest = items[0]?.created_at ? formatDate(items[0].created_at) : 'none yet'

  return (
    <div className="min-h-screen bg-[#264636] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center rounded-full border border-[#e3a7a5]/20 bg-black/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            back to may day
          </Link>

          <div className="flex flex-wrap gap-2">
            {password ? (
              <>
                <button
                  type="button"
                  onClick={() => load(password)}
                  className="inline-flex items-center rounded-full border border-[#e3a7a5]/20 bg-black/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  refresh
                </button>
                <button
                  type="button"
                  onClick={lockNow}
                  className="inline-flex items-center rounded-full border border-[#e3a7a5]/20 bg-black/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  lock
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#e3a7a5]/18 bg-black/20 p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/80">admin</p>
              <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#e3a7a5] sm:text-5xl">
                may day admin
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#f7f1e8]/84">
                A tiny admin area for forms and basic dashboard numbers. Not fancy. Functional. Humanity survives.
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
                      <Icon className="mr-2 h-4 w-4" />
                      {option.label}
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
              <p className="mt-3 text-sm leading-7 text-[#f7f1e8]/78">
                Enter the password set in your worker environment to unlock admin.
              </p>
              <label className="mt-4 block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#e3a7a5]/76">
                  admin password
                </span>
                <input
                  type="password"
                  value={inputPassword}
                  onChange={(event) => setInputPassword(event.target.value)}
                  className="w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8] placeholder:text-[#f7f1e8]/40 focus:border-[#e3a7a5]/50 focus:outline-none"
                  required
                />
              </label>
              {error ? (
                <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              ) : null}
              <div className="mt-4">
                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center rounded-full bg-[#e3a7a5] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#264636] transition hover:bg-[#efbbb9]"
                >
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
                  <p className="mt-2 text-sm leading-6 text-[#f7f1e8]/68">
                    Most recent submission timestamp currently loaded.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#e3a7a5]/76">admin tools</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setTab('applications')}
                      className="inline-flex min-h-11 items-center rounded-full border border-[#e3a7a5]/18 bg-[#e3a7a5]/10 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/15"
                    >
                      <ClipboardList className="mr-2 h-4 w-4" />
                      view applications
                    </button>
                    <button
                      type="button"
                      onClick={() => load(password)}
                      className="inline-flex min-h-11 items-center rounded-full border border-[#e3a7a5]/18 bg-black/15 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      refresh data
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
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFilter(option.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-black uppercase tracking-[0.14em] transition ${
                      filter === option.value
                        ? 'border-[#e3a7a5] bg-[#e3a7a5] text-[#264636]'
                        : 'border-[#e3a7a5]/18 bg-black/20 text-[#f7f1e8] hover:bg-[#e3a7a5]/10'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {status === 'loading' ? (
                <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-6 text-sm text-[#f7f1e8]/78">
                  loading submissions...
                </div>
              ) : null}

              {status === 'error' ? (
                <div className="rounded-[1.5rem] border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-100">
                  {error}
                </div>
              ) : null}

              {status === 'ready' && items.length === 0 ? (
                <div className="rounded-[1.5rem] border border-[#e3a7a5]/18 bg-black/20 p-6 text-sm text-[#f7f1e8]/78">
                  no submissions yet.
                </div>
              ) : null}

              <div className="grid gap-4">
                {items.map((item) => (
                  <SubmissionCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
