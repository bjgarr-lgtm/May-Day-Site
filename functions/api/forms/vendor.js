import { clean, insertSubmission, isEmail, json } from './_shared'

export async function onRequestPost(context) {
  try {
    const body = await context.request.json()

    const payload = {
      name: clean(body.name),
      email: clean(body.email),
      phone: clean(body.phone),
      subject_name: clean(body.organization_name),
      organization_name: clean(body.organization_name),
      website: clean(body.website),
      social_links: clean(body.social_links),
      description: clean(body.description),
      needs: clean(body.needs),
      notes: clean(body.notes),
    }

    if (!payload.name) return json({ error: 'Contact name is required.' }, 400)
    if (!isEmail(payload.email)) return json({ error: 'A valid email is required.' }, 400)
    if (!payload.organization_name) return json({ error: 'Vendor or organization name is required.' }, 400)
    if (!payload.description) return json({ error: 'Tell us what you are bringing.' }, 400)

    return insertSubmission(context, 'vendor', payload)
  } catch (error) {
    return json({ error: error?.message || 'Vendor submission failed.' }, 500)
  }
}
