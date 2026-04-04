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
      instagram: clean(body.instagram),
      location: clean(body.location),
      artwork_link: clean(body.artwork_link),
      portfolio_link: clean(body.portfolio_link),
      statement: clean(body.statement),
      notes: clean(body.notes),
    }

    if (!payload.name) return json({ error: 'Contact name is required.' }, 400)
    if (!isEmail(payload.email)) return json({ error: 'A valid email is required.' }, 400)
    if (!payload.artist_name) return json({ error: 'Artist name is required.' }, 400)
    if (!payload.artwork_link) return json({ error: 'Please include a link to your poster submission.' }, 400)

    return insertSubmission(context, 'poster_art', payload)
  } catch (error) {
    return json({ error: error?.message || 'Poster art submission failed.' }, 500)
  }
}
