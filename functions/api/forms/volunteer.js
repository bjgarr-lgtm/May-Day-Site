import { clean, insertSubmission, isEmail, json } from './_shared'

function normalizePreferredRoles(value) {
  const list = Array.isArray(value) ? value : []
  return list.map((item) => ({ id: clean(item?.id), role: clean(item?.role), area: clean(item?.area), shift_date: clean(item?.shift_date), shift_start: clean(item?.shift_start), shift_end: clean(item?.shift_end) })).filter((item) => item.role)
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json()
    const preferredRoles = normalizePreferredRoles(body.preferred_roles)
    const payload = {
      name: clean(body.name),
      email: clean(body.email),
      phone: clean(body.phone),
      subject_name: preferredRoles.length ? preferredRoles.map((item) => item.role).join(', ') : 'Volunteer application',
      availability: clean(body.availability),
      preferred_roles: preferredRoles,
      notes: clean(body.notes),
    }
    if (!payload.name) return json({ error: 'Contact name is required.' }, 400)
    if (!isEmail(payload.email)) return json({ error: 'A valid email is required.' }, 400)
    if (!payload.availability && !preferredRoles.length && !payload.notes) return json({ error: 'Tell us when you are available or what kind of help you want to offer.' }, 400)
    return insertSubmission(context, 'volunteer', payload)
  } catch (error) {
    return json({ error: error?.message || 'Volunteer submission failed.' }, 500)
  }
}
