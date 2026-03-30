SOCIAL HISTORY SHOP PATCH

Files included:
- src/data/maydayContent.js
- src/pages/MayDayWelcomeCenter.jsx

What this patch does:
- adds Facebook and Instagram links to site metadata
- adds labor history of the harbor link to site metadata
- renders social media icon buttons in the info section
- adds a labor history button under the why may day card
- updates the shop cards so they can render real photos whenever merchItems imageSrc is set

How to add real shop photos:
1. put image files in /public, for example:
   /public/shop/poster.jpg
   /public/shop/shirts.jpg
   /public/shop/support.jpg
2. edit src/data/maydayContent.js
3. set imageSrc on each merch item, for example:
   imageSrc: '/shop/poster.jpg'

If imageSrc is null, the placeholder gradient stays in place.
