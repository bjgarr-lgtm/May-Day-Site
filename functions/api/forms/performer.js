import { clean, insertSubmission, isEmail, json } from './_shared'

export async function onRequestPost(context) {
  try {
    const body = await context.request.json()

    const payload = {
      name: clean(body.name),
      email: clean(body.email),
      phone: clean(body.phone),
      subject_name: clean(body.artist_name),
      artist_name: clean(body.artist_name),
      location: clean(body.location),
      genre: clean(body.genre),
      links: clean(body.links),
      description: clean(body.description),
      tech_needs: clean(body.tech_needs),
      notes: clean(body.notes),
    }

    if (!payload.name) return json({ error: 'Contact name is required.' }, 400)
    if (!isEmail(payload.email)) return json({ error: 'A valid email is required.' }, 400)
    if (!payload.artist_name) return json({ error: 'Artist or band name is required.' }, 400)
    if (!payload.links) return json({ error: 'Share at least one music or media link.' }, 400)
    if (!payload.description) return json({ error: 'Give a short description.' }, 400)

    return insertSubmission(context, 'performer', payload)
  } catch (error) {
    return json({ error: error?.message || 'Performer submission failed.' }, 500)
  }
}
