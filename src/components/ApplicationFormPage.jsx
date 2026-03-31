import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

const baseFieldClasses =
  'w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8] placeholder:text-[#f7f1e8]/40 focus:border-[#e3a7a5]/50 focus:outline-none'

function normalizePayload(type, form) {
  if (type === 'vendor') {
    return {
      type,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      organization_name: form.organizationName.trim(),
      website: form.website.trim(),
      social_links: form.socialLinks.trim(),
      description: form.description.trim(),
      needs: form.needs.trim(),
      notes: form.notes.trim(),
    }
  }

  return {
    type,
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    artist_name: form.artistName.trim(),
    location: form.location.trim(),
    genre: form.genre.trim(),
    links: form.links.trim(),
    description: form.description.trim(),
    tech_needs: form.techNeeds.trim(),
    notes: form.notes.trim(),
  }
}

export default function ApplicationFormPage({
  type,
  title,
  intro,
  successTitle,
  successBody,
}) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [form, setForm] = useState(
    type === 'vendor'
      ? {
          name: '',
          email: '',
          phone: '',
          organizationName: '',
          website: '',
          socialLinks: '',
          description: '',
          needs: '',
          notes: '',
        }
      : {
          name: '',
          email: '',
          phone: '',
          artistName: '',
          location: '',
          genre: '',
          links: '',
          description: '',
          techNeeds: '',
          notes: '',
        }
  )

  const endpoint = useMemo(() => `/api/forms/${type}`, [type])

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function onSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    setError('')

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizePayload(type, form)),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.error || 'Submission failed.')
      }

      setStatus('success')
    } catch (err) {
      setStatus('idle')
      setError(err?.message || 'Something went wrong.')
    }
  }

  return (
    <div className="min-h-screen bg-[#264636] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center rounded-full border border-[#e3a7a5]/20 bg-black/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            back to may day
          </Link>
        </div>

        <div className="rounded-[2rem] border border-[#e3a7a5]/18 bg-black/20 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/80">
            application
          </p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#e3a7a5] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#f7f1e8]/84">
            {intro}
          </p>

          {status === 'success' ? (
            <div className="mt-8 rounded-[1.5rem] border border-[#e3a7a5]/18 bg-[#e3a7a5]/10 p-6">
              <div className="flex items-center gap-3 text-[#e3a7a5]">
                <CheckCircle2 className="h-6 w-6" />
                <h2 className="text-xl font-black uppercase tracking-tight">{successTitle}</h2>
              </div>
              <p className="mt-3 leading-7 text-[#f7f1e8]/82">{successBody}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                    contact name
                  </span>
                  <input
                    className={baseFieldClasses}
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                    email
                  </span>
                  <input
                    type="email"
                    className={baseFieldClasses}
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                    phone
                  </span>
                  <input
                    className={baseFieldClasses}
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </label>

                {type === 'vendor' ? (
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                      vendor or organization name
                    </span>
                    <input
                      className={baseFieldClasses}
                      value={form.organizationName}
                      onChange={(e) => updateField('organizationName', e.target.value)}
                      required
                    />
                  </label>
                ) : (
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                      artist or band name
                    </span>
                    <input
                      className={baseFieldClasses}
                      value={form.artistName}
                      onChange={(e) => updateField('artistName', e.target.value)}
                      required
                    />
                  </label>
                )}
              </div>

              {type === 'vendor' ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                      website
                    </span>
                    <input
                      className={baseFieldClasses}
                      value={form.website}
                      onChange={(e) => updateField('website', e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                      social links
                    </span>
                    <input
                      className={baseFieldClasses}
                      value={form.socialLinks}
                      onChange={(e) => updateField('socialLinks', e.target.value)}
                    />
                  </label>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                      location
                    </span>
                    <input
                      className={baseFieldClasses}
                      value={form.location}
                      onChange={(e) => updateField('location', e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                      genre or style
                    </span>
                    <input
                      className={baseFieldClasses}
                      value={form.genre}
                      onChange={(e) => updateField('genre', e.target.value)}
                    />
                  </label>
                </div>
              )}

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                  {type === 'vendor' ? 'what are you bringing' : 'links to music or media'}
                </span>
                <textarea
                  rows={4}
                  className={baseFieldClasses}
                  value={type === 'vendor' ? form.description : form.links}
                  onChange={(e) =>
                    updateField(type === 'vendor' ? 'description' : 'links', e.target.value)
                  }
                  required
                />
              </label>

              {type === 'vendor' ? (
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                    setup needs
                  </span>
                  <textarea
                    rows={3}
                    className={baseFieldClasses}
                    value={form.needs}
                    onChange={(e) => updateField('needs', e.target.value)}
                  />
                </label>
              ) : (
                <>
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                      short description
                    </span>
                    <textarea
                      rows={4}
                      className={baseFieldClasses}
                      value={form.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                      tech needs
                    </span>
                    <textarea
                      rows={3}
                      className={baseFieldClasses}
                      value={form.techNeeds}
                      onChange={(e) => updateField('techNeeds', e.target.value)}
                    />
                  </label>
                </>
              )}

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                  anything else
                </span>
                <textarea
                  rows={3}
                  className={baseFieldClasses}
                  value={form.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                />
              </label>

              {error ? (
                <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="inline-flex min-h-12 items-center rounded-full bg-[#e3a7a5] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#264636] transition hover:bg-[#efbbb9] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === 'submitting' ? 'submitting...' : 'submit application'}
                </button>
                <Link
                  to="/"
                  className="inline-flex min-h-12 items-center rounded-full border border-[#e3a7a5]/18 bg-black/20 px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"
                >
                  cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
