import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(process.env.LACEDUP_MEDIA_SOURCE || join(root, '..', 'Site Files (1)'))
const publicMedia = join(root, 'public/media')
const migration = join(root, 'migration')

if (!existsSync(source)) throw new Error(`Missing Wix media source: ${source}`)

for (const dir of [
  'archive', 'brand', 'featured', 'graphics', 'sponsors', 'video',
].map((name) => join(publicMedia, name))) mkdirSync(dir, { recursive: true })
mkdirSync(join(root, 'design/concepts'), { recursive: true })
mkdirSync(join(migration, 'source-graphics'), { recursive: true })

const slug = (name) => name
  .normalize('NFKD')
  .replace(/[^a-zA-Z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .toLowerCase()

const uniqueName = (file, used, extension) => {
  const base = slug(basename(file, extname(file))) || 'media'
  let candidate = `${base}${extension}`
  if (used.has(candidate)) {
    const hash = createHash('sha1').update(file).digest('hex').slice(0, 7)
    candidate = `${base}-${hash}${extension}`
  }
  used.add(candidate)
  return candidate
}

const sips = (input, output, maxWidth = 1800, quality = 76) => {
  execFileSync('/usr/bin/sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', String(quality), '-Z', String(maxWidth), input, '--out', output], { stdio: 'ignore' })
}

const copy = (from, to) => copyFileSync(from, to)

const trimLogo = (input, output, crop) => {
  execFileSync('/usr/local/bin/ffmpeg', ['-y', '-loglevel', 'error', '-i', input, '-vf', `crop=${crop}`, '-frames:v', '1', output])
}

const brand = [
  ['LACED_UP_TYPE_LOGO_ONE_LINE_FULL_COLOR.png', 'laced-up-wordmark.png', '1212:120:136:690'],
  ['LACED_UP_TYPE_LOGO_STACKED_FULL_COLOR.png', 'laced-up-stacked.png', '1228:456:126:522'],
  ['LACED_UP_LOGO_ICON_FULL_COLOR_V2.png', 'laced-up-icon.png', '1048:1172:214:164'],
]
for (const [input, output, crop] of brand) trimLogo(join(source, input), join(publicMedia, 'brand', output), crop)

const featured = [
  ['dbj01060 (1)_edited_edited.jpg', 'dbj01060.jpg'],
  ['DBJ01055.jpg', 'dbj01055.jpg'],
  ['DBJ00942.jpg', 'dbj00942.jpg'],
  ['DBJ00954.jpg', 'dbj00954.jpg'],
  ['DBJ00915_edited.jpg', 'dbj00915.jpg'],
  ['DBJ01040_edited.jpg', 'dbj01040.jpg'],
  ['21083384_10214557174667639_7081924786582602647_o.jpg', 'community-2017.jpg'],
  ['21083469_10214557170547536_1350278212530782242_o.jpg', 'community-art.jpg'],
  ['21199725_144741616021536_7503823931210198309_o.jpg', 'volunteers.jpg'],
  ['3H0OVMKS_edited.jpg', 'team.jpg'],
  ['DBJ01028_edited.jpg', 'dbj01028.jpg'],
  ['DBJ01075_edited.jpg', 'dbj01075.jpg'],
]
for (const [input, output] of featured) sips(join(source, input), join(publicMedia, 'featured', output), 2200, 84)

const sponsors = [
  ['MIGHTY_NATION_WHITE (3).png', 'mighty-nation-white.png'],
  ['gatorade-logo.png', 'gatorade.png'],
  ['Office-depot-logo.png', 'office-depot.png'],
  ['Friends-Portland-Logo.png', 'portland-friends.png'],
  ['Rip_City_Remix_logo.svg.png', 'rip-city-remix.png'],
  ['IX+Brand+Logo+White.png', 'ix-brand-white.png'],
  ['JO Transparent.png', 'jo-transparent.png'],
  ['PNW-FS2.png', 'pnw-flow-state.png'],
  ['62047150_374728736356155_259854369040629760_n.png', 'portland-gear.png'],
  ['70600222_2723527524326565_1357877958152290304_n-300x300.png', 'black-parent-initiative.png'],
  ['IMG_5375.png', 'portland-winterhawks.png'],
  ['IMG_5378.png', 'jamn-1075.png'],
  ['IMG_5383.png', 'city-of-portland.png'],
  ['220802-M-YE553-1001.png', 'us-marine-corps.png'],
  ['Throne9.png', 'throne-company-store.png'],
  ['cross the street png (3) (1).png', 'cross-the-street.png'],
  ['download (7).png', 'village-manor.png'],
  ['kp3tv51Uhi89xnTaYghimZeGQGjj12k7.png', 'marmoset.png'],
  ['timberland-logo-.jpg', 'timberland.jpg'],
  ['5 (1).jpg', 'smack-town.jpg'],
  ['5 (2).jpg', 'pb-payments.jpg'],
]
for (const [input, output] of sponsors) copy(join(source, input), join(publicMedia, 'sponsors', output))

const quantumEps = readFileSync(join(source, 'quantum-primaryLogo-fullColor-cmyk.eps'))
const epsMagic = quantumEps.readUInt32LE(0)
if (epsMagic !== 0xc6d3d0c5) throw new Error('Quantum Fiber EPS does not contain the expected binary preview header')
const tiffOffset = quantumEps.readUInt32LE(20)
const tiffLength = quantumEps.readUInt32LE(24)
const quantumPreview = join(migration, 'source-graphics/quantum-full-color-preview.tif')
writeFileSync(quantumPreview, quantumEps.subarray(tiffOffset, tiffOffset + tiffLength))
execFileSync('/usr/bin/sips', ['-s', 'format', 'png', quantumPreview, '--out', join(publicMedia, 'sponsors/quantum-fiber.png')], { stdio: 'ignore' })

const used = new Set()
const manifest = []
const sourceFiles = readdirSync(source).sort()
for (const file of sourceFiles) {
  const full = join(source, file)
  if (!statSync(full).isFile()) continue
  const ext = extname(file).toLowerCase()
  const entry = { original: file, sourceBytes: statSync(full).size, kind: 'source-only' }
  if (['.jpg', '.jpeg'].includes(ext)) {
    const output = uniqueName(file, used, '.jpg')
    sips(full, join(publicMedia, 'archive', output))
    Object.assign(entry, { kind: 'photo', web: `/media/archive/${output}` })
  } else if (ext === '.png') {
    const output = uniqueName(file, used, '.png')
    copy(full, join(publicMedia, 'graphics', output))
    Object.assign(entry, { kind: 'graphic', web: `/media/graphics/${output}` })
  } else if (ext === '.eps') {
    const output = uniqueName(file, used, '.eps')
    copy(full, join(migration, 'source-graphics', output))
    Object.assign(entry, { kind: 'source-graphic', migrated: `migration/source-graphics/${output}` })
  } else if (ext === '.mov') {
    const output = 'laced-up-event.mp4'
    execFileSync('/usr/local/bin/ffmpeg', [
      '-y', '-loglevel', 'error', '-i', full,
      '-vf', 'scale=-2:1080', '-c:v', 'libx264', '-preset', 'medium', '-crf', '25',
      '-movflags', '+faststart', '-an', join(publicMedia, 'video', output),
    ])
    Object.assign(entry, { kind: 'video', web: `/media/video/${output}` })
  }
  manifest.push(entry)
}

writeFileSync(join(migration, 'media-manifest.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), source, total: manifest.length, files: manifest }, null, 2)}\n`)

const migrated = manifest.filter((item) => item.web || item.migrated)
const sourceBytes = manifest.reduce((sum, item) => sum + item.sourceBytes, 0)
const outputBytes = migrated.reduce((sum, item) => {
  const path = item.web ? join(root, 'public', item.web) : join(root, item.migrated)
  return sum + (existsSync(path) ? statSync(path).size : 0)
}, 0)

console.log(JSON.stringify({ sourceFiles: manifest.length, migratedFiles: migrated.length, sourceBytes, outputBytes }, null, 2))
