import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

const baseFieldClasses =
  'w-full rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-3 text-sm text-[#f7f1e8] placeholder:text-[#f7f1e8]/40 focus:border-[#e3a7a5]/50 focus:outline-none'

function normalizeRoles(items) {
  const list = Array.isArray(items) ? items : []
  const seen = new Set()
  return list
    .filter((item) => item && item.role)
    .map((item) => ({
      id: item.id || `${item.role}-${item.shiftDate || ''}-${item.shiftStart || ''}`,
      role: item.role,
      area: item.area || 'General',
      shiftDate: item.shiftDate || '',
      shiftStart: item.shiftStart || '',
      shiftEnd: item.shiftEnd || '',
    }))
    .filter((item) => {
      const key = `${item.role}|${item.area}|${item.shiftDate}|${item.shiftStart}|${item.shiftEnd}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function RoleChip({ role, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
        selected
          ? 'border-[#e3a7a5] bg-[#e3a7a5] text-[#264636]'
          : 'border-[#e3a7a5]/20 bg-black/20 text-[#f7f1e8] hover:bg-[#e3a7a5]/10'
      }`}
    >
      {role.role}
      <span className="ml-2 text-xs opacity-80">{role.area}</span>
      {role.shiftDate ? <span className="ml-2 text-[11px] opacity-70">{role.shiftDate}{role.shiftStart ? ` ${role.shiftStart}` : ''}</span> : null}
    </button>
  )
}

export default function VolunteerApplicationPage() {
  const [status, setStatus] = React.useState('idle')
  const [error, setError] = React.useState('')
  const [roles, setRoles] = React.useState([])
  const [rolesStatus, setRolesStatus] = React.useState('loading')
  const [form, setForm] = React.useState({ name: '', email: '', phone: '', availability: '', preferredRoles: [], notes: '' })

  React.useEffect(() => {
    let alive = true
    async function loadRoles() {
      try {
        const response = await fetch('/api/ops/roles', { headers: { Accept: 'application/json' } })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data?.error || 'Could not load volunteer roles.')
        if (!alive) return
        setRoles(normalizeRoles(data?.roles))
        setRolesStatus('ready')
      } catch {
        if (!alive) return
        setRoles([])
        setRolesStatus('error')
      }
    }
    loadRoles()
    return () => { alive = false }
  }, [])

  function updateField(key, value) { setForm((current) => ({ ...current, [key]: value })) }

  function toggleRole(role) {
    setForm((current) => {
      const exists = current.preferredRoles.some((item) => item.id === role.id)
      return { ...current, preferredRoles: exists ? current.preferredRoles.filter((item) => item.id !== role.id) : [...current.preferredRoles, role] }
    })
  }

  async function onSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    setError('')
    try {
      const response = await fetch('/api/forms/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          availability: form.availability.trim(),
          preferred_roles: form.preferredRoles.map((item) => ({ id: item.id, role: item.role, area: item.area, shift_date: item.shiftDate, shift_start: item.shiftStart, shift_end: item.shiftEnd })),
          notes: form.notes.trim(),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'Volunteer submission failed.')
      setStatus('success')
    } catch (err) {
      setStatus('idle')
      setError(err?.message || 'Volunteer submission failed.')
    }
  }

  return (
    <div className="min-h-screen bg-[#264636] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center rounded-full border border-[#e3a7a5]/20 bg-black/20 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10"><ArrowLeft className="mr-2 h-4 w-4" />back to may day</Link>
        </div>
        <div className="rounded-[2rem] border border-[#e3a7a5]/18 bg-black/20 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-[#e3a7a5]/80">application</p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#e3a7a5] sm:text-5xl">volunteer application</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#f7f1e8]/84">Pick the roles that interest you and tell us when you are available.</p>
          {status === 'success' ? (
            <div className="mt-8 rounded-[1.5rem] border border-[#e3a7a5]/18 bg-[#e3a7a5]/10 p-6">
              <div className="flex items-center gap-3 text-[#e3a7a5]"><CheckCircle2 className="h-6 w-6" /><h2 className="text-xl font-black uppercase tracking-tight">volunteer application submitted</h2></div>
              <p className="mt-3 leading-7 text-[#f7f1e8]/82">We saved your submission and can pull it straight into the ops console.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">contact name</span><input className={baseFieldClasses} value={form.name} onChange={(e) => updateField('name', e.target.value)} required /></label>
                <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">email</span><input type="email" className={baseFieldClasses} value={form.email} onChange={(e) => updateField('email', e.target.value)} required /></label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">phone</span><input className={baseFieldClasses} value={form.phone} onChange={(e) => updateField('phone', e.target.value)} /></label>
                <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">availability</span><input className={baseFieldClasses} value={form.availability} onChange={(e) => updateField('availability', e.target.value)} placeholder="Example: mornings, all day May 1, cleanup only" /></label>
              </div>
              <div className="block">
                <span className="mb-3 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">preferred roles</span>
                {rolesStatus === 'loading' ? (
                  <div className="rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-4 text-sm text-[#f7f1e8]/78">Loading open roles...</div>
                ) : roles.length ? (
                  <div className="flex flex-wrap gap-2">{roles.map((role) => <RoleChip key={role.id} role={role} selected={form.preferredRoles.some((item) => item.id === role.id)} onToggle={() => toggleRole(role)} />)}</div>
                ) : (
                  <div className="rounded-2xl border border-[#e3a7a5]/20 bg-black/20 px-4 py-4 text-sm text-[#f7f1e8]/78">No open roles were published yet. You can still apply and tell us what kind of help you want to offer in the notes.</div>
                )}
              </div>
              <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#e3a7a5]/82">anything else</span><textarea rows={4} className={baseFieldClasses} value={form.notes} onChange={(e) => updateField('notes', e.target.value)} /></label>
              {error ? <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
              <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={status === 'submitting'} className="inline-flex min-h-12 items-center rounded-full bg-[#e3a7a5] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#264636] transition hover:bg-[#efbbb9] disabled:cursor-not-allowed disabled:opacity-70">{status === 'submitting' ? 'submitting...' : 'submit application'}</button>
                <Link to="/" className="inline-flex min-h-12 items-center rounded-full border border-[#e3a7a5]/18 bg-black/20 px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#f7f1e8] transition hover:bg-[#e3a7a5]/10">cancel</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
