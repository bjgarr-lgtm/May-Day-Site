import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Mail, Phone, RefreshCw } from 'lucide-react'

const filterOptions = [
  { value: 'all', label: 'all submissions' },
  { value: 'vendor', label: 'vendors' },
  { value: 'performer', label: 'performers' },
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
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {href ? (
        <a
          href={href}
          target={href.startsWith('mailto:') || href.startsWith('tel:') ? '_self' : '_blank'}
          rel={href.startsWith('mailto:') || href.startsWith('tel:') ? undefined : 'noreferrer'}
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

export default function ApplicationsDashboardPage() {
  const [filter, setFilter] = useState('all')
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [items, setItems] = useState([])

  const endpoint = useMemo(() => {
    const query = filter === 'all' ? '' : `?type=${encodeURIComponent(filter)}`
    return `/api/forms/submissions${query}`
  }, [filter])

  async function load() {
    setStatus('loading')
    setError('')
    try {
      const response = await fetch(endpoint, { headers: { Accept: 'application/json' } })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || 'Could not load submissions.')
      }
      setItems(Array.isArray(data?.items) ? data.items : [])
      setStatus('ready')
    } catch (err) {
      setError(err?.message || 'Could not load submissions.')
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [endpoint])

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

          <button
            type="button"
            onClick={load}
            className="inline-flex items-center rounded-full border border-[#e3a7a5]/20 bg-black/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            refresh
          </button>
        </div>

        <div className="rounded-[2rem] border border-[#e3a7a5]/18 bg-black/20 p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/80">submissions</p>
              <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#e3a7a5] sm:text-5xl">
                applications dashboard
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#f7f1e8]/84">
                Read vendor and performer applications without digging through the database like a mole person.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
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
          </div>

          <div className="mt-8">
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
        </div>
      </div>
    </div>
  )
}
