# Price Offices Website

Single-page site for priceoffices.com with two scroll-driven Sydney Harbour night videos. Hero video scrubs on scroll, then dissolves to black. Scene 2 video lives in a fixed background layer, fades in at "Our Portfolio" and scrubs through the rest. GSAP + ScrollTrigger handle section reveals and animations. anime.js powers the loading animation.

## Stack

- Single static page (`index.html`), no build step
- Express server (`server.js`) — needed for HTTP Range support (206 Partial Content) for smooth video seeking
- Node >=20
- Deployed on Railway

## Run locally

```
npm install
npm start
```

Serves on http://localhost:3000.

## Assets

- `assets/sydney-harbour-hero.mp4` (11 MB) — hero layer. Re-encoded for scrubbing: audio stripped, 30 fps, 12-frame keyframe interval, faststart.
- `assets/sydney-harbour-poster.jpg` (157 KB) — first frame of hero video, painted before the mp4 loads.
- `assets/sydney-harbour-hero-2.mp4` (14 MB) — scene 2 layer (behind portfolio/philosophy/contact). Same encoding as hero.
- `assets/sydney-harbour-poster-2.jpg` (156 KB) — first frame of scene 2 video.
- `assets/price-mark.svg` — logo symbol (full lockup in hero, symbol-only in nav).

## Key Implementation

- **Two scroll-scrubbed video layers:** Single requestAnimationFrame loop sets `video.currentTime` from scroll progress (with lerp smoothing). Hero video is pinned in `.hero-track`. Scene 2 uses fixed positioning (toggled by IntersectionObserver `is-active` class) and sits behind the main content.
- **Progressive enhancement:** GSAP + ScrollTrigger (CDN) drive reveals and animations. If blocked or prefers-reduced-motion is set, all text is visible in its natural state.
- **Loading animation:** anime.js-driven particles + logo assembly, gold-on-ink palette, shown once per session via sessionStorage.

See `/Users/harryprice/personal-projects/priceoffices/CLAUDE.md` for video encoding details, deployment workflow, and domain routing (DNS_SETUP.md).
