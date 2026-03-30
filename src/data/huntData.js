export const huntRoutes = [
  {
    title: 'activities',
    slug: 'activities',
    intro: 'Movement, noticing, and playful prompts spread through the event.',
    stops: [
      {
        id: 'welcome-banner',
        title: 'welcome banner',
        clue: 'Find the starting point where people get oriented for the day.',
        answerPrompt: 'What phrase on the banner best sums up the spirit of the event?',
        hint: 'You do not need to overthink this one. Start where people start.',
      },
      {
        id: 'kid-corner',
        title: 'kid corner',
        clue: 'Locate the place most likely to have hands busy and paint somewhere it should not be.',
        answerPrompt: 'Name one activity happening in this area.',
        hint: 'Family friendly chaos is your compass.',
      },
    ],
  },
  {
    title: 'art center',
    slug: 'art-center',
    intro: 'Creative tasks, making stations, and collaborative art clues.',
    stops: [
      {
        id: 'community-piece',
        title: 'community piece',
        clue: 'Find the work that many hands are helping build.',
        answerPrompt: 'What materials are people adding or using here?',
        hint: 'Look for the area where the art is not finished because that is the point.',
      },
      {
        id: 'face-painting',
        title: 'face painting',
        clue: 'Find the station where people leave more colorful than they arrived.',
        answerPrompt: 'What designs or colors do you notice most?',
        hint: 'Check the line with the most glitter and patience.',
      },
    ],
  },
  {
    title: 'vendors',
    slug: 'vendors',
    intro: 'Find tables, people, and objects across the vendor area.',
    stops: [
      {
        id: 'radical-table',
        title: 'radical table',
        clue: 'Find a table sharing resources, literature, or tools for getting involved.',
        answerPrompt: 'What project or organization did you find?',
        hint: 'Look for flyers, sign-up sheets, or people talking to strangers on purpose.',
      },
      {
        id: 'merch-spot',
        title: 'merch spot',
        clue: 'Find the place where supporting the event also gets you something to carry home.',
        answerPrompt: 'What item would you be most tempted to buy?',
        hint: 'Posters, shirts, patches, or other fundraiser goods are your lead.',
      },
    ],
  },
  {
    title: 'indoors',
    slug: 'indoors',
    intro: 'History, displays, and evening programming inside the venue.',
    stops: [
      {
        id: 'history-wall',
        title: 'history wall',
        clue: 'Find where the past is being pinned up, framed, or explained.',
        answerPrompt: 'Name one theme, person, or event you saw represented.',
        hint: 'The answer is probably hanging on a wall and asking you to read.',
      },
      {
        id: 'film-room',
        title: 'film room',
        clue: 'Find the area that turns into screening space later in the day.',
        answerPrompt: 'What film is listed for the evening program?',
        hint: 'This one rewards people who can read a schedule.',
      },
    ],
  },
  {
    title: 'outdoors',
    slug: 'outdoors',
    intro: 'Explore the exterior paths, wharf space, and open-air event flow.',
    stops: [
      {
        id: 'water-view',
        title: 'water view',
        clue: 'Find a spot where the harbor itself becomes part of the event backdrop.',
        answerPrompt: 'What can you see or hear from this point?',
        hint: 'Face outward for a second. The location matters here.',
      },
      {
        id: 'music-setup',
        title: 'music setup',
        clue: 'Find where sound equipment, performers, or stage prep is gathering.',
        answerPrompt: 'What kind of performance space does it look like this area becomes?',
        hint: 'Follow cables, speakers, or the universal signs of a future noise problem.',
      },
    ],
  },
]

export function getAllStops() {
  return huntRoutes.flatMap((route) =>
    route.stops.map((stop, index) => ({
      ...stop,
      category: route.slug,
      categoryTitle: route.title,
      routeIntro: route.intro,
      number: index + 1,
    }))
  )
}

export function getRouteBySlug(slug) {
  return huntRoutes.find((route) => route.slug === slug)
}

export function getStop(category, stopId) {
  const route = getRouteBySlug(category)
  if (!route) return null
  const stop = route.stops.find((item) => item.id === stopId)
  if (!stop) return null
  const index = route.stops.findIndex((item) => item.id === stopId)
  return {
    ...stop,
    category: route.slug,
    categoryTitle: route.title,
    routeIntro: route.intro,
    number: index + 1,
    totalStops: route.stops.length,
  }
}
