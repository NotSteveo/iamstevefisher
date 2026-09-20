# Steve Fisher — Portfolio

A local, self-hosted rebuild of [i-am-steve-fisher-bd14e5.webflow.io](https://i-am-steve-fisher-bd14e5.webflow.io/), built with Next.js (App Router) and hand-written CSS instead of Webflow's generated markup. Content, images, and video were pulled from the live Webflow site and are stored locally in this repo.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `app/` — routes (home, `/work`, `/work/[slug]`, `/about-us`, `/contact`, `/ai-musings`, `/ai-musings/[slug]`)
- `components/` — shared UI (Navbar, ContactSection/ContactForm, WorkCard, case study renderer, etc.)
- `lib/content.ts` — typed accessors over `data/content.json`, the crawled site content
- `lib/caseStudy.ts` — groups a case study's flat section/image/video list into renderable blocks
- `lib/assets.ts` + `lib/asset-map.json` — maps original Webflow CDN URLs to the local files in `public/images` and `public/videos`
- `data/content.json` — structured content pulled from the live site (text, image URLs, video sources)
- `scripts/download-assets.py` — one-off script that downloaded every referenced image/video into `public/` and generated `lib/asset-map.json`. Safe to re-run if `data/content.json` changes; safe to delete otherwise.

## Known content quirks (carried over faithfully from the live site)

- The homepage's "LEAP 2026" and "Web refresh" featured cards both link to `/work/quantum-metric-web-design` — there's no separate LEAP 2026 page on the live site either.
- Both AI Musings index cards ("howtobrandai.com" and "Locksmith - After Effects plugin") link to the same `/ai-musings/how-to-brand-ai` post.

## Contact form

`components/ContactForm.tsx` posts to `app/api/contact/route.ts`, which currently just validates and logs the submission — **it does not send email yet**. Wire it up to a real provider (e.g. [Resend](https://resend.com), Postmark, or a webhook) before relying on it in production.

## Deploying

Push to GitHub and import the repo on [Vercel](https://vercel.com/new) — no special configuration needed. Note that `public/videos` is ~70MB and `public/images` ~30MB; both are checked into git since they're static, immutable assets.
