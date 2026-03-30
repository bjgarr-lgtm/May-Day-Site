MAY DAY PHASE 1 PATCH

Files included:
- src/pages/MayDayWelcomeCenter.jsx
- src/components/mayday/NoiseBackground.jsx
- src/data/maydayContent.js

Assumptions:
- Existing React + Vite app
- Tailwind already wired in
- lucide-react installed

What this patch gives you:
- Single page phase one welcome center
- Pink and green poster based styling
- Vintage noise background treatment
- Schedule section with filters
- Map placeholder zone section
- Hunt landing section
- Practical info section
- Shop section that links out to external merch

What you still need to wire:
- A route that renders MayDayWelcomeCenter
- Your real shop URL in src/data/maydayContent.js under siteMeta.shopHref
- Real map image or interactive map implementation
- Real scavenger hunt routes and QR targets
- Final content as details lock
