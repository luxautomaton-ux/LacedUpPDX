import { copyFile, mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(projectRoot, 'dist')
const indexFile = path.join(distDir, 'index.html')

const readManifest = async (name) => JSON.parse(await readFile(path.join(projectRoot, 'migration', name), 'utf8'))
const [blogManifest, eventManifest] = await Promise.all([
  readManifest('blog-manifest.json'),
  readManifest('event-manifest.json'),
])

const topLevelRoutes = [
  'our-story',
  'programs',
  'events',
  'sign-up',
  'get-involved',
  'news',
  'gallery',
  'sponsors',
  'contact',
  'support-us',
  'blog',
  'who-we-are',
  'copy-of-sign-up-child',
]

const routes = [
  ...topLevelRoutes,
  ...eventManifest.events.map(({ slug }) => `events/${slug}`),
  ...blogManifest.posts.filter(({ status }) => status === 'Published').map(({ slug }) => `news/${slug}`),
]

await copyFile(indexFile, path.join(distDir, '404.html'))

for (const route of routes) {
  const routeDir = path.join(distDir, route)
  await mkdir(routeDir, { recursive: true })
  await copyFile(indexFile, path.join(routeDir, 'index.html'))
}

console.log(`Prepared GitHub Pages fallback plus ${routes.length} direct routes.`)
