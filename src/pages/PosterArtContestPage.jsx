import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Upload } from 'lucide-react'

const baseFieldClasses =
  'w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8] placeholder:text-[#f7f1e8]/40 focus:border-[#e3a7a5]/50 focus:outline-none'

function normalizePayload(form, upload) {
  return {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    artist_name: form.artistName.trim(),
    instagram: form.instagram.trim(),
    location: form.location.trim(),
    artwork_key: upload?.key || '',
    artwork_filename: upload?.filename || '',
    artwork_mime: upload?.contentType || '',
    artwork_url: upload?.viewUrl || '',
    portfolio_link: form.portfolioLink.trim(),
    statement: form.statement.trim(),
    notes: form.notes.trim(),
  }
}

export default function PosterArtContestPage() {
  const [status, setStatus] = useState('idle')
  const [uploadStatus, setUploadStatus] = useState('idle')
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    artistName: '',
    instagram: '',
    location: '',
    portfolioLink: '',
    statement: '',
    notes: '',
  })

  const endpoint = useMemo(() => '/api/forms/poster-art', [])

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function uploadArtwork() {
    if (!selectedFile) {
      throw new Error('Please choose an image file to upload.')
    }

    setUploadStatus('uploading')

    const formData = new FormData()
    formData.append('file', selectedFile)

    const response = await fetch('/api/uploads/poster-art', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data?.error || 'Artwork upload failed.')
    }

    setUploadStatus('done')
    return data
  }

  async function onSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    setError('')

    try {
      const upload = await uploadArtwork()

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizePayload(form, upload)),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || 'Submission failed.')
      }

      setStatus('success')
    } catch (err) {
      setStatus('idle')
      setUploadStatus('idle')
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
          <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/80">new this year</p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#e3a7a5] sm:text-5xl">
            poster art contest
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#f7f1e8]/84">
            New this year: we’re opening the poster to local artists. We want May Day on the Harbor to look like the Harbor. Submit your art for a chance to become this year’s official poster. We’ll choose a winning piece and announce it on event day. Our visual identity draws from ornate, symbolic, and narrative-driven illustration, similar to historical labor prints, woodcuts, and art nouveau compositions.

              Core Themes
              Solidarity and collective action
              Labor and working-class power
              Mutual aid and community care
              Growth, resistance, and transformation
              Land, harbor, and regionally rooted identity
              Visual Direction

              We are especially drawn to artwork that includes:

              Human figures in motion or collaboration (workers, organizers, community members)
              Symbolic elements (plants, tools, banners, fire, water, roots, etc.)
              Flowing composition (ribbons, text banners, circular or vertical movement)
              Ornate or structured borders
              Dense, detailed storytelling imagery

              Styles that resonate:

              Woodcut / linocut aesthetics
              Engraving-style linework
              Art nouveau composition and framing
              High-contrast illustration (black and white or limited palette)
              Tone
              Bold but not corporate
              Radical but not sterile
              Mythic, grounded, and human
              Serious, but alive

              Avoid:

              Generic protest graphics
              Clip-art style or overly digital/flat design
              Minimalist logos as the primary focus
              Color
              Black & white strongly encouraged
              Limited color palettes welcome
              Should remain legible when printed
              Text (optional)

              Artists may include:

              “May Day on the Harbor”
              Date/location (optional depending on use case)
              Banners or embedded text elements in the illustration
              Format Requirements
              Vertical poster format preferred
              High resolution (print-ready)
              Must scale well for web and print
          </p>

          <div className="mt-6 rounded-[1.5rem] border border-[#e3a7a5]/18 bg-[#e3a7a5]/8 p-5 text-sm leading-7 text-[#f7f1e8]/82">
            Upload your actual artwork file here. Images only. Max file size 15 MB.
          </div>

          {status === 'success' ? (
            <div className="mt-8 rounded-[1.5rem] border border-[#e3a7a5]/18 bg-[#e3a7a5]/10 p-6">
              <div className="flex items-center gap-3 text-[#e3a7a5]">
                <CheckCircle2 className="h-6 w-6" />
                <h2 className="text-xl font-black uppercase tracking-tight">poster art submitted</h2>
              </div>
              <p className="mt-3 leading-7 text-[#f7f1e8]/82">
                We saved your submission. We’ll review entries and announce the selected artist on event day.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                    contact name
                  </span>
                  <input className={baseFieldClasses} value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                    email
                  </span>
                  <input type="email" className={baseFieldClasses} value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                    phone
                  </span>
                  <input className={baseFieldClasses} value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                    artist name
                  </span>
                  <input className={baseFieldClasses} value={form.artistName} onChange={(e) => updateField('artistName', e.target.value)} required />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                    instagram
                  </span>
                  <input className={baseFieldClasses} placeholder="@yourhandle" value={form.instagram} onChange={(e) => updateField('instagram', e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                    location
                  </span>
                  <input className={baseFieldClasses} value={form.location} onChange={(e) => updateField('location', e.target.value)} />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                  poster artwork file
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                  className="block w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8] file:mr-4 file:rounded-full file:border-0 file:bg-[#e3a7a5] file:px-4 file:py-2 file:text-sm file:font-black file:uppercase file:tracking-[0.12em] file:text-[#264636]"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  required
                />
                {selectedFile ? (
                  <p className="mt-2 text-sm text-[#f7f1e8]/68">
                    selected: {selectedFile.name}
                  </p>
                ) : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                  portfolio or additional work link
                </span>
                <input
                  type="url"
                  className={baseFieldClasses}
                  placeholder="https://..."
                  value={form.portfolioLink}
                  onChange={(e) => updateField('portfolioLink', e.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                  short artist statement
                </span>
                <textarea rows={4} className={baseFieldClasses} value={form.statement} onChange={(e) => updateField('statement', e.target.value)} />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">
                  anything else
                </span>
                <textarea rows={3} className={baseFieldClasses} value={form.notes} onChange={(e) => updateField('notes', e.target.value)} />
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
                  <Upload className="mr-2 h-4 w-4" />
                  {status === 'submitting'
                    ? uploadStatus === 'uploading'
                      ? 'uploading artwork...'
                      : 'submitting...'
                    : 'submit poster art'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
