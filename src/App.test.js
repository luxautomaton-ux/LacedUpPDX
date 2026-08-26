import { describe, expect, it } from 'vitest'
import { DONATE_URL, SOCIAL_LINKS, eventYears, navItems, programs, sponsorLogos } from './content'
import { mediaArchiveSummary } from './mediaCatalog'
import eventManifest from '../migration/event-manifest.json'
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
})
