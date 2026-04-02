# MayDay IG Live Feed Patch

Drop-in components and Cloudflare functions for a live Instagram ticker.

## Install
1. Copy `components/LiveInstagramTicker.jsx` into your project
2. Import into your homepage:

```jsx
import LiveInstagramTicker from './components/LiveInstagramTicker';

<LiveInstagramTicker title="live from the harbor" />
```

3. Deploy functions under `/functions/api/`
4. Configure KV + env vars

## Endpoints
- /api/live-feed
- /api/instagram-webhook
