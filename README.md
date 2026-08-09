# LeLe Hair Design

The official one-page website for LeLe Hair Design in Hoàn Kiếm, Hà Nội. Built with Next.js, TypeScript, and Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

For a production check:

```bash
npm run build
npm run lint
```

## Content and contact details

Business information, services, portfolio entries, journal previews, navigation, and SEO copy are maintained in [src/data/content.ts](src/data/content.ts).

The current contact details are:

- Nhà số 9/22 Lương Ngọc Quyến, Hoàn Kiếm, Hà Nội
- 0888 565 798
- 09:30 – 20:00
- https://www.instagram.com/vanhlele94/
- https://www.facebook.com/Vanhlele94

## Replacing imagery

All local image URLs use the Next.js public-folder convention: a file at
`public/images/example.jpg` is referenced as `/images/example.jpg`. The current
hero image is `/images/hero-salon.jpg`; its supplied source photo is retained at
`public/images/hero/hero-lele-long-layer.png`. Other current section images are
explicitly labelled illustrative SVG assets until official photography is added.

Before adding a new image path to `src/data/content.ts`, ensure the exact file
exists under `public/images/`.

## Deployment

Run `npm run build` and deploy the resulting Next.js application to the chosen hosting provider. Add the verified production domain to `src/app/sitemap.ts` before enabling sitemap URLs.
