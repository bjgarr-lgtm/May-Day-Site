# May Day self hosted Instagram feed patch

This patch avoids Facebook and paid feed vendors by using:
- your existing homepage feed UI
- a Cloudflare ingest endpoint
- a desktop Playwright watcher that scrapes public Instagram pages and pushes updates into KV

## Files included
- `src/components/LiveInstagramTicker.jsx`
- `functions/api/live-feed.js`
- `functions/api/desktop-ingest.js`
- `desktop-instagram-watcher/package.json`
- `desktop-instagram-watcher/.env.example`
- `desktop-instagram-watcher/scraper.js`
- `desktop-instagram-watcher/README.md`

## Cloudflare env vars required
```bash
DESKTOP_INGEST_TOKEN=replace_with_a_long_random_secret
MAYDAY_IG_PROFILE_URL=https://www.instagram.com/maydayontheharbor/
```

## Cloudflare binding required
- `IG_FEED` KV namespace

## Notes
This patch assumes your homepage is already mounting `LiveInstagramTicker`.
If not, also apply the earlier homepage mounting patch.
