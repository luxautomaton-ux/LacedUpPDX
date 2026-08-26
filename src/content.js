import {
  Backpack,
  CircleDot,
  HandHeart,
  Music2,
  School,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import sponsorSheetManifest from '../migration/sponsor-sheet-manifest.json'

export const DONATE_URL = 'https://buy.stripe.com/eVag1CaB25722ZybII'
export const EMAIL = 'laceduppdx@gmail.com'
export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/laceduppdx/',
  instagram: 'https://www.instagram.com/laceduppdx/',
}

export const navItems = [
  ['/', 'Home'],
  ['/our-story', 'Our Story'],
  ['/programs', 'Programs'],
  ['/events', 'Events'],
  ['/sign-up', 'Sneaker List'],
  ['/get-involved', 'Get Involved'],
  ['/news', 'News'],
  ['/gallery', 'Gallery'],
  ['/sponsors', 'Sponsors'],
  ['/contact', 'Contact'],
]

export const programs = [
  { icon: Backpack, title: 'Sneakers', copy: 'Fresh kicks for students in need.' },
  { icon: School, title: 'School Supplies', copy: 'The tools youth need to start strong.' },
  { icon: Users, title: 'Community Connection', copy: 'Bringing people together for good.' },
  { icon: CircleDot, title: 'Games & Giveaways', copy: 'Fun, prizes, and surprises throughout the day.' },
  { icon: Music2, title: 'Live Event Energy', copy: 'Music, movement, and high-energy fun.' },
  { icon: HandHeart, title: 'Positive Impact', copy: 'Purpose-driven support, one step at a time.' },
]

export const pillars = [
  { icon: ShieldCheck, title: 'Youth confidence', copy: 'Building self-belief and empowering the next generation.' },
  { icon: Users, title: 'Community support', copy: 'Uniting local partners, families, and leaders to uplift youth.' },
  { icon: Backpack, title: 'Sneakers & supplies', copy: 'Providing essential gear and school supplies for a strong start.' },
  { icon: Sparkles, title: 'Purpose-driven impact', copy: 'Creating meaningful change that lasts beyond event day.' },
]

export const featuredGallery = [
  '/media/featured/dbj01060.jpg',
  '/media/featured/dbj01055.jpg',
  '/media/featured/dbj00942.jpg',
  '/media/featured/dbj00954.jpg',
  '/media/featured/dbj00915.jpg',
  '/media/featured/dbj01040.jpg',
  '/media/featured/community-2017.jpg',
  '/media/featured/community-art.jpg',
  '/media/featured/volunteers.jpg',
  '/media/featured/team.jpg',
  '/media/featured/dbj01028.jpg',
  '/media/featured/dbj01075.jpg',
]

const sponsorSheetLogos = sponsorSheetManifest.logos.map(({ file, name }) => [
  file,
  name,
  name === 'PDX Hip-Hop Week' ? 'dark' : 'light',
])

export const sponsorLogos = [
  ...sponsorSheetLogos,
  ['/media/sponsors/gatorade.png', 'Gatorade'],
  ['/media/sponsors/portland-friends.png', 'Friends of Portland'],
  ['/media/sponsors/rip-city-remix.png', 'Rip City Remix'],
  ['/media/sponsors/ix-brand-white.png', 'IX Brand'],
  ['/media/sponsors/pnw-flow-state.png', 'PNW Flow State'],
  ['/media/sponsors/us-marine-corps.png', 'United States Marine Corps'],
  ['/media/sponsors/throne-company-store.png', 'Throne Company Store', 'light'],
  ['/media/sponsors/cross-the-street.png', 'Cross the Street'],
  ['/media/sponsors/marmoset.png', 'Marmoset', 'light'],
  ['/media/sponsors/timberland.jpg', 'Timberland'],
  ['/media/sponsors/pb-payments.jpg', 'PB Payments'],
  ['/media/sponsors/lux-automaton.png', 'Lux Automaton'],
]

export const eventYears = [
  {
    year: '2026',
    label: 'Black + electric blue',
    className: 'event-year-2026',
    artwork: '/media/brand/event-2026-mark.png',
    description: 'The current annual event identity pairs a true-black foundation with electric blue and white.',
  },
  {
    year: '2025',
    label: 'Forest + lime',
    className: 'event-year-2025',
    artwork: '/media/brand/event-2025-motto.png',
    description: 'The 2025 event identity used forest green, high-energy lime, and white.',
  },
  {
    year: '2024',
    label: 'Black + yellow + white',
    className: 'event-year-2024',
    artwork: '/media/brand/event-2024-mark.png',
    description: 'The 2024 event identity carried the organization’s black, yellow, and white foundation.',
  },
]
