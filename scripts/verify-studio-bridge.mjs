import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const playwrightModule = process.env.PLAYWRIGHT_MODULE
if (!playwrightModule) throw new Error('Set PLAYWRIGHT_MODULE to the local Playwright index.mjs path.')

const { chromium } = await import(pathToFileURL(playwrightModule).href)
const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const studioCandidates = [
  process.env.LACEDUP_STUDIO_DIR,
  resolve(scriptDirectory, '../../studio'),
  resolve(scriptDirectory, '../../Laced Up PDX Manager'),
].filter(Boolean)
let storePath
for (const studioRoot of studioCandidates) {
  const candidate = resolve(studioRoot, 'data/bridge-store.json')
  try {
    await access(candidate)
    storePath = candidate
    break
  } catch {
    // Try the next supported checkout layout.
  }
}
if (!storePath) throw new Error('Could not locate the Studio store. Set LACEDUP_STUDIO_DIR to the Studio folder.')
const artifactDirectory = resolve(scriptDirectory, '../artifacts')
const originalStore = await readFile(storePath, 'utf8')
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE || undefined })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const manager = await context.newPage()
const publicSite = await context.newPage()
const browserErrors = []

for (const page of [manager, publicSite]) {
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(`console: ${message.text()}`)
  })
  page.on('pageerror', (error) => browserErrors.push(`page: ${error.message}`))
}

try {
  await mkdir(artifactDirectory, { recursive: true })
  await manager.goto('http://127.0.0.1:4177/', { waitUntil: 'networkidle' })
  await manager.getByRole('button', { name: 'Website', exact: true }).click()
  await manager.getByText('LacedUp Studio is connected locally').waitFor()
  await manager.getByLabel('Show this announcement on the website').check()
  await manager.getByLabel('Announcement text').fill('Volunteer registration is open—step into the movement.')
  await manager.getByLabel('Button label').fill('Volunteer now')
  await manager.getByLabel('Button link').fill('/get-involved')
  await manager.getByRole('button', { name: 'Publish to website' }).click()
  await manager.getByText('Announcement published to the local website.').waitFor()
  await manager.screenshot({ path: resolve(artifactDirectory, 'studio-connected.png'), fullPage: true })

  await publicSite.goto('http://127.0.0.1:4179/', { waitUntil: 'networkidle' })
  await publicSite.getByText('Volunteer registration is open—step into the movement.').waitFor()
  await publicSite.getByRole('link', { name: /Volunteer now/ }).click()
  await publicSite.getByLabel('First name').fill('Lux')
  await publicSite.getByLabel('Last name').fill('Bridge Test')
  await publicSite.getByLabel('Email').fill('bridge.qa@example.org')
  await publicSite.getByLabel('Phone').fill('(503) 555-0109')
  await publicSite.getByLabel('I want to help with').selectOption({ label: 'Event volunteering' })
  await publicSite.getByLabel('Message').fill('Synthetic connection test; no follow-up needed.')
  await publicSite.getByRole('button', { name: /Send interest/ }).click()
  await publicSite.getByText('Application received in LacedUp Studio.').waitFor()
  await publicSite.screenshot({ path: resolve(artifactDirectory, 'website-connected.png'), fullPage: true })

  await manager.reload({ waitUntil: 'networkidle' })
  await manager.getByRole('button', { name: 'Volunteers', exact: true }).click()
  await manager.getByPlaceholder('Search volunteers...').fill('Lux Bridge Test')
  await manager.getByText('Lux Bridge Test', { exact: true }).waitFor()

  if (browserErrors.length) throw new Error(browserErrors.join('\n'))
  console.log(JSON.stringify({
    connected: true,
    announcementPublished: true,
    volunteerReceived: true,
    browserErrors: 0,
    screenshots: ['artifacts/studio-connected.png', 'artifacts/website-connected.png'],
  }, null, 2))
} finally {
  await context.close()
  await browser.close()
  await writeFile(storePath, originalStore, 'utf8')
}
