# Price Offices Website

Static site for priceoffices.com with a scroll-driven video hero (Sydney Harbour at night). Scroll position scrubs the film forward, then dissolves it to black as the opening statement rises into view.

## Stack

- Single static page (`index.html`), no build step
- Express server (`server.js`) — needed for HTTP Range support so video seeking works
- Deployed on Railway from this repo

## Run locally

```
npm install
npm start
```

Serves on http://localhost:3000.

## Assets

- `assets/sydney-harbour-hero.mp4` — re-encoded for scrubbing: audio stripped, 30 fps, 12-frame keyframe interval, faststart (11.8 MB)
- `assets/sydney-harbour-poster.jpg` — first frame, painted before the mp4 loads
- `assets/price-mark.svg` — brand logo source
