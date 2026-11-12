# অনলাইন আবেনদ ঘর

A fast, static website for Bangladeshi job seekers — built with **Astro**, **Tailwind CSS v4** and **React** islands.

## Pages

| Route | Description |
| --- | --- |
| `/` | Homepage — hero cover, quick tool links, help card, feature cards |
| `/picture-to-pdf` | Client-side image → PDF converter (jsPDF) |
| `/cv-maker` | CV builder with live A4 preview and print-to-PDF |
| `/contact` | Contact channels, message form and FAQ |

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:4321>.

## Build & preview

```bash
npm run build
npm run preview
```

The production output is generated in `dist/` and can be hosted on any static host
(Netlify, Vercel, Cloudflare Pages, GitHub Pages, etc.).

## Customise before going live

1. **Contact links** — edit `src/data/site.ts`. The WhatsApp number, Messenger
   username, Facebook group and email are placeholders right now.
2. **Site name** — the brand name in `src/data/site.ts` follows the supplied
   documentation exactly (`অনলাইন আবেনদ ঘর`). Change it there if needed.
3. **Homepage content** — edit the feature cards in `src/data/content.ts` and the
   copy in `src/pages/index.astro`.
4. **Images** — replace the SVGs in `public/images/` with real artwork if desired.
5. **Domain** — update `site` in `astro.config.mjs` and `site.url` in
   `src/data/site.ts`.

## How the tools work

- **Picture to PDF** runs entirely in the browser. Images are normalised to JPEG
  on a canvas and placed one-per-page in a PDF using `jsPDF`. Nothing is uploaded
  to a server. Page size, orientation, margin and image quality can be changed.
- **CV maker** keeps form data in `localStorage` (on the user's device) and shows
  a live A4 preview. The download button opens the browser print dialog; choosing
  **Save as PDF** produces a vector PDF with the Bengali/English text intact. The
  print stylesheet strips the site chrome so only the CV is printed.

## Tech notes

- `@astrojs/react` is used for the navbar drawer and interactive tools.
- Tailwind CSS v4 is wired through `@tailwindcss/vite` (`src/styles/global.css`).
- Bengali typography uses the locally bundled **Hind Siliguri** font via
  `@fontsource/hind-siliguri`.
- jsPDF is lazy-loaded only when the user clicks the convert button.
