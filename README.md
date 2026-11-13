# Not White — Baaz in Kora White

An unofficial campaign page for the Gully Labs *Gully Number 001 – Baaz* in Kora White.

"Kora" means unbleached, and blank. So the page opens on bleached screen-white, the scroll pulls the white out weft by weft until the page is the exact colour of the shoe's canvas, and on that blank page a single tan line gets drawn: the Baaz trail. Then the cloth takes shape around it.

## Run it

No build step. From this folder:

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173/

Any static file server works (`npx serve .` for example). Opening `index.html` straight from disk also works, but a server is the tested path.

- Reduced motion: turn on "reduce motion" in your OS, or add `?static` to the URL, to get the static document version.
- Everything is local. GSAP, ScrollTrigger, Lenis and the fonts are vendored; the page makes no network requests except the outbound product links.

## What's here

| Path | What |
|---|---|
| `index.html`, `css/style.css`, `js/main.js` | The site |
| `vendor/` | GSAP 3.15.1 + ScrollTrigger, Lenis 1.3.27 |
| `fonts/` | Rozha One (Latin + Devanagari), Instrument Sans, DM Mono |
| `assets/img/` | Optimised WebP used by the page (2.6 MB total, largest file 260 KB) |
| `assets/originals/` | Full-quality originals as downloaded, plus `manifest.json` with source URLs |
| `assets/work/` | Full-resolution cutout PNGs (intermediate) |
| `tools/cutout.py` | Background removal (rembg, `isnet-general-use` model) |
| `tools/process.py` | Alpha clean-up, hole filling, tan-layer extraction, heel split, resizing, WebP export |
| `tools/shots.js`, `tools/wheel.js`, `tools/sheet.py` | Playwright capture and contact-sheet scripts used for checking |
| `RESEARCH.md` | Findings and sources |

To rebuild the assets: `pip install "rembg[cpu]"`, then run `tools/cutout.py assets/work <originals…>` followed by `python3 tools/process.py`.

## How the scroll is built

1. **Bleach.** A white layer sits over a kora layer with the same layout. Scroll drives a `clip-path` polygon made of 19 horizontal strips (13 on phones) that retract left and right in a fixed shuffled order, so "This is white." becomes "This is कोरा." in place.
2. **The line.** The side-profile cutout is split into two layers: the full shoe, and only its tan pixels (trail, bound edges, eyelets, heel embroidery). A camera starts tight on the heel and follows a soft mask that reveals the tan layer heel to toe, then pulls back, and the full shoe fades up. The page colour is the median canvas colour sampled from the photo, so the upper appears out of the page itself.
3. **Raw.** Vertical scroll moves a horizontal strip of the brand's close-ups, captioned with the brand's own lines.
4. **The pair.** The two heels come in from either edge and meet: गली + LABS.
5. **Laces.** Crossing the midpoint swaps cream laces for tan with a diagonal wipe and floods the page in the trail colour. The toggle does the same by tap.
6. **Hands, Write, End.** Workshop facts and specs on the cobalt of the Gully Labs box, the lifestyle photography in parallax, and the trail drawn once more above the link to buy.

Pinned chapters use `position: sticky` with scrubbed GSAP timelines, so every state is a pure function of scroll position and plays the same backwards. Lenis smooths wheel input on desktop; touch devices keep native momentum scrolling.

## Asset credits

All photography is official Gully Labs product photography, © Gully Labs, downloaded on 2026-11-13 from the Shopify CDN URLs listed on the two product pages:

- https://gullylabs.com/products/gully-number-001-baaz-kora-white
- https://gullylabs.com/products/gully-number-001-baaz-kora-white-for-women

No licence is published for these images. They are used here for an unsolicited, non-commercial concept and would need Gully Labs' permission for any public or commercial use. Lines shown in quotation marks on the page are quoted from gullylabs.com.

