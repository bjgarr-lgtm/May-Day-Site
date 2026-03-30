MAY DAY PHASE TWO PATCH

This patch is surgical and only includes the files needed for:
- hash-based routing so Pages does not need server rewrites
- a first real scavenger hunt route structure
- stop pages with progress saved in localStorage
- links from the homepage into the hunt

Files added or modified:
- package.json
- src/main.jsx
- src/App.jsx
- src/data/huntData.js
- src/lib/huntProgress.js
- src/components/mayday/PageShell.jsx
- src/pages/HuntHome.jsx
- src/pages/HuntStopPage.jsx
- src/pages/MayDayWelcomeCenter.jsx

What this phase gives you:
- home page still works
- new route: /#/hunt
- new route pattern: /#/hunt/:category/:stopId
- local browser progress tracking
- a structure ready for QR codes later

What you will likely do next:
- replace sample stops with real scavenger hunt copy
- make the map link to hunt zones
- wire QR codes to these real route URLs
