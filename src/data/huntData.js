export const huntRoutes = [
  {
    title: 'activities',
    slug: 'activities',
    intro: 'Physical games, weird tasks, riddles, hidden codes, and direct interaction with volunteers.',
    stops: [
      { id: 'photo-booth', title: 'photo booth', clue: 'Find the place that offers a fleeting glimpse of fame, a frozen moment, and a captured name.', answerPrompt: 'Take a photo booth photo, post it with the event hashtag, and show a volunteer to continue.', hint: 'This one is a real world activity stop. The next code comes from a volunteer, not the site.', completionType: 'volunteer' },
      { id: 'bowling-capitalists', title: 'bowling down the capitalists', clue: 'Find the game setup where bankers, landlords, billionaires, cops, CEOs, and oil execs are lined up to fall.', answerPrompt: 'Knock down at least three capitalist pins and get the next clue from a volunteer.', hint: 'No gutterballs for the people.', completionType: 'volunteer' },
      { id: 'face-paint', title: 'face paint station', clue: 'Find the place where your face becomes part of the movement.', answerPrompt: 'Get your face painted, then check in with a volunteer for the next clue.', hint: 'Symbol, stripe, flower, skull, star, whatever feels right.', completionType: 'volunteer' },
      { id: 'paper-die', title: 'giant paper die', clue: 'Find the giant paper die with six sides, five numbers, and one QR code.', answerPrompt: 'Roll the die until the QR side lands face up. Scan it only when luck allows.', hint: 'This code is intentionally only visible in the world challenge flow.', completionType: 'onsite-only' },
      { id: 'obstacle-course', title: 'inflatable obstacle course', clue: 'Climb, crawl, bounce, and thrash your way through the inflatable obstacle course.', answerPrompt: 'Make it to the other side and get the next clue from the volunteer at the finish line.', hint: 'No speed required. Flailing dramatically is spiritually correct.', completionType: 'volunteer' },
      { id: 'haymarket', title: 'haymarket square', clue: 'Answer the labor history question about the 1886 uprising that became foundational to the workers movement and the origin of May Day.', answerPrompt: 'What is the name of the square where it all went down?', hint: 'The answer is unlocked at the booth where the tail is pinned.', completionType: 'password' },
      { id: 'solidarity-riddle', title: 'solidarity riddle', clue: 'Solve the riddle about something born in break rooms, forged in chants, and whispered between tired hands.', answerPrompt: 'What is the start of every strike?', hint: 'You cannot own it, yet it owns the fight.', completionType: 'password' },
      { id: 'perspective-hunt', title: 'perspective hunt', clue: 'Find the real world version of the mystery photo and stand where the camera stood.', answerPrompt: 'Scan the hidden QR code once you locate the matching perspective.', hint: 'This code only reveals itself from the right angle in the physical space.', completionType: 'onsite-only' },
      { id: 'red-thread', title: 'red thread', clue: 'Follow the wild red thread through cones, chairs, trash bins, tape lines, protest signs, and whatever else it wraps around.', answerPrompt: 'Find the hidden pouch or last knot where the next QR code waits.', hint: 'It may split or disappear, but the true line continues.', completionType: 'onsite-only' },
      { id: 'abc-letter', title: 'anarchist black cross letter', clue: 'Go to the Anarchist Black Cross table and write a letter to an incarcerated comrade.', answerPrompt: 'Turn in your letter and receive the clue that moves you into the next section.', hint: 'It does not need to be perfect. It just needs to be human.', completionType: 'volunteer' },
    ],
  },
  {
    title: 'vendors', slug: 'vendors', intro: 'Vendor stalls, radical literature, riddles, trades, hidden objects, and a classified detour.',
    stops: [
      { id: 'vendor-photo', title: 'vendor photo', clue: 'Choose a vendor or info table that inspires you and document it.', answerPrompt: 'Post a photo of the table or what they are offering with the event hashtag, then show the welcome center volunteer.', hint: 'The first clue starts with paying attention to what is already around you.', completionType: 'volunteer' },
      { id: 'may-days-zine', title: 'may days zine', clue: 'Locate the zine “May Days” by CrimethInc. at the info table or radical lit distro.', answerPrompt: 'In the Barcelona 1936 chapter, what labor union took over the city infrastructure and fought fascism?', hint: 'It is bolded in the text.', completionType: 'text-answer' },
      { id: 'mutual-aid-riddle', title: 'mutual aid riddle', clue: 'Solve the riddle about something that appears when systems fail and vanishes when justice prevails.', answerPrompt: 'Name the answer and go to the table that represents it.', hint: 'It is not a place, but it brings people together.', completionType: 'password' },
      { id: 'vendor-perspective', title: 'vendor perspective match', clue: 'Match the photo pinned to a board or table with the real location inside the vendor and info area.', answerPrompt: 'Find the exact spot and perspective where a hidden QR code becomes visible.', hint: 'Only the right angle reveals it.', completionType: 'onsite-only' },
      { id: 'blackflower-zine', title: 'blackflower zine', clue: 'Find the Blackflower Collective zine and look under the wing of a bird.', answerPrompt: 'Use the first letters in the bullet list to derive the next password.', hint: 'This is one of the more bookish little gremlin clues.', completionType: 'password' },
      { id: 'vendor-red-thread', title: 'vendor red thread', clue: 'Find the beginning of the red thread tied somewhere in the vendor zone and follow it through the space.', answerPrompt: 'Track it until you find the pouch at the end with the next code.', hint: 'Fence posts, flyer poles, and table legs are all fair game.', completionType: 'onsite-only' },
      { id: 'bread-and-roses', title: 'bread and roses', clue: 'Find the hidden red roses and loaves of bread scattered through the vendor zone.', answerPrompt: 'Bring them to the correct volunteer and say nothing.', hint: 'If it is the wrong volunteer, they will just hand them back.', completionType: 'volunteer' },
      { id: 'your-voice', title: 'your voice', clue: 'Solve the riddle: it belongs to you, others use it more, it starts conversations and sparks revolutions.', answerPrompt: 'What am I?', hint: 'The answer is your voice.', completionType: 'text-answer' },
      { id: 'trade-challenge', title: 'trade challenge', clue: 'Find the table with space and spines and trade for your next clue instead of buying it.', answerPrompt: 'Offer an object, drawing, snack, poem, token, or whatever else the table considers fair.', hint: 'They decide whether the trade is accepted.', completionType: 'volunteer' },
      { id: 'classified-folder', title: 'classified folder', clue: 'At the Sabot Media table, find the thing that does not quite belong among the flyers and ephemera.', answerPrompt: 'Open the classified path and follow the hidden instructions if it is for you.', hint: 'This is not really part of the normal hunt. It is the rabbit hole.', completionType: 'onsite-only' },
    ],
  },
  {
    title: 'indoors', slug: 'indoors', intro: 'Museum displays, labor history, perspective puzzles, hidden threads, riddles, and poetry.',
    stops: [
      { id: 'notice-space', title: 'notice the space', clue: 'Find something strange, beautiful, or overlooked inside the building and document it.', answerPrompt: 'Post the photo with the event hashtag and show a volunteer to continue.', hint: 'The building itself is part of the story.', completionType: 'volunteer' },
      { id: 'indoor-perspective', title: 'indoor perspective match', clue: 'Use the provided QR code image to match a precise angle somewhere in the building.', answerPrompt: 'Find the hidden QR code that is only visible from the correct spot.', hint: 'This is an in world perspective challenge, so the actual code stays physical.', completionType: 'onsite-only' },
      { id: 'free-speech-fights', title: 'aberdeen free speech fights', clue: 'Study the labor history displays about the Aberdeen Free Speech Fights.', answerPrompt: 'What religious organization was allowed to preach publicly on the same streets where IWW members were arrested and beaten?', hint: 'The clue is in the display text.', completionType: 'text-answer' },
      { id: 'iww-riddle', title: 'iww riddle', clue: 'Solve the riddle about the radical labor union that answered across all trades.', answerPrompt: 'Three letters. One fight. Who are they?', hint: 'Wobblies know this one immediately.', completionType: 'password' },
      { id: 'indoor-thread', title: 'indoor red thread', clue: 'Follow the thin red thread through shelves, vents, chair legs, and building edges.', answerPrompt: 'Track it to the tiny envelope or pouch where the next clue waits.', hint: 'It does not go far, but it does not go straight.', completionType: 'onsite-only' },
      { id: 'phone-flyer', title: 'phone flyer', clue: 'Find the bland flyer near the back hallway with the phone number scribbled on the bottom.', answerPrompt: 'Call or text it and follow the recorded challenge instructions.', hint: 'The voice asks what walks without legs, whispers without sound, and spreads without moving.', completionType: 'onsite-only' },
      { id: 'puppet-stop', title: 'puppet stop', clue: 'This stop depends on the puppet based challenge staged in the building.', answerPrompt: 'Complete the puppet challenge in the world to receive the next clue.', hint: 'This one is intentionally kept loose because the physical setup may change.', completionType: 'volunteer' },
      { id: 'laura-law', title: 'laura law', clue: 'Search the museum displays, timelines, and artifacts for the answer to the Laura Law question.', answerPrompt: 'What is the street number where Laura Law was murdered?', hint: 'The answer is in the history displays, not online.', completionType: 'text-answer' },
      { id: 'seattle-general-strike', title: 'seattle general strike', clue: 'Solve the riddle about the moment when a city stood still from unity, not fear.', answerPrompt: 'What am I?', hint: 'In twenty days it sparked, in five it shut it all down.', completionType: 'password' },
      { id: 'poem-mic', title: 'poem at the mic', clue: 'Write a poem about labor, resistance, identity, grief, hope, rage, home, or whatever burns in your chest.', answerPrompt: 'Read it aloud or hand it to a volunteer, then receive the clue that carries you back outside.', hint: 'It does not have to rhyme. It just has to be yours.', completionType: 'volunteer' },
    ],
  },
  {
    title: 'outdoors', slug: 'outdoors', intro: 'Open air reenactments, maypole puzzles, cassette clues, radio fragments, hidden pieces, and noise.',
    stops: [
      { id: 'recreate-resistance', title: 'recreate resistance', clue: 'In an open space, recreate an iconic image of resistance with your body, your crew, or what you can find nearby.', answerPrompt: 'Take a photo, post it with the event hashtag, and show the photo to the art center volunteer.', hint: 'Raised fists, chain breakers, protest signs, arm in arm. Start there.', completionType: 'volunteer' },
      { id: 'international-workers-day', title: 'international workers day', clue: 'Answer the trivia question about the historical name for the international workers holiday celebrated on May 1st.', answerPrompt: 'What is the historical name of the holiday?', hint: 'Bosses hate it. Workers remember it.', completionType: 'text-answer' },
      { id: 'maypole-riddle', title: 'maypole riddle', clue: 'Solve the riddle about the pole wrapped in bold ribbons and rooted in the ground.', answerPrompt: 'What am I?', hint: 'It rises once a year and dances without feet.', completionType: 'password' },
      { id: 'maypole-thread', title: 'maypole red thread', clue: 'At the base of the maypole, find the red thread tied to a ribbon or stake and follow it through the outdoor space.', answerPrompt: 'Find the hidden pouch or envelope waiting at the end.', hint: 'It may loop, double back, or slip under benches.', completionType: 'onsite-only' },
      { id: 'outdoor-perspective', title: 'outdoor perspective match', clue: 'Match the ordinary looking outdoor photo with the real place and exact camera angle.', answerPrompt: 'Stand in the correct location to reveal the hidden QR code.', hint: 'Fence corners, light poles, painted rocks, and busted trash cans all matter here.', completionType: 'onsite-only' },
      { id: 'cassette-player', title: 'cassette player', clue: 'Find the old school cassette player hidden outdoors and listen to the queued message.', answerPrompt: 'Follow the spoken riddle about looking through the glass and reading what cannot be read.', hint: 'It is where people sit but do not stay long, between food and shade.', completionType: 'onsite-only' },
      { id: 'look-through-the-glass', title: 'look through the glass', clue: 'Use the reversed clue from the cassette stop and decode the password.', answerPrompt: 'What is the password hidden in the backwards message?', hint: 'Our sword is fire.', completionType: 'password' },
      { id: 'station-mayday', title: 'station mayday', clue: 'Find the soft low power FM signal somewhere near the edges of the grounds and listen to the broadcast.', answerPrompt: 'Use the radio message to begin collecting the broken QR code pieces scattered outdoors.', hint: 'The message starts with “This is Station MAYDAY.”', completionType: 'onsite-only' },
      { id: 'broken-qr', title: 'broken qr code', clue: 'Find the scattered QR pieces hidden beneath, behind, hanging, or left in plain sight outdoors.', answerPrompt: 'Assemble the pieces until the code makes sense.', hint: 'The broadcast says the pieces do not wait forever.', completionType: 'onsite-only' },
      { id: 'jam-station', title: 'jam station', clue: 'Go to the jam station or open mic area and add one real sound to the moment.', answerPrompt: 'Bang a drum, shout a chant, sing a line, recite a poem, or otherwise join the noise to receive the next clue.', hint: 'It does not need to be good. It needs to be yours.', completionType: 'volunteer' },
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
