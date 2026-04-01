export const huntRoutes = [
  {
    title: 'activities',
    slug: 'activities',
    intro: 'Physical games, weird tasks, riddles, hidden codes, direct interaction with volunteers, and a few extra movement based challenges now folded into the current site.',
    stops: [
      { id: 'photo-booth', title: 'photo booth', clue: 'Find the place that offers a fleeting glimpse of fame, a frozen moment, and a captured name.', answerPrompt: 'Take a photo booth photo, post it with the event hashtag, and show a volunteer to continue.', hint: 'This one is a real world activity stop. The next code comes from a volunteer, not the site.', completionType: 'volunteer', validationMode: 'volunteer' },
      { id: 'bowling-capitalists', title: 'bowling down the capitalists', clue: 'Find the game setup where bankers, landlords, billionaires, cops, CEOs, and oil execs are lined up to fall.', answerPrompt: 'Knock down at least three capitalist pins and get the next clue from a volunteer.', hint: 'No gutterballs for the people.', completionType: 'volunteer', validationMode: 'volunteer' },
      { id: 'face-paint', title: 'face paint station', clue: 'Find the place where your face becomes part of the movement.', answerPrompt: 'Get your face painted, then check in with a volunteer for the next clue.', hint: 'Symbol, stripe, flower, skull, star, whatever feels right.', completionType: 'volunteer', validationMode: 'volunteer' },
      { id: 'paper-die', title: 'giant paper die', clue: 'Find the giant paper die with six sides, five numbers, and one QR code.', answerPrompt: 'Roll the die until the QR side lands face up. Scan it only when luck allows.', hint: 'This code is intentionally only visible in the world challenge flow.', completionType: 'onsite-only', validationMode: 'manual' },
      { id: 'obstacle-course', title: 'inflatable obstacle course', clue: 'Climb, crawl, bounce, and thrash your way through the inflatable obstacle course.', answerPrompt: 'Make it to the other side and get the next clue from the volunteer at the finish line.', hint: 'No speed required. Flailing dramatically is spiritually correct.', completionType: 'volunteer', validationMode: 'volunteer' },
      { id: 'haymarket', title: 'haymarket square', clue: 'Answer the labor history question about the 1886 labor uprising that became foundational to the workers movement and the origin of May Day.', answerPrompt: 'What is the name of the square where it all went down?', hint: 'Unlock the code at the booth where the tail is pinned.', completionType: 'password', validationMode: 'answer', proofAnswer: 'haymarket' },
      { id: 'solidarity-riddle', title: 'solidarity riddle', clue: 'Solve the riddle about something born in break rooms, forged in chants, and whispered between tired hands.', answerPrompt: 'What is the start of every strike?', hint: 'You cannot own it, yet it owns the fight.', completionType: 'password', validationMode: 'answer', proofAnswer: 'solidarity' },
      { id: 'perspective-hunt', title: 'perspective hunt', clue: 'Find the real world version of the mystery photo and stand where the camera stood.', answerPrompt: 'Scan the hidden QR code once you locate the matching perspective.', hint: 'This code only reveals itself from the right angle in the physical space.', completionType: 'onsite-only', validationMode: 'manual' },
      { id: 'red-thread', title: 'red thread', clue: 'Follow the wild red thread through cones, chairs, trash bins, tape lines, protest signs, and whatever else it wraps around.', answerPrompt: 'Find the hidden pouch or last knot where the next QR code waits.', hint: 'It may split or disappear, but the true line continues.', completionType: 'onsite-only', validationMode: 'manual' },
      { id: 'abc-letter', title: 'anarchist black cross letter', clue: 'Go to the Anarchist Black Cross table and write a letter to an incarcerated comrade.', answerPrompt: 'Turn in your letter and receive the clue that moves you into the next section.', hint: 'It does not need to be perfect. It just needs to be human.', completionType: 'volunteer', validationMode: 'volunteer' },
    ],
  },
  {
    title: 'art center',
    slug: 'art-center',
    intro: 'Creative tasks, visual riddles, hands on making, collaboration, and weird signal debris.',
    stops: [
      { id: 'craft-puzzle-sheet', title: 'craft puzzle sheet', clue: 'Seek the place where old skills live on among weavers, stitchers, painters, and makers.', answerPrompt: 'Flip over the puzzle sheet at this station, complete it, and find the password hidden in Across 8.', hint: 'Your next clue waits quietly among crafts and traditions.', completionType: 'password', validationMode: 'answer' },
      { id: 'recreate-rosie', title: 'recreate rosie', clue: 'Strike a pose. Resistance has a look.', answerPrompt: 'Recreate Rosie’s stance, post it to the event hashtag, and show the Art Center volunteer.', hint: 'This is a volunteer checked creative stop.', completionType: 'volunteer', validationMode: 'volunteer' },
      { id: 'wordsearch', title: 'wordsearch', clue: 'Complete the wordsearch provided at this station.', answerPrompt: 'The unused letters on the top line read left to right and spell your password.', hint: 'Every word you find is a piece of a movement.', completionType: 'password', validationMode: 'answer' },
      { id: 'bucket-of-broken-signals', title: 'bucket of broken signals', clue: 'Ask for the Bucket of Broken Signals and choose the one QR square that actually matters.', answerPrompt: 'Find the one marked with the familiar logo.', hint: 'Most are lies, errors, or junk.', completionType: 'onsite-only', validationMode: 'manual' },
      { id: 'collaboration-wall', title: 'collaboration wall', clue: 'Leave your mark on the Collaboration Wall.', answerPrompt: 'Paint, draw, write, or collage, then tell the Art Volunteer what you added.', hint: 'They will know if you are lying.', completionType: 'volunteer', validationMode: 'volunteer' },
      { id: 'banner-riddle', title: 'banner riddle', clue: 'Solve the riddle about something made not by one but by many hands, waving in the wind or screaming from a wall without a sound.', answerPrompt: 'What am I?', hint: 'Think of what waves in the wind at a march.', completionType: 'password', validationMode: 'answer', proofAnswer: 'banner' },
      { id: 'agricultural-workshop', title: 'agricultural workshop', clue: 'Art doesn’t stop at the page. Creation continues in the soil.', answerPrompt: 'Complete the Agricultural Workshop and you will receive your final clue in this pathway.', hint: 'Hands are busy growing more than just food.', completionType: 'volunteer', validationMode: 'volunteer' },
      { id: 'recreate-revolution', title: 'recreate the revolution', clue: 'Find an open indoor space and recreate an iconic image of resistance using your body, crew, or what you can find nearby.', answerPrompt: 'Take a photo and show the Art Center volunteer.', hint: 'This was an old outdoors stop, now folded into the current hunt shape.', completionType: 'volunteer', validationMode: 'volunteer' },
      { id: 'do-art-get-clue', title: 'do art get clue', clue: 'Art is a kind of magic. It doesn’t need to be pretty. Just honest.', answerPrompt: 'Do art. Get a clue.', hint: 'Leave a piece of yourself here and get the key to your next path.', completionType: 'volunteer', validationMode: 'volunteer' },
      { id: 'art-route-finish', title: 'art route finish', clue: 'Complete the art route and close out this pathway with the Art Volunteer.', answerPrompt: 'Check in for your final clue or handoff.', hint: 'This keeps the human layer intact where it belongs.', completionType: 'volunteer', validationMode: 'volunteer' },
    ],
  },
  {
    title: 'vendors',
    slug: 'vendors',
    intro: 'Vendor stalls, radical literature, riddles, trades, hidden objects, and a classified detour.',
    stops: [
      { id: 'vendor-photo', title: 'vendor photo', clue: 'Wander the vendor stalls and info tables and choose one that inspires you.', answerPrompt: 'Take a photo of their table or something they are offering, post it with the event hashtag, and show the Welcome Center volunteer.', hint: 'This is the route opener and it is already clearly volunteer checked in the source.', completionType: 'volunteer', validationMode: 'volunteer' },
      { id: 'vendor-perspective', title: 'vendor perspective match', clue: 'Match the photo pinned to a corkboard or table with the real place and angle in the vendor and info area.', answerPrompt: 'Find the hidden QR code that only appears from the right perspective.', hint: 'Only the right angle reveals it.', completionType: 'onsite-only', validationMode: 'manual' },
      { id: 'may-days-zine', title: 'may days zine', clue: 'Locate the zine “May Days” by CrimethInc. at the info table or radical lit distro.', answerPrompt: 'In the chapter about Barcelona, 1936, what was the name of the anarchist labor union that took over the city’s infrastructure and fought fascism?', hint: 'It is in bold. You will not miss it.', completionType: 'text-answer', validationMode: 'answer', proofAnswer: 'CNT' },
      { id: 'mutual-aid-riddle', title: 'mutual aid riddle', clue: 'Solve the riddle about something that appears when systems fail and vanishes when justice prevails.', answerPrompt: 'What am I?', hint: 'It is not a place, but it brings people together.', completionType: 'password', validationMode: 'answer', proofAnswer: 'mutual aid' },
      { id: 'classified-folder', title: 'classified folder', clue: 'At the Sabot Media table, find the thing that doesn’t quite belong among the flyers and ephemera.', answerPrompt: 'Follow the classified instructions if it is for you.', hint: 'This is the ARG branch, not really part of the main hunt.', completionType: 'onsite-only', validationMode: 'manual' },
      { id: 'trade-challenge', title: 'trade challenge', clue: 'Find the table with space and spines and trade for your next clue instead of buying it.', answerPrompt: 'Offer an object, drawing, poem, snack, button, or token. They decide if it is fair.', hint: 'They will not give it to you for nothing.', completionType: 'volunteer', validationMode: 'volunteer' },
      { id: 'vendor-red-thread', title: 'vendor red thread', clue: 'Find the beginning of the red thread in the vendor zone and follow it through the space.', answerPrompt: 'Track it until you find the pouch at the end with the next code.', hint: 'Fence posts, flyer poles, and table legs are all fair game.', completionType: 'onsite-only', validationMode: 'manual' },
      { id: 'bread-and-roses', title: 'bread and roses', clue: 'Find the hidden red roses and loaves of bread scattered through the vendor zone.', answerPrompt: 'Bring them to the correct volunteer and say nothing.', hint: 'If it is the wrong volunteer, they will just hand them back.', completionType: 'volunteer', validationMode: 'volunteer' },
      { id: 'your-voice', title: 'your voice', clue: 'Solve the riddle: I belong to you, but others use me more. I start conversations, spark revolutions, and cannot be taken back.', answerPrompt: 'What am I?', hint: 'This answer is explicitly stated in the source material.', completionType: 'text-answer', validationMode: 'answer', proofAnswer: 'your voice' },
      { id: 'blackflower-zine', title: 'blackflower zine', clue: 'Find the Blackflower Collective zine and look under the wing of a bird.', answerPrompt: 'The first letter in each bullet line spells your next password.', hint: 'A quiet acrostic hidden in print.', completionType: 'password', validationMode: 'answer' },
    ],
  },
  {
    title: 'history',
    slug: 'history',
    intro: 'Museum displays, labor history, perspective puzzles, hidden threads, poetry, and building based discovery.',
    stops: [
      { id: 'free-speech-fights', title: 'free speech fights', clue: 'Study the labor history displays inside, especially the Aberdeen Free Speech Fights.', answerPrompt: 'What religious organization was allowed to preach publicly on the same streets where IWW members were arrested and beaten?', hint: 'The answer is directly in the display content.', completionType: 'text-answer', validationMode: 'answer', proofAnswer: 'salvation army' },
      { id: 'iww-riddle', title: 'iww riddle', clue: 'Solve the riddle about the radical labor union that believed in solidarity across all trades.', answerPrompt: 'Three letters. One fight. Who are they?', hint: 'Known to bosses with fear and to workers with pride.', completionType: 'password', validationMode: 'answer', proofAnswer: 'IWW' },
      { id: 'notice-space', title: 'notice the space', clue: 'Take a moment to notice where you are. Find something strange, beautiful, or overlooked and document it.', answerPrompt: 'Snap a photo, post it with the event hashtag, and show a volunteer for your next clue.', hint: 'This space is part of the story too.', completionType: 'volunteer', validationMode: 'volunteer' },
      { id: 'history-perspective', title: 'history perspective match', clue: 'Study the provided image and match the exact location and angle somewhere within the event grounds or building.', answerPrompt: 'Find the hidden QR code that appears only from the right perspective.', hint: 'You only see it if you are standing just right.', completionType: 'onsite-only', validationMode: 'manual' },
      { id: 'puppet-stop', title: 'puppet stop', clue: 'Complete the puppet based challenge.', answerPrompt: 'Finish the puppet based one in the world to receive the next clue.', hint: 'This one is clearly physical and not a typed answer stop.', completionType: 'volunteer', validationMode: 'volunteer' },
      { id: 'poem-mic', title: 'poem at the mic', clue: 'Write a poem about labor, resistance, identity, grief, hope, rage, home, or whatever burns in your chest.', answerPrompt: 'Read it aloud or hand it to a volunteer. Then you receive a QR showing a perspective hunt image.', hint: 'It doesn’t have to rhyme. It just has to be yours.', completionType: 'volunteer', validationMode: 'volunteer' },
      { id: 'history-red-thread', title: 'history red thread', clue: 'Somewhere in the building, a thin red thread is woven through shelves, vents, chair legs, or cracks in the wall.', answerPrompt: 'Follow it patiently to the tiny envelope or pouch holding the next QR code.', hint: 'It doesn’t go far, but it doesn’t go straight.', completionType: 'onsite-only', validationMode: 'manual' },
      { id: 'laura-law', title: 'laura law', clue: 'Back in the museum displays, among the timelines, artifacts, and forgotten names, find the answer to the Laura Law question.', answerPrompt: 'What is the street number where Laura Law was murdered?', hint: 'The answer is explicit in the display set.', completionType: 'text-answer', validationMode: 'answer', proofAnswer: '1117' },
      { id: 'seattle-general-strike', title: 'seattle general strike', clue: 'Solve the riddle about the moment when a city stood still, not from fear, but from unity.', answerPrompt: 'What am I?', hint: 'In twenty days it sparked. In five it shut it all down.', completionType: 'password', validationMode: 'answer', proofAnswer: 'seattle general strike' },
      { id: 'jam-station', title: 'jam station', clue: 'Go to the Jam Station or Open Mic Area and add one real sound to the moment.', answerPrompt: 'Bang a drum, sing a line, shout a chant, recite a poem, or add one weird sound. The volunteer hands you the next clue.', hint: 'It doesn’t need to be good. It just needs to be yours.', completionType: 'volunteer', validationMode: 'volunteer' },
    ],
  },
  {
    title: 'indoors',
    slug: 'indoors',
    intro: 'The renamed former outdoors route, now framed for the current site with movement, radio clues, maypole logic, hidden pieces, and embodied challenge flow.',
    stops: [
      { id: 'international-workers-day', title: 'international workers day', clue: 'Answer the trivia question about the historical name for the international workers holiday celebrated on May 1st.', answerPrompt: 'What is the historical name of the holiday?', hint: 'Bosses hate it. Workers remember it.', completionType: 'text-answer', validationMode: 'answer', proofAnswer: 'may day' },
      { id: 'maypole-riddle', title: 'maypole riddle', clue: 'Solve the riddle about the symbol woven with tradition, resistance, and springtime defiance.', answerPrompt: 'What am I?', hint: 'A pole, a protest, a worker’s day.', completionType: 'password', validationMode: 'answer', proofAnswer: 'may pole' },
      { id: 'maypole-thread', title: 'maypole red thread', clue: 'Find the red thread tied near the base of the maypole route marker and follow it.', answerPrompt: 'Trace it until you reach the hidden pouch or envelope containing the next QR.', hint: 'It may loop, double back, or wind beneath benches.', completionType: 'onsite-only', validationMode: 'manual' },
      { id: 'outdoor-perspective', title: 'perspective hunt', clue: 'Use the provided photo to match a very specific location and angle in the real world path.', answerPrompt: 'Stand in the exact position to reveal the hidden QR code.', hint: 'You only see it if you are standing in the right place.', completionType: 'onsite-only', validationMode: 'manual' },
      { id: 'cassette-player', title: 'cassette player', clue: 'Find the old school cassette player and listen to the queued message.', answerPrompt: 'Follow the spoken clue about glass, reversal, and what cannot be read.', hint: 'It is where people go to sit but don’t stay long.', completionType: 'onsite-only', validationMode: 'manual' },
      { id: 'look-through-the-glass', title: 'look through the glass', clue: 'Use the reversed clue from the cassette stop and decode the password.', answerPrompt: 'What is the password hidden in the backwards message?', hint: 'Our sword is fire.', completionType: 'password', validationMode: 'answer', proofAnswer: 'fire' },
      { id: 'station-mayday', title: 'station mayday', clue: 'Find the soft low power FM signal and listen to the broadcast.', answerPrompt: 'Use the radio message to begin collecting the broken QR code pieces.', hint: 'The message starts with “This is Station MAYDAY.”', completionType: 'onsite-only', validationMode: 'manual' },
      { id: 'broken-qr', title: 'broken qr code', clue: 'Find the scattered QR pieces hidden in multiple locations and assemble them.', answerPrompt: 'Piece them together and scan what you’ve made.', hint: 'The pieces do not wait forever.', completionType: 'onsite-only', validationMode: 'manual' },
      { id: 'recreate-resistance', title: 'recreate resistance', clue: 'Recreate an iconic image of resistance using your body, your crew, or what you find nearby.', answerPrompt: 'Take a photo and show it to the Art Center volunteer.', hint: 'This route was renamed, not rewritten. The embodied challenge remains.', completionType: 'volunteer', validationMode: 'volunteer' },
      { id: 'jam-or-noise', title: 'noise finish', clue: 'For the final challenge, show up, be loud, and be real.', answerPrompt: 'Join the noise and get the final handoff or route finish check.', hint: 'A drum, chant, line, or off-key strum still counts.', completionType: 'volunteer', validationMode: 'volunteer' },
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
