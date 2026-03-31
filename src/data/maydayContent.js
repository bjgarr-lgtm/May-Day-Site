export const quickLinks = [
  { id: 'schedule', label: 'Schedule', icon: 'CalendarDays' },
  { id: 'map', label: 'Map', icon: 'MapPinned' },
  { id: 'hunt', label: 'Scavenger Hunt', icon: 'Search' },
  { id: 'info', label: 'Event Info', icon: 'Info' },
  { id: 'shop', label: 'Shop', icon: 'ShoppingBag' },
]

export const highlights = [
  'free entry',
  'family friendly',
  'masks required and provided',
  'vendors through 7 pm',
  'live music at night',
  'film screening',
  'art center',
  'potluck',
  'raffle',
  'zine distro',
]

export const timeline = [
  { time: '12:00 pm', title: 'welcome center opens', detail: 'maps, orientation, hunt start, info, family activities' },
  { time: '12:00 pm to 7:00 pm', title: 'may day festivities and potluck', detail: 'community programming, art, food, history, and tabling' },
  { time: '7:00 pm', title: 'screening of labor wars of the northwest', detail: 'indoor evening program' },
  { time: '8:00 pm to 12:00 am', title: 'live music', detail: 'night programming indoors' },
]

export const scheduleItems = [
  { time: '12:00 pm', category: 'all', title: 'welcome center opens', area: 'main entry', blurb: 'Start here for maps, scavenger hunt info, schedule, and accessibility information.' },
  { time: '12:00 pm to 7:00 pm', category: 'family', title: 'may day festivities and potluck', area: 'site wide', blurb: 'Community activities, food, art, and working class history throughout the venue.' },
  { time: 'all day', category: 'family', title: 'diy and guided art', area: 'art center', blurb: 'Face painting, diy art, guided art, scavenger hunt activities, and community projects.' },
  { time: '12:00 pm to 7:00 pm', category: 'vendors', title: 'vendors and info booths', area: 'indoors', blurb: 'Local vendors, mutual aid tables, community organizations, labor and grassroots groups.' },
  { time: '7:00 pm', category: 'film', title: 'labor wars of the northwest', area: 'stage', blurb: 'Film screening as part of the evening program.' },
  { time: '8:00 pm to 12:00 am', category: 'music', title: 'live music', area: 'stage', blurb: 'Nighttime music programming.' },
]

export const mapZones = [
  { title: 'Welcome Center', swatchClassName: 'bg-yellow-300/80', blurb: 'Your starting point for event info, player guide, map help, and scavenger hunt orientation.' },
  { title: 'Activities', swatchClassName: 'bg-lime-400/70', blurb: 'Games, family friendly tasks, activity based hunt stops, and casual roaming fun.' },
  { title: 'Art Center', swatchClassName: 'bg-fuchsia-400/70', blurb: 'Face painting, diy art, collaborative projects, and the hands on bits that make events worth attending.' },
  { title: 'Vendors', swatchClassName: 'bg-rose-400/70', blurb: 'Local sellers, organizations, tablers, and practical ways to support the event and community work.' },
  { title: 'Indoors', swatchClassName: 'bg-amber-300/80', blurb: 'History displays, evening film screening, music, and all primary programming areas.' },
]

export const infoCards = [
  { title: 'who this is for', body: 'The whole family, the whole community, and especially working class people who want a free day of history, art, music, food, and connection.' },
  { title: 'health and safety', body: 'Masks are required and provided. Keep the event accessible, community minded, and safer for everyone present.' },
  { title: 'why may day', body: 'To honor working class history, labor struggle, local memory, and the projects still trying to build something better now.' },
]

export const practicalInfo = [
  { title: 'venue', body: 'Historical Seaport, 500 N. Custer St., Aberdeen, WA 98520.' },
  { title: 'family friendly', body: 'Daytime programming is built for the whole community, with art activities, games, vendors, food, and casual learning.' },
  { title: 'masks', body: 'Required and provided.' },
  { title: 'parking', body: 'Plenty of parking is available. Use the arrival map for the drive in and building approach.' },
  { title: 'accessibility', body: 'Add mobility notes, seating, restrooms, quiet space, and any terrain or entry information here once the venue map is finalized.' },
  { title: 'contact', body: 'maydayontheharbor@proton.me' },
]

export const merchItems = [
  { title: 'yearly event posters', desc: 'Yearly poster art and printed keepsakes.', cta: 'view merch', imageSrc: '/shop/poster.webp' },
  { title: 'shirts and hoodies', desc: 'Wearable fundraiser items and event support gear.', cta: 'shop apparel', imageSrc: '/shop/shirt.webp' },
  { title: 'support the event', desc: 'Merch and fundraiser sales help pay for this year and the next one.', cta: 'support may day', imageSrc: '/shop/support.png' },
]

export const huntCategories = [
  { title: 'Activities', stops: 14, detail: 'Photo tasks, physical challenges, riddles, hidden codes, direct interaction, and letter writing.' },
  { title: 'Vendors', stops: 13, detail: 'Social posts, zines, mutual aid clues, trades, hidden objects, and a strange classified detour.' },
  { title: 'Indoors', stops: 13, detail: 'History displays, IWW lore, red thread puzzles, poetry, building based discovery, and deeper ARG pieces.' },
]

export const siteMeta = {
  title: 'May Day on the Harbor 2026',
  subtitle: '6th annual • Aberdeen, Washington',
  description: 'A free, family friendly, working class community event with history, art, music, food, vendors, film, and ways to plug into real local projects.',
  dateLabel: 'May 2 2026',
  hoursLabel: '12 pm to 12 am',
  freeLabel: 'free entry',
  shopHref: 'https://maydayontheharbor.square.site/',
  donateHref: 'https://hcb.hackclub.com/donations/start/may-day-organizing-committee',
  linktreeHref: 'https://linktr.ee/maydayontheharbor',
  vendorHref: '/vendor-application',
  performerHref: '/performer-application',
  volunteerEmail: 'mailto:maydayontheharbor@proton.me?subject=May%20Day%20Volunteer',
  mapHref: 'https://canva.link/tz2eq2avtaqloby',
  contactEmail: 'maydayontheharbor@proton.me',
  venueName: 'Historical Seaport',
  venueAddress: '500 N. Custer St., Aberdeen, WA 98520',
  facebookHref: 'https://www.facebook.com/profile.php?id=61574621251510',
  instagramHref: 'https://www.instagram.com/maydayontheharbor/',
  laborHistoryHref: '/labor-history',
}
