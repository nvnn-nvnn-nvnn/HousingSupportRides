/**
 * Resize + crop one photo into web-ready JPEGs at several widths.
 *
 *   npm run img -- <input> <outBase> <aspect> <widths> [position]
 *
 *   npm run img -- src/assets/img/gallery/IMG_1.jpg public/img/cards/driver 3:2 640,960
 *     → public/img/cards/driver-640.jpg, public/img/cards/driver-960.jpg
 *
 * - aspect:   "16:7", "3:2", "4:3"… or "none" to keep the photo's own shape.
 * - widths:   comma-separated pixel widths.
 * - position: optional crop anchor when the aspect cuts something off:
 *             centre (default), top, bottom, left, right, or "attention"
 *             (sharp guesses the most interesting part).
 *
 * Phone photos are rotated upright first (EXIF), then saved at quality 72
 * with mozjpeg — the same settings as the hero and Support Us photos.
 * See how-to/images.md → "Resizing photos with the script".
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const [input, outBase, aspect = 'none', widthsArg = '1200', position = 'centre'] = process.argv.slice(2)

if (!input || !outBase) {
  console.error('Usage: npm run img -- <input> <outBase> <aspect|none> <widths> [position]')
  process.exit(1)
}

const widths = widthsArg.split(',').map((w) => Number.parseInt(w, 10)).filter(Boolean)
const ratio = aspect === 'none' ? null : aspect.split(':').map(Number)
const pos = position === 'attention' ? sharp.strategy.attention : position

fs.mkdirSync(path.dirname(outBase), { recursive: true })

for (const width of widths) {
  const height = ratio ? Math.round((width * ratio[1]) / ratio[0]) : undefined
  const out = `${outBase}-${width}.jpg`
  const info = await sharp(input)
    .rotate()
    .resize({ width, height, fit: 'cover', position: pos, withoutEnlargement: true })
    .jpeg({ quality: 72, mozjpeg: true })
    .toFile(out)
  console.log(`${out}  ${info.width}×${info.height}  ${Math.round(info.size / 1024)} KB`)
}
