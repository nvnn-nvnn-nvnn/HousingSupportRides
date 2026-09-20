# Images & Optimization in Astro

Read this before the gallery/carousel guides — it decides where your photos live.

## The short answer to "is there a Cloudinary for Astro?"

**Astro has image optimization built into core** — `astro:assets`, powered by
[sharp](https://sharp.pixelplumbing.com/). It's the equivalent of the Eleventy
image plugin, except you don't install anything. It resizes, converts to modern
formats (WebP/AVIF), and adds `width`/`height` so the page doesn't jump while
loading.

Your options, in order of what I'd reach for:

| Option | When to use | Cost |
| --- | --- | --- |
| **Built-in `astro:assets`** ← *recommended for us* | Photos you commit to the repo. Optimized at build, served as static files from Vercel's CDN. | Free, no account |
| **Vercel image service** | You want on-demand resizing without rebuilding. Enable `imageService: true` in the Vercel adapter. | Counts against Vercel image quota |
| **`astro-cloudinary`** | You need a media library non-devs upload into, on-the-fly transforms, video, or background removal. | Cloudinary account |

**For Housing Support Rides, use the built-in one.** You have maybe dozens of
photos, committed to git, changing rarely. Cloudinary's value is dynamic
transforms and an upload UI at scale — that's a service, an account, and an API
key you don't need yet. If someday staff need to upload photos themselves
without touching the repo, revisit Cloudinary (or put images in Keystatic).

## ⚠️ The catch that matters most

**Astro only optimizes images in `src/`. Images in `public/` are served
untouched.**

That's the single most important rule here, and right now we're on the wrong
side of it:

```
public/img/cover.jpg   ← 2 MB, 4080×3072, served raw to every visitor
```

That's our hero image. On a phone it downloads all 2 MB to display in a space
a few hundred pixels wide. Moving it into `src/` and rendering it through
`<Image />` typically cuts that to ~100–200 KB with no visible difference.

| Folder | Optimized? | How you reference it | Use for |
| --- | --- | --- | --- |
| `src/assets/img/` | ✅ yes | `import photo from '../assets/img/photo.jpg'` | **Photos** |
| `public/img/` | ❌ no | `"/img/photo.jpg"` (plain string) | favicon, logo SVGs, OG images, PDFs |

Rule of thumb: **photographs → `src/`. Everything else → `public/`.**
(SVG logos belong in `public/` — they're already tiny and shouldn't be
rasterized.)

## How to use it

### 1. Put the file in `src/assets/img/`

```
src/assets/img/community-2026.jpg
```

### 2. Import it and render with `<Image />`

In any `.astro` file:

```astro
---
import { Image } from 'astro:assets'
import community from '../assets/img/community-2026.jpg'
---

<Image
  src={community}
  alt="Volunteers and neighbors at the 2026 community picnic"
  widths={[400, 800, 1600]}
  sizes="(max-width: 768px) 100vw, 800px"
  class="h-full w-full object-cover"
/>
```

What each part does:

- **`src={community}`** — the *imported* image, not a string path. Astro reads
  its real dimensions at build time.
- **`alt`** — required. Astro will error without it. Good: that's how it should be.
- **`widths`** — which sizes to generate. Astro emits a `srcset`, the browser
  picks one.
- **`sizes`** — tells the browser how wide the image will *display*, so it can
  choose correctly. Get this roughly right and you save a lot of bytes.
- **`class`** — normal Tailwind. (In `.astro` it's `class`, not `className`.)

### 3. That's it

`npm run build` generates the resized/converted files into `dist/` and rewrites
the URLs. Nothing to configure.

### Useful extras

**Above-the-fold images** (the hero) should load eagerly — otherwise the browser
defers them and your LCP suffers:

```astro
<Image src={hero} alt="…" loading="eager" fetchpriority="high" widths={[800, 1600, 2400]} />
```

**`<Picture>`** if you want explicit control over formats:

```astro
---
import { Picture } from 'astro:assets'
---
<Picture src={photo} alt="…" formats={['avif', 'webp']} fallbackFormat="jpg" />
```

**`getImage()`** when you need just a URL (e.g. for an OG meta tag or a CSS
background) rather than an `<img>` tag:

```astro
---
import { getImage } from 'astro:assets'
import photo from '../assets/img/photo.jpg'
const optimized = await getImage({ src: photo, width: 1200 })
---
<meta property="og:image" content={optimized.src} />
```

## Two sizing traps that cost real megabytes

Both of these bit us on the gallery. Neither errors — they just quietly ship
huge files.

**1. `widths` without `width` makes a full-size fallback.**

```astro
<!-- ❌ src fallback renders at the source's FULL size (4000px, ~3MB) -->
<Image src={photo} alt="…" widths={[400, 800]} sizes="…" />

<!-- ✅ fallback pinned to the 800px render (~164KB) -->
<Image src={photo} alt="…" width={800} height={600} widths={[400, 800]} sizes="…" />
```

`widths` only controls the `srcset`. The plain `src` — what any client ignoring
srcset downloads — defaults to the source's intrinsic size. On phone photos
that's multiple megabytes per image.

**2. `getImage()` defaults to high quality.**

A 2000px WebP generated from a 4080px source came out *larger than the original
JPEG*. Pass it explicitly:

```js
await getImage({ src: img, width: 2000, format: 'webp', quality: 72 })
```

## The gotcha you'll hit first

**You can't `import` a path built from a variable.** This does *not* work:

```astro
---
// ❌ breaks — bundlers need static import paths
const photo = await import(`../assets/img/${name}.jpg`)
---
```

For a gallery driven by a data array, use `import.meta.glob` instead:

```ts
// Eagerly load every image in the folder into a lookup map
const images = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/img/gallery/*.{jpg,jpeg,png,webp}',
  { eager: true },
)
// key looks like: '../assets/img/gallery/community-2026.jpg'
```

Then in your data file you store just the filename, and look it up. The gallery
guide ([gallery-page.md](./gallery-page.md)) shows this in full.

## Migrating what we already have

Our current setup uses `public/img/` + a `MediaPlaceholder` component that takes
a string path. That was the right call when we had zero real photos (it renders
a maroon gradient placeholder so layouts look intentional). Now that real photos
are arriving, move the **photographs** over:

1. `mkdir -p src/assets/img`
2. Move `public/img/cover.jpg` → `src/assets/img/cover.jpg`
3. Update the places that reference it to import + `<Image />`
   (currently `HERO_IMAGE` in `src/lib/content.ts`, used by `Hero.tsx`)

⚠️ **Caveat worth knowing:** `Hero.tsx` and `MediaPlaceholder.tsx` are **React**
components, and `<Image />` is an **Astro** component — you can't use it inside
a `.tsx` file. Two ways around it:

- **Move the image out of React**: render the `<Image />` in the `.astro` page
  and pass it into the React component as a `slot`/child, or
- **Use `getImage()`** in the `.astro` page to get an optimized URL string, then
  pass that string to the React component (which already accepts a `src` string).

The second is the smaller change and works with our existing `MediaPlaceholder`
API unchanged. See [hero-carousel.md](./hero-carousel.md) for a worked example.

## If you later want Cloudinary anyway

```bash
npm install astro-cloudinary
```

Then `<CldImage src="folder/name" width={800} height={600} alt="…" />`, with
`PUBLIC_CLOUDINARY_CLOUD_NAME` in your env. Docs: https://astro.cloudinary.dev

Worth it if: non-technical staff need to upload photos without a deploy, you
want automatic cropping to faces, or you add video. Not worth it just to make
images smaller — Astro already does that.
