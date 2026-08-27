import { readFileSync, statSync } from 'node:fs'
import { URL } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { submitSneakerListRequest, submitSponsorInterest, submitSubscription, submitVolunteerInterest } from './bridge'
import { DONATE_URL, SOCIAL_LINKS, eventYears, navItems, programs, sponsorLogos } from './content'
import { mediaArchiveSummary } from './mediaCatalog'
import eventManifest from '../migration/event-manifest.json'
import blogManifest from '../migration/blog-manifest.json'
import sponsorSheetManifest from '../migration/sponsor-sheet-manifest.json'

describe('site content contract', () => {
  it('keeps every primary route unique', () => {
    expect(new Set(navItems.map(([route]) => route)).size).toBe(navItems.length)
  })

  it('restores every live Wix event route without accepting template metadata', () => {
    expect(eventManifest.count).toBe(7)
    expect(eventManifest.events).toHaveLength(7)
    expect(eventManifest.rejectedTemplateMetadataCount).toBe(1)
    expect(eventManifest.events.find((event) => event.slug === 'laced-up-2nd-annual')).toMatchObject({
      date: 'Date unavailable in archive',
      venue: '',
    })
  })

  it('includes the restored contact and sneaker-list routes', () => {
    expect(navItems).toContainEqual(['/sign-up', 'Sneaker List'])
    expect(navItems).toContainEqual(['/contact', 'Contact'])
  })

  it('uses the preserved Stripe donation link', () => {
    expect(DONATE_URL).toBe('https://buy.stripe.com/eVag1CaB25722ZybII')
  })

  it('includes the six verified event experiences', () => {
    expect(programs).toHaveLength(6)
  })

  it('preserves every Wix media source in the browsable archive or source vault', () => {
    expect(mediaArchiveSummary).toEqual({
      sourceFiles: 315,
      photos: 284,
      graphics: 27,
      videos: 1,
      sourceGraphics: 3,
    })
    expect(mediaArchiveSummary.photos + mediaArchiveSummary.graphics + mediaArchiveSummary.videos + mediaArchiveSummary.sourceGraphics).toBe(mediaArchiveSummary.sourceFiles)
  })

  it('publishes the supplied partner and annual event identities', () => {
    expect(sponsorSheetManifest.logos).toHaveLength(51)
    expect(sponsorLogos).toHaveLength(63)
    expect(new Set(sponsorLogos.map(([, name]) => name)).size).toBe(63)
    expect(sponsorLogos.map(([, name]) => name)).toEqual(expect.arrayContaining([
      'Quantum Fiber from AT&T',
      'DJ Switch PDX',
      'OMSI',
      'Portland Timbers',
      'Trader Joe\'s',
      'Lux Automaton',
    ]))
    expect(eventYears.map(({ year }) => year)).toEqual(['2026', '2025', '2024'])
  })

  it('uses the official social destinations', () => {
    expect(SOCIAL_LINKS).toEqual({
      facebook: 'https://www.facebook.com/laceduppdx/',
      instagram: 'https://www.instagram.com/laceduppdx/',
    })
  })

  it('publishes the complete blog archive as local photo stories', () => {
    expect(blogManifest.posts).toHaveLength(44)
    expect(blogManifest.posts.every((post) => post.status === 'Published')).toBe(true)
    expect(blogManifest.posts.every((post) => post.image.startsWith('/media/blog/'))).toBe(true)
    expect(blogManifest.posts.every((post) => !post.externalUrl)).toBe(true)
  })

  it('keeps a dedicated newsletter signup section on the homepage', () => {
    const appSource = readFileSync(new URL('./App.jsx', import.meta.url), 'utf8')
    const styles = readFileSync(new URL('./styles.css', import.meta.url), 'utf8')
    expect(appSource).toContain('function NewsletterSection()')
    expect(appSource).toContain('<NewsSection /><NewsletterSection /><SponsorRail />')
    expect(appSource).toContain('<NewsletterSignupForm />')
    expect(styles).toContain('.newsletter-signup-section')
  })

  it('features the supplied community film on the Our Story page', () => {
    const appSource = readFileSync(new URL('./App.jsx', import.meta.url), 'utf8')
    const styles = readFileSync(new URL('./styles.css', import.meta.url), 'utf8')
    const video = statSync(new URL('../public/media/video/lacedup-our-story.mp4', import.meta.url))
    const poster = statSync(new URL('../public/media/video/lacedup-our-story-poster.jpg', import.meta.url))
    expect(appSource).toContain("/media/video/lacedup-our-story.mp4")
    expect(appSource).toContain("/media/video/lacedup-our-story-poster.jpg")
    expect(appSource).toContain('playsInline preload="metadata"')
    expect(styles).toContain('.story-film')
    expect(video.size).toBeGreaterThan(30_000_000)
    expect(poster.size).toBeGreaterThan(100_000)
  })

  it('posts visitor newsletter signups to the connected Studio endpoint', async () => {
    const originalWindow = globalThis.window
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ form: { id: 'form-newsletter-qa', type: 'Email subscription', status: 'New' } }),
    })
    globalThis.window = { fetch }
    try {
      const form = await submitSubscription({ name: 'Newsletter QA', email: 'newsletter.qa@example.test' })
      expect(form).toMatchObject({ type: 'Email subscription', status: 'New' })
      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:4177/api/bridge/forms/subscribe', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Newsletter QA', email: 'newsletter.qa@example.test' }),
      }))
    } finally {
      if (originalWindow === undefined) delete globalThis.window
      else globalThis.window = originalWindow
    }
  })

  it('routes Volunteer, Sneaker, and Sponsor forms to their Studio queues', async () => {
    const originalWindow = globalThis.window
    const fetch = vi.fn().mockImplementation(async (url) => ({
      ok: true,
      json: async () => url.endsWith('/volunteer') ? { volunteer: { id: 1000, name: 'Volunteer Applicant' } } : { form: { id: 'form-qa', status: 'New' } },
    }))
    globalThis.window = { fetch }
    try {
      await submitVolunteerInterest({ firstName: 'Volunteer', lastName: 'Applicant', email: 'volunteer@example.test' })
      await submitSneakerListRequest({ parentFirstName: 'Guardian', parentLastName: 'Applicant', email: 'guardian@example.test', termsAccepted: 'on' })
      await submitSponsorInterest({ name: 'Sponsor Contact', organization: 'Portland Partner', email: 'partner@example.test', partnershipType: 'Event sponsorship' })

      expect(fetch.mock.calls.map(([url]) => url)).toEqual([
        'http://127.0.0.1:4177/api/bridge/forms/volunteer',
        'http://127.0.0.1:4177/api/bridge/forms/sneaker-list',
        'http://127.0.0.1:4177/api/bridge/forms/sponsor',
      ])
      expect(JSON.parse(fetch.mock.calls[1][1].body).termsAccepted).toBe(true)
      expect(JSON.parse(fetch.mock.calls[2][1].body)).toMatchObject({ organization: 'Portland Partner', partnershipType: 'Event sponsorship' })
    } finally {
      if (originalWindow === undefined) delete globalThis.window
      else globalThis.window = originalWindow
    }
  })
})