| Original (`assets/originals/`) | Used as (`assets/img/`) | Source |
|---|---|---|
| `m01_4_6.jpg` | `side-full.webp`, `side-line.webp` — side profile, cut out; tan-only layer derived from it | https://cdn.shopify.com/s/files/1/0693/2385/0012/files/4_6.jpg |
| `m02_12_7.jpg` | `life-rug.webp` | https://cdn.shopify.com/s/files/1/0693/2385/0012/files/12_7.jpg |
| `m03_2_88f583d8-72fb-4c8c-8038-7b6e40022e61.png` | `pair-tan.webp` — pair with tan laces, cut out | https://cdn.shopify.com/s/files/1/0693/2385/0012/files/2_88f583d8-72fb-4c8c-8038-7b6e40022e61.png |
| `m04_5_a767f506-465a-4901-abec-fc5bf929ccab.png` | `pair-cream.webp` — pair with cream laces, cut out | https://cdn.shopify.com/s/files/1/0693/2385/0012/files/5_a767f506-465a-4901-abec-fc5bf929ccab.png |
| `m05_1_a1bfd843-6525-4074-841f-ee0a1837efb0.png` | `heel-l.webp`, `heel-r.webp` — heel pair, cut out and split | https://cdn.shopify.com/s/files/1/0693/2385/0012/files/1_a1bfd843-6525-4074-841f-ee0a1837efb0.png |
| `m06_DSC00721_1f8dea28-a949-452b-878b-06bb5eb2a0cd.png` | `detail-toe.webp` | https://cdn.shopify.com/s/files/1/0693/2385/0012/files/DSC00721_1f8dea28-a949-452b-878b-06bb5eb2a0cd.png |
| `m07_7_7860f045-77d3-43ce-98f2-cfb16cc9b0d2.png` | `detail-trail.webp` | https://cdn.shopify.com/s/files/1/0693/2385/0012/files/7_7860f045-77d3-43ce-98f2-cfb16cc9b0d2.png |
| `m08_2_ca55ecf4-e8ca-4bad-bcf2-85abe1067248.png` | `detail-tongue.webp` | https://cdn.shopify.com/s/files/1/0693/2385/0012/files/2_ca55ecf4-e8ca-4bad-bcf2-85abe1067248.png |
| `m09_3_d1b5b985-f226-4e9c-84e2-eefb4fd3ec0a.png` | `box.webp` (processed, not used on the page) | https://cdn.shopify.com/s/files/1/0693/2385/0012/files/3_d1b5b985-f226-4e9c-84e2-eefb4fd3ec0a.png |
| `m10_13_6.jpg` | `life-tie.webp` | https://cdn.shopify.com/s/files/1/0693/2385/0012/files/13_6.jpg |
| `m11_11_6.jpg` | `life-socks.webp` | https://cdn.shopify.com/s/files/1/0693/2385/0012/files/11_6.jpg |
| `w01_5_6.jpg` | downloaded for reference, not used | https://cdn.shopify.com/s/files/1/0693/2385/0012/files/5_6.jpg |
| `w02_13_5.jpg` | `life-room.webp` | https://cdn.shopify.com/s/files/1/0693/2385/0012/files/13_5.jpg |
| `w03_6_041a7bcc-2e87-4cc6-a23d-5cb7cc38d089.png` | downloaded for reference, not used | https://cdn.shopify.com/s/files/1/0693/2385/0012/files/6_041a7bcc-2e87-4cc6-a23d-5cb7cc38d089.png |
| `w04_2_1b4b0c78-0e86-47c0-b4f8-5d1285193adf.png` | downloaded for reference, not used | https://cdn.shopify.com/s/files/1/0693/2385/0012/files/2_1b4b0c78-0e86-47c0-b4f8-5d1285193adf.png |
| `w05_DSC00721_5b9d4ba5-3e77-4777-aa79-76ca5e4e092c.png` | downloaded for reference, not used | https://cdn.shopify.com/s/files/1/0693/2385/0012/files/DSC00721_5b9d4ba5-3e77-4777-aa79-76ca5e4e092c.png |
| `w06_3_74c684b7-70ab-413c-b7a0-a5cb58422332.png` | downloaded for reference, not used | https://cdn.shopify.com/s/files/1/0693/2385/0012/files/3_74c684b7-70ab-413c-b7a0-a5cb58422332.png |
| `w07_7_510e8b9a-0db5-425e-9ec3-ab532caaccb7.png` | downloaded for reference, not used | https://cdn.shopify.com/s/files/1/0693/2385/0012/files/7_510e8b9a-0db5-425e-9ec3-ab532caaccb7.png |
| `w08_12_6.jpg` | `life-hold.webp` | https://cdn.shopify.com/s/files/1/0693/2385/0012/files/12_6.jpg |
| `w09_8_ff80d340-173f-4adb-9592-c2291e0ee9c5.png` | downloaded for reference, not used | https://cdn.shopify.com/s/files/1/0693/2385/0012/files/8_ff80d340-173f-4adb-9592-c2291e0ee9c5.png |

Each image was checked by eye against the Kora White colourway (ecru canvas, tan trail, गली / LABS heels) before use. Cutouts were made locally; shape, colour and detail were left as shot, apart from alpha clean-up at the edges.

**What was missing:** there is no top-down, outsole or 360° photography of this colourway, and no video. The concept is built around the side profile, the one angle that shows the whole trail.

Other credits:

- Fonts: Rozha One, Instrument Sans, DM Mono — SIL Open Font License, via Fontsource.
- GSAP — GreenSock standard "no charge" licence. Lenis — MIT.
- Background removal: rembg (MIT) with the IS-Net general-use model.

## Verified

Checked in headless Chromium with Playwright:

- Desktop 1440×810 and 1920×1080, tablet 820×1180, phone 390×844 (touch emulation): every chapter captured at multiple scroll positions, no console errors.
- Real wheel input on desktop, down through the reveal and back up to the top: states reverse cleanly, including the page going back to white. Frame time during that run: median 16.7 ms, 95th percentile 16.8 ms.
- Reduced motion on desktop and phone: static layout, all content present, lace toggle still works.

Not checked: Safari and Firefox, and a physical phone. The page uses `clip-path`, CSS masks (with the `-webkit-` prefix) and `svh` units, all of which those browsers support, but it has only been run in Chromium.
