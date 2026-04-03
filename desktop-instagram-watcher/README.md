# May Day desktop Instagram watcher

This runs on your desktop and pushes the newest visible Instagram posts into your site feed.

## What it scrapes
- `@maydayontheharbor`
- `#MayDayOnTheHarbor`

## Desktop setup
1. Install Node.js 20 or newer
2. In this folder run:
   ```bash
   npm install
   npx playwright install chromium
   ```
3. Copy `.env.example` to `.env`
4. Fill in:
   - `INGEST_URL`
   - `INGEST_TOKEN`
5. Start the watcher:
   ```bash
   npm start
   ```

## What success looks like
You should see logs like:
```text
[12:01:03 PM] scraping https://www.instagram.com/maydayontheharbor/ and #MayDayOnTheHarbor
[12:01:07 PM] pushed 8 items
```

## Event day rules
- keep the desktop awake
- keep the terminal running
- disable sleep
- do not reboot mid event unless you enjoy suffering
