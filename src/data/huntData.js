export const huntRoutes = [
  {
    title: 'activities',
    slug: 'activities',
    intro: 'Physical challenges, answer checks, hidden QR discoveries, and volunteer checkpoints.',
    stops: [
      { id: 'photo-booth', title: 'photo booth', clue: `I offer a fleeting glimpse of fame,
A frozen moment, a captured name.
Striking a pose, you step inside,
Your image preserved, nowhere to hide.
What am I?`, answerPrompt: `Post your photo booth photo to #MayDayOnTheHarbor and show a volunteer for your next clue.`, hint: 'This one advances through a volunteer checkpoint, not a typed answer.', completionType: 'volunteer', validationMode: 'volunteer', volunteerCode: 'ACT-01', revealNextInUI: false },
      { id: 'bowling-capitalists', title: 'bowling down the capitalists', clue: `You’ve entered the Zone of Active Resistance.
Find the Bowling Down the Capitalists game setup and knock down at least three of the capitalist pins.`, answerPrompt: `Once you've bowled and knocked down at least three pins, a volunteer will hand you your next QR code or clue.`, hint: 'This one needs the volunteer to enter the completion code.', completionType: 'volunteer', validationMode: 'volunteer', volunteerCode: 'ACT-02', revealNextInUI: false },
      { id: 'face-paint', title: 'face paint station', clue: `Every movement has a look. Some wear masks, some wear war paint, some wear joy.
Find the Face Paint Station and let your face become part of the movement.`, answerPrompt: `Once your face is painted, a volunteer will hand you the next clue or QR code.`, hint: 'Volunteer checkpoint.', completionType: 'volunteer', validationMode: 'volunteer', volunteerCode: 'ACT-03', revealNextInUI: false },
      { id: 'paper-die', title: 'giant paper die', clue: `Find the giant paper die at the Activities Station — six sides, five numbers, and one QR code.
Your task? Roll the die until you land QR-side up.`, answerPrompt: `The QR code is the next clue — but you can’t scan it until it’s rolled face-up.`, hint: 'No next button here. The real world QR is the progression gate.', completionType: 'onsite-only', validationMode: 'onsite_qr_only', scanCode: 'ACT-04', revealNextInUI: false },
      { id: 'obstacle-course', title: 'inflatable obstacle course', clue: `It’s time to move. Climb, crawl, bounce, and thrash your way through the Inflatable Obstacle Course — a glorious, ridiculous mess of resistance.
Your goal: Make it to the other side.
• No need for speed.
• Just commit.
• Bonus points for flailing dramatically or yelling “MAYDAY” as you tumble.`, answerPrompt: `Clue Delivery:
Once you’ve completed the course, a volunteer at the finish line will hand you your next QR code or clue.`, hint: 'Volunteer checkpoint only.', completionType: 'volunteer', validationMode: 'volunteer', volunteerCode: 'ACT-05', revealNextInUI: false },
      { id: 'haymarket', title: 'haymarket square', clue: `Take a breath. Wipe off the sweat. Time to remember why we’re all here.
Which 1886 labor uprising — sparked by a bombing during a peaceful rally for the 8-hour workday — became a foundational moment for the international workers’ movement and the origin of May Day?
Answer is the name of the square where it all went down.`, answerPrompt: `Unlock the code at the booth where the tail is pinned.`, hint: 'Type the answer exactly.', completionType: 'password', validationMode: 'answer', proofAnswer: 'haymarket', revealNextInUI: true },
      { id: 'solidarity-riddle', title: 'solidarity riddle', clue: `Solve the riddle. The answer is your password to unlock the next QR code or clue.
Riddle:
I’m born in break rooms,
Forged in chants,
I grow when whispered between tired hands.
You cannot own me,
Yet I own the fight.
I am the start of every strike.
What am I?`, answerPrompt: `Enter the password to unlock the next clue.`, hint: 'Read it closely.', completionType: 'password', validationMode: 'answer', proofAnswer: 'solidarity', revealNextInUI: true },
      { id: 'perspective-hunt', title: 'perspective hunt', clue: `Somewhere in this space is a photo — tacked to a wall, taped to a cone, or stuck to a sign.
The image shows a very specific location taken from one exact angle. You’ll need to find that place and stand where the camera stood.
Only then will the next QR code reveal itself.
It might be under a bench.
It might be behind a caution sign.
It might be on the back of a megaphone.
But it’s only visible when you’re looking the right way.`, answerPrompt: `Clue Delivery:
Scan the hidden QR code once you locate the real-world version of the image.`, hint: 'This stop progresses only from the physical QR.', completionType: 'onsite-only', validationMode: 'onsite_qr_only', scanCode: 'ACT-08', revealNextInUI: false },
      { id: 'red-thread', title: 'red thread', clue: `The red thread has returned — but this time, it’s wilder. Less careful. Maybe even angry.
You’ll find it tied somewhere near where the last clue ended.
From there, it winds…
Through cones
Over chairs
Around trash bins
Beneath tape lines
Through a stack of protest signs
Under a makeshift stage`, answerPrompt: `Follow the thread. It might split. It might disappear behind something. But the true line always continues.
At the end of the thread is your next QR code — hidden in a pouch, tucked under a flap, or tied into the last knot.`, hint: 'Physical QR only.', completionType: 'onsite-only', validationMode: 'onsite_qr_only', scanCode: 'ACT-09', revealNextInUI: false },
      { id: 'abc-letter', title: 'anarchist black cross letter', clue: `Go to the Anarchist Black Cross table.
Write a letter to an incarcerated comrade.
It doesn’t need to be perfect. It just needs to be you.`, answerPrompt: `Once you’ve written and turned in your letter, a volunteer will quietly hand you the QR code for the next section and ten tickets.`, hint: 'Volunteer checkpoint only.', completionType: 'volunteer', validationMode: 'volunteer', volunteerCode: 'ACT-10', revealNextInUI: false },
    ],
  },
  {
    title: 'art center', slug: 'art-center', intro: 'Creative challenges, visual puzzles, making based clue flow, and volunteer handoffs.', stops: [
      { id: 'craft-puzzle-sheet', title: 'craft puzzle sheet', clue: `Seek the place where old skills live on — where crafts and traditions gather, and hands move with the memory of generations.
Among the weavers, stitchers, painters, and makers, your next clue waits quietly.`, answerPrompt: `Flip over the puzzle sheet at this station. Complete it, and you’ll find your password hidden in Across 8.`, hint: 'Type the solved password when you have it.', completionType: 'password', validationMode: 'answer', revealNextInUI: true },
      { id: 'recreate-rosie', title: 'recreate rosie', clue: `Strike a pose. Resistance has a look.
Recreate Rosie’s stance, snap a photo, and post to #MayDayOnTheHarbor.`, answerPrompt: `Show your post to the Art Center volunteer for your next clue.`, hint: 'Volunteer checkpoint.', completionType: 'volunteer', validationMode: 'volunteer', volunteerCode: 'ART-02', revealNextInUI: false },
      { id: 'wordsearch', title: 'wordsearch password', clue: `Among the threads of words and the echoes of labor, your next password lies hidden.
Complete the wordsearch provided at this station.
The unused letters on the top line, when read left to right, will spell out your password.`, answerPrompt: `Enter the password to unlock the next clue.`, hint: 'Read the unused letters on the top line.', completionType: 'password', validationMode: 'answer', revealNextInUI: true },
      { id: 'bucket-of-broken-signals', title: 'bucket of broken signals', clue: `You saw clearly. You stood in the right place. You found the hidden view. Now, the real mess begins.
Go to the Art Center table and ask for “The Bucket of Broken Signals.”
Inside, you’ll find dozens of QR code squares. Most of them lead nowhere. Lies. Errors. Junk.
But one — just one — is marked with a familiar logo.`, answerPrompt: `Choose wisely. Or chaotically.`, hint: 'Physical QR only.', completionType: 'onsite-only', validationMode: 'onsite_qr_only', scanCode: 'ART-04', revealNextInUI: false },
      { id: 'collaboration-wall', title: 'collaboration wall', clue: `You’ve survived the chaos of the Bucket. Good.
Now you’re ready to leave something behind.
Go to the Collaboration Wall — a massive canvas open to all hands.
Paint. Draw. Write. Collage. Leave your mark.`, answerPrompt: `When you're done, find the Art Volunteer nearby. Tell them what you added. They’ll know if you're lying.`, hint: 'Volunteer checkpoint.', completionType: 'volunteer', validationMode: 'volunteer', volunteerCode: 'ART-05', revealNextInUI: false },
      { id: 'banner-riddle', title: 'banner riddle', clue: `I am made not by one, but by many hands,
In picket lines, in paint, in factory stands.
I carry slogans, stories, and fight,
Bold on walls or held up in strike.
I am both protest and a plea,
In colors loud, demanding to be free.
What am I?`, answerPrompt: `Hint: Think of what waves in the wind at a march… or screams from a wall without making a sound.
Go to the Art Center table. Scan the QR code and enter the password to unlock your next clue.`, hint: 'Type the password exactly.', completionType: 'password', validationMode: 'answer', proofAnswer: 'banner', revealNextInUI: true },
      { id: 'agricultural-workshop', title: 'agricultural workshop', clue: `Art doesn’t stop at the page. Creation continues in the soil.
Head to the Agricultural Workshop — where hands are busy growing more than just food.`, answerPrompt: `Complete the workshop and you will receive your final clue in this pathway.`, hint: 'Volunteer checkpoint.', completionType: 'volunteer', validationMode: 'volunteer', volunteerCode: 'ART-07', revealNextInUI: false },
      { id: 'do-art-get-clue', title: 'do art get clue', clue: `Art is a kind of magic, you know.
It doesn’t need to be pretty — just honest.
Leave a piece of yourself here, and I’ll give you the key to your next path.`, answerPrompt: `Do art. Get a clue.`, hint: 'Volunteer checkpoint.', completionType: 'volunteer', validationMode: 'volunteer', volunteerCode: 'ART-08', revealNextInUI: false },
      { id: 'photo-booth-redux', title: 'photo booth redux', clue: `I offer a fleeting glimpse of fame,
A frozen moment, a captured name.
Striking a pose, you step inside,
Your image preserved, nowhere to hide.
What am I?`, answerPrompt: `Post your photo booth photo to #MayDayOnTheHarbor and show our volunteer for your next code.`, hint: 'Volunteer checkpoint.', completionType: 'volunteer', validationMode: 'volunteer', volunteerCode: 'ART-09', revealNextInUI: false },
      { id: 'zine-making', title: 'zine making', clue: `“You’ve planted seeds in the earth — now plant one in paper.
Your last task begins at the Zine Table.”`, answerPrompt: `At the Zine Table, you’ll find blank templates and instructions to fold a 16-page mini-zine from a single sheet of paper.
Once folded, design at least 8 pages with your content — drawings, poems, slogans, rants, collage — whatever speaks from your bones.
When your zine is finished, the front and back cover will align to reveal a full scannable QR code. That’s your final clue.`, hint: 'This one ends in a physical assembled QR. No next button here.', completionType: 'onsite-only', validationMode: 'onsite_qr_only', scanCode: 'ART-10', revealNextInUI: false },
    ],
  },
  {
    title: 'vendors', slug: 'vendors', intro: 'Social posts, zines, mutual aid clues, trades, hidden objects, and a classified detour.', stops: [
      { id: 'vendor-photo', title: 'vendor photo', clue: `Choose a vendor or info table that inspires you and document it.`, answerPrompt: `Post a photo of the table or what they’re offering with the hashtag #MayDayOnTheHarbor, then show your post to the Welcome Center volunteer.`, hint: 'Volunteer checkpoint.', completionType: 'volunteer', validationMode: 'volunteer', volunteerCode: 'VEN-01', revealNextInUI: false },
      { id: 'may-days-zine', title: 'may days zine', clue: `Locate the zine “May Days” by CrimethInc. at the info table or radical lit distro.
In the chapter about Barcelona, 1936, what was the name of the anarchist labor union that took over the city’s infrastructure and fought fascism?`, answerPrompt: `Hint: It’s in bold. You won’t miss it.`, hint: 'Type the answer exactly.', completionType: 'password', validationMode: 'answer', proofAnswer: 'CNT', revealNextInUI: true },
      { id: 'mutual-aid-riddle', title: 'mutual aid riddle', clue: `Solve the riddle below. The answer is your password to unlock the next QR clue.
It’s something you’ll hear whispered at meetings, printed in zines, scribbled in margins, and shouted through bullhorns.
Riddle:
I am not a place, but I bring people together.
I do not sell, but I give what is needed.
I appear when systems fail,
and vanish when justice prevails.
What am I?`, answerPrompt: `Go to the table who represents the answer. Scan the QR code and enter the password to unlock your next clue.`, hint: 'Type the password exactly.', completionType: 'password', validationMode: 'answer', proofAnswer: 'mutual aid', revealNextInUI: true },
      { id: 'vendor-perspective', title: 'vendor perspective match', clue: `Pinned to the corkboard or taped to the table, you’ll find a photo.
It was taken somewhere within the Vendor & Info area — a real place, a real angle, just waiting to be found again.`, answerPrompt: `Your task: match the photo exactly. Find the location, stand in the same spot, and see the world as the camera once did.
There, and only there, you’ll spot a hidden QR code.`, hint: 'Physical QR only.', completionType: 'onsite-only', validationMode: 'onsite_qr_only', scanCode: 'VEN-04', revealNextInUI: false },
      { id: 'blackflower-zine', title: 'blackflower zine', clue: `Find the Blackflower Collective Zine.
That table will have your next QR code.
Within the zine, under the wing of a bird, you will find a series of bullets.
The first letter in each line spells your next password.`, answerPrompt: `Enter the solved password when you have it.`, hint: 'Acrostic style password.', completionType: 'password', validationMode: 'answer', revealNextInUI: true },
      { id: 'vendor-red-thread', title: 'vendor red thread', clue: `Some things unravel when pulled — others lead you to something hidden.
In the Vendor Zone, find the beginning of the red thread.
It might be tied to a table leg, wrapped through a fence, or dangling from a flyer pole.
Follow it carefully — it winds through strange spaces and odd corners.`, answerPrompt: `At the end, you’ll find a small hidden pouch. Inside is a QR code. That’s your next clue.`, hint: 'Physical QR only.', completionType: 'onsite-only', validationMode: 'onsite_qr_only', scanCode: 'VEN-06', revealNextInUI: false },
      { id: 'bread-and-roses', title: 'bread and roses', clue: `Scattered throughout the Vendor Zone are hidden red roses and loaves of bread — in flowerpots, taped under tables, tucked into signs.
Your job is to find them.
But don’t just keep them — they’re not for you.
Find the right volunteer and hand them the bread and rose.
Say nothing.`, answerPrompt: `If it’s the right volunteer, they’ll give you your next clue. If not… they’ll just hand it back.`, hint: 'Volunteer checkpoint only.', completionType: 'volunteer', validationMode: 'volunteer', volunteerCode: 'VEN-07', revealNextInUI: false },
      { id: 'your-voice', title: 'your voice', clue: `I belong to you, but others use me more.
I start conversations, spark revolutions, and cannot be taken back.
What am I?`, answerPrompt: `Answer correctly, and they’ll finally hand over your next clue.`, hint: 'Type the password exactly.', completionType: 'password', validationMode: 'answer', proofAnswer: 'your voice', revealNextInUI: true },
      { id: 'trade-challenge', title: 'trade challenge', clue: `To get your next clue, you’ll need to trade — not buy, not beg.
Find the table with space and spines.
Offer them something. It can be anything — a small object, a handmade token, a drawing, a snack, a poem, a button from your vest.`, answerPrompt: `They get to decide if it’s fair. If they accept your trade, you’ll receive your next clue.`, hint: 'Volunteer checkpoint only.', completionType: 'volunteer', validationMode: 'volunteer', volunteerCode: 'VEN-09', revealNextInUI: false },
      { id: 'classified-folder', title: 'classified folder', clue: `At the Sabot Media table, somewhere among the flyers, booklets, and anarchist ephemera, you’ll find something that doesn’t quite belong.
It might be:
• A small folded note
• A QR code stuck under the table
• A half-page zine marked “CLASSIFIED”
• A sticker with a strange symbol
• A cassette labeled ??`, answerPrompt: `There’s no signage. No instructions. No one will help you.
If you find it, you’ve taken the first step.
If you’re ready, take the rabbit hole.`, hint: 'This is a direct physical discovery stop. No next button here.', completionType: 'onsite-only', validationMode: 'onsite_qr_only', scanCode: 'VEN-10', revealNextInUI: false },
    ],
  },
  {
    title: 'history', slug: 'history', intro: 'Labor history displays, museum questions, IWW lore, poetry, and building based discovery.', stops: [
      { id: 'notice-space', title: 'notice the space', clue: `Take a moment to notice where you are.
This space is part of the story too.
Look around for something strange, beautiful, or overlooked — then snap a photo of it and post it with the hashtag #MayDayOnTheHarbor.`, answerPrompt: `Show a volunteer for your next clue.`, hint: 'Volunteer checkpoint.', completionType: 'volunteer', validationMode: 'volunteer', volunteerCode: 'HIS-01', revealNextInUI: false },
      { id: 'history-perspective', title: 'history perspective match', clue: `Some places hide in plain sight — waiting to be seen just right.
Below, you'll find a photograph. It's taken from a very specific location, facing a very specific angle.`, answerPrompt: `Find that exact spot somewhere within the event grounds and scan the hidden QR code once you find it.`, hint: 'Physical QR only.', completionType: 'onsite-only', validationMode: 'onsite_qr_only', scanCode: 'HIS-02', revealNextInUI: false },
      { id: 'free-speech-fights', title: 'aberdeen free speech fights', clue: `Study the labor history displays inside — especially the ones about the Aberdeen Free Speech Fights.
During the Aberdeen Free Speech Fights, members of the IWW were arrested and beaten for speaking publicly.
But what religious organization was allowed to preach on the same streets without harassment?`, answerPrompt: `Enter the answer to continue.`, hint: 'Type it exactly.', completionType: 'password', validationMode: 'answer', proofAnswer: 'salvation army', revealNextInUI: true },
      { id: 'iww-riddle', title: 'iww riddle', clue: `Solve this riddle. The answer is a name known to bosses with fear and to workers with pride — a radical labor union that believed in solidarity across all trades.
Riddle:
We sang on picket lines, marched through jails,
Preached no gods, no masters, no holy grails.
Not just one trade — we took them all,
From timber to textile, we answered the call.
Our red song still echoes, defiant and true —
Three letters. One fight. Who are we?`, answerPrompt: `Enter the password to continue.`, hint: 'Three letters.', completionType: 'password', validationMode: 'answer', proofAnswer: 'IWW', revealNextInUI: true },
      { id: 'indoor-thread', title: 'indoor red thread', clue: `Somewhere in the building, a thin red thread is woven through shelves, vents, chair legs, or cracks in the wall.
It’s barely visible — just a hint of color against the mundane.`, answerPrompt: `Follow it. At the end, you’ll find a tiny envelope or pouch — your next QR code is hidden inside.`, hint: 'Physical QR only.', completionType: 'onsite-only', validationMode: 'onsite_qr_only', scanCode: 'HIS-05', revealNextInUI: false },
      { id: 'phone-flyer', title: 'phone flyer', clue: `Find the flyer taped to the wall near the back hallway. It looks like nothing — a boring office memo.
But if you read closely, you’ll see a phone number scribbled at the bottom.
Call it. You won’t talk to a person — just a recorded voice.`, answerPrompt: `“You’ve reached a voice that isn’t supposed to exist.
Here’s your challenge:
What walks without legs, whispers without sound, and spreads without moving?”
Enter the password at the QR code on the flyer for your next clue.`, hint: 'Type the password exactly.', completionType: 'password', validationMode: 'answer', proofAnswer: 'fire', revealNextInUI: true },
      { id: 'puppet-stop', title: 'puppet stop', clue: `Puppet based one.`, answerPrompt: `Complete the puppet based challenge in the world to receive the next clue.`, hint: 'Volunteer checkpoint.', completionType: 'volunteer', validationMode: 'volunteer', volunteerCode: 'HIS-07', revealNextInUI: false },
      { id: 'laura-law', title: 'laura law', clue: `Back in the Museum displays, among the timelines, artifacts, and forgotten names, is a clue to this question.
What is the street number where Laura Law was murdered?`, answerPrompt: `Enter the street number.`, hint: 'The answer is in the displays.', completionType: 'password', validationMode: 'answer', proofAnswer: '1117', revealNextInUI: true },
      { id: 'seattle-general-strike', title: 'seattle general strike', clue: `Solve this riddle. The answer is the name of a moment — when a city stood still, not from fear, but from unity.
Riddle:
In twenty days I sparked,
In five I shut it all down.
No wheel turned, no train ran,
But we were not afraid.
Milk was delivered, babies were born,
But not a boss gave the order.
What am I?`, answerPrompt: `Enter the answer to continue.`, hint: 'Type the full answer.', completionType: 'password', validationMode: 'answer', proofAnswer: 'seattle general strike', revealNextInUI: true },
      { id: 'poem-mic', title: 'poem at the mic', clue: `Write a poem. It doesn’t have to rhyme. It doesn’t have to be long. It just has to be yours.`, answerPrompt: `When you’ve written it, step up to the mic (or the whisper corner, or the poetry booth). Read it aloud. Or, if you can’t perform, hand it to a volunteer.
They’ll hand you a QR code.`, hint: 'Volunteer checkpoint only.', completionType: 'volunteer', validationMode: 'volunteer', volunteerCode: 'HIS-10', revealNextInUI: false },
    ],
  },
  {
    title: 'indoors', slug: 'indoors', intro: 'Movement based clues, maypole logic, hidden perspectives, and physical clue flow.', stops: [
      { id: 'recreate-resistance', title: 'recreate resistance', clue: `The fight doesn’t only live in galleries and archives — it lives in the streets, in parks, on sidewalks, in alleyways.
Your challenge: Find an open space and recreate an iconic image of resistance using your body, your crew, or what you can find nearby.`, answerPrompt: `Take a photo and post it with #MayDayOnTheHarbor. Then show the post or photo to the Art Center volunteer.`, hint: 'Volunteer checkpoint.', completionType: 'volunteer', validationMode: 'volunteer', volunteerCode: 'IND-01', revealNextInUI: false },
      { id: 'international-workers-day', title: 'international workers day', clue: `This whole event is built around a day with radical roots — a day that bosses hate and workers remember.
What is the historical name for the international workers’ holiday celebrated on May 1st?`, answerPrompt: `Enter the answer to continue.`, hint: 'Type it exactly.', completionType: 'password', validationMode: 'answer', proofAnswer: 'may day', revealNextInUI: true },
      { id: 'maypole-riddle', title: 'maypole riddle', clue: `Solve this riddle. The answer will lead you to your next location — a symbol woven with tradition, resistance, and springtime defiance.
Riddle:
I rise once a year, wrapped in colors so bold,
A worker’s celebration, centuries old.
I dance without feet, spin without sound,
But my ribbons are rooted deep in the ground.
Around me they circle, through history they play —
A pole, a protest, a worker’s day.
What am I?`, answerPrompt: `Find the clue in the world and progress from the physical QR at that location.`, hint: 'This riddle sends you to the real world. No next button here.', completionType: 'onsite-only', validationMode: 'onsite_qr_only', scanCode: 'IND-03', revealNextInUI: false },
      { id: 'maypole-thread', title: 'maypole red thread', clue: `You’ve found the May Pole — bright, tangled, defiant.
Look closely near the base. You’ll see a red thread tied to a ribbon or a stake. It winds away.
Follow the thread.`, answerPrompt: `At the end of the thread is a hidden pouch or sealed envelope containing your next QR code.`, hint: 'Physical QR only.', completionType: 'onsite-only', validationMode: 'onsite_qr_only', scanCode: 'IND-04', revealNextInUI: false },
      { id: 'outdoor-perspective', title: 'outdoor perspective match', clue: `A photo was taken somewhere on the grounds. A specific angle. A specific place. It might look ordinary — a fence corner, a light pole, a busted trash can, a painted rock.
But it matters.`, answerPrompt: `Match the exact location and angle in real life. Only from that perspective will you see the hidden QR code.`, hint: 'Physical QR only.', completionType: 'onsite-only', validationMode: 'onsite_qr_only', scanCode: 'IND-05', revealNextInUI: false },
      { id: 'cassette-player', title: 'cassette player', clue: `The next clue isn’t written. It’s spoken. Muffled. Warped. Waiting.
Somewhere in the route is an old-school cassette player with a tape already queued up.
You just have to find it. And play it.`, answerPrompt: `Once you find the player, press play. Follow the message and clue it gives you in the physical space.`, hint: 'Physical discovery stop.', completionType: 'onsite-only', validationMode: 'onsite_qr_only', scanCode: 'IND-06', revealNextInUI: false },
      { id: 'look-through-the-glass', title: 'look through the glass', clue: `“ssalg eht hguorht kool — ‘erif si drows ruo’”
(Reversed: “look through the glass — ‘our sword is fire’ and so is your password”)`, answerPrompt: `Use the clue and enter the password to continue.`, hint: 'Type the password exactly.', completionType: 'password', validationMode: 'answer', proofAnswer: 'fire', revealNextInUI: true },
      { id: 'station-mayday', title: 'station mayday', clue: `There’s a signal broadcasting right now — soft, low-power, and barely legal.
Find the frequency and listen.`, answerPrompt: `Walk the edges of the grounds. You’ll know you’ve found it when you hear: “This is Station MAYDAY — the signal for those who still listen.”`, hint: 'Physical discovery stop.', completionType: 'onsite-only', validationMode: 'onsite_qr_only', scanCode: 'IND-08', revealNextInUI: false },
      { id: 'hidden-clue', title: 'hidden clue', clue: `Find the next clue in the space and progress from the real world QR only.`, answerPrompt: `This stop does not reveal the next page in the UI. You must find the physical clue to continue.`, hint: 'This replaces the wrong site text and keeps the flow physical.', completionType: 'onsite-only', validationMode: 'onsite_qr_only', scanCode: 'IND-09', revealNextInUI: false },
      { id: 'jam-station', title: 'jam station', clue: `For this route’s final challenge, you don’t need to be a musician. You just need to show up, be loud, and be real.
Go to the Jam Station / Open Mic Area.
Bang on a drum.
Sing a line.
Recite a poem.
Shout a chant.
Strum something out of tune.
Add one weird sound to the moment.`, answerPrompt: `Once you perform, the Jam Station volunteer will hand you your next clue.`, hint: 'Volunteer checkpoint only.', completionType: 'volunteer', validationMode: 'volunteer', volunteerCode: 'IND-10', revealNextInUI: false },
    ],
  },
]

export function getRouteBySlug(slug) { return huntRoutes.find((route) => route.slug === slug) }
export function getStop(category, stopId) { const route=getRouteBySlug(category); if(!route) return null; const index=route.stops.findIndex((item)=>item.id===stopId); if(index===-1) return null; return { ...route.stops[index], number:index+1, totalStops:route.stops.length } }
