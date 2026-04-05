import { clean, insertSubmission, isEmail, json } from './_shared'

export async function onRequestPost(context) {
  try {
    const body = await context.request.json()

    const payload = {
      name: clean(body.name),
      email: clean(body.email),
      phone: clean(body.phone),
      subject_name: clean(body.preferred_role || body.backup_role || 'Volunteer'),
      preferred_role: clean(body.preferred_role),
      backup_role: clean(body.backup_role),
      availability: clean(body.availability),
      notes: clean(body.notes),
    }

    if (!payload.name) return json({ error: 'Volunteer name is required.' }, 400)
    if (!isEmail(payload.email)) return json({ error: 'A valid email is required.' }, 400)
    if (!payload.preferred_role) return json({ error: 'Choose a preferred role.' }, 400)
    if (!payload.availability) return json({ error: 'Tell us your availability.' }, 400)

    return insertSubmission(context, 'volunteer', payload)
  } catch (error) {
    return json({ error: error?.message || 'Volunteer submission failed.' }, 500)
  }
}
