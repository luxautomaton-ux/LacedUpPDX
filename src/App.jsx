import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom'
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LockKeyhole,
  Mail,
  Menu,
  Quote,
  X,
} from 'lucide-react'
import {
  DONATE_URL,
  EMAIL,
  SOCIAL_LINKS,
  eventYears,
  navItems,
  pillars,
  sponsorLogos,
} from './content'
import {
  archiveGraphics,
  archivePhotos,
  archiveVideos,
} from './mediaCatalog'
import { submitContactInquiry, submitSneakerListRequest, submitSponsorInterest, submitSubscription, submitVolunteerInterest } from './bridge'
import { StudioContentProvider, useStudioContent } from './StudioContent'
import { siteAsset } from './sitePaths'

const heroImage = '/media/featured/dbj01060.jpg'
const studioAdminUrl = import.meta.env.VITE_STUDIO_ADMIN_URL || 'http://127.0.0.1:4177/admin/'

function useReveal() {
  useEffect(() => {
    const observed = new WeakSet()
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
      { threshold: 0.12 },
    )
    const observeReveals = (root = document) => {
      const nodes = root.matches?.('[data-reveal]') ? [root] : root.querySelectorAll?.('[data-reveal]') || []
      nodes.forEach((node) => {
        if (observed.has(node)) return
        observed.add(node)
        observer.observe(node)
      })
    }
    observeReveals()
    const mutationObserver = new window.MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node.nodeType === window.Node.ELEMENT_NODE) observeReveals(node)
    })))
    mutationObserver.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [])
}

function ScrollManager() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="Laced Up PDX home">
        <img src={siteAsset('/media/brand/laced-up-wordmark.png')} alt="Laced Up PDX" />
      </Link>
      <nav className={`main-nav ${open ? 'is-open' : ''}`} aria-label="Primary navigation">
        {navItems.map(([to, label]) => (
          <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>
            {label}
          </NavLink>
        ))}
      </nav>
      <a className="button button-yellow header-donate" href={DONATE_URL} target="_blank" rel="noreferrer">
        Donate <ExternalLink size={15} aria-hidden="true" />
      </a>
      <button className="menu-toggle" type="button" aria-expanded={open} aria-label="Toggle navigation" onClick={() => setOpen(!open)}>
        {open ? <X /> : <Menu />}
      </button>
    </header>
  )
}

function NewsletterSignupForm({ compact = false }) {
  const [submitState, setSubmitState] = useState('idle')
  const onSubscribe = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    setSubmitState('submitting')
    try {
      await submitSubscription(Object.fromEntries(new window.FormData(form)))
      form.reset()
      setSubmitState('success')
    } catch {
      setSubmitState('error')
    }
  }
  const statusClass = compact ? 'footer-form-status' : 'newsletter-signup-status'
  return <>
    <form className={compact ? 'subscribe-form' : 'newsletter-signup-form'} onSubmit={onSubscribe} aria-busy={submitState === 'submitting'}>
      <label className="bot-field" aria-hidden="true">Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
      {!compact ? <label><span>First name</span><input name="name" type="text" autoComplete="given-name" placeholder="Your name" required /></label> : null}
      <label><span className={compact ? 'sr-only' : ''}>Email address</span><input name="email" type="email" autoComplete="email" placeholder="Email address" required /></label>
      <button type="submit" aria-label={compact ? 'Join the email list' : undefined} disabled={submitState === 'submitting'}>{compact ? <ArrowRight size={18} /> : <>{submitState === 'submitting' ? 'Joining…' : 'Join the newsletter'} <ArrowRight size={18} /></>}</button>
    </form>
    <div className={`${statusClass} ${submitState === 'success' ? 'success' : submitState === 'error' ? 'error' : ''}`} aria-live="polite">
      {submitState === 'success' ? <p role="status">You’re on the list. Your signup is saved with the Laced Up team.</p> : null}
      {submitState === 'error' ? <p role="status">We couldn’t save your signup. Email <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p> : null}
    </div>
  </>
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <img src={siteAsset('/media/brand/laced-up-stacked.png')} alt="Laced Up PDX" />
        <div>
          <p className="eyebrow">Changing the culture of giving</p>
          <h2>One sneaker at a time.</h2>
        </div>
        <Link className="button button-yellow" to="/support-us">Support the movement</Link>
      </div>
      <div className="footer-grid">
        <div>
          <h3>Explore</h3>
          {navItems.slice(1).map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
        </div>
        <div>
          <h3>Connect</h3>
          <a href={`mailto:${EMAIL}`}><Mail size={16} /> {EMAIL}</a>
          <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer"><span className="social-glyph" aria-hidden="true">IG</span> Instagram</a>
          <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noreferrer"><span className="social-glyph" aria-hidden="true">f</span> Facebook</a>
          <a href="https://www.youtube.com/watch?v=SIZPV1NhB4E" target="_blank" rel="noreferrer"><span className="social-glyph" aria-hidden="true">▶</span> YouTube</a>
          <a href={studioAdminUrl} target="_blank" rel="noreferrer"><LockKeyhole size={16} /> Admin / Studio</a>
        </div>
        <div>
          <h3>Stay in step</h3>
          <p>Get event news and community updates.</p>
          <NewsletterSignupForm compact />
          <small className="local-form-note">Form delivery requires the hosted Studio service.</small>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Laced Up PDX</span>
        <span>Created by <strong>Lux Automaton</strong></span>
      </div>
    </footer>
  )
}

function StudioAnnouncement() {
  const { site } = useStudioContent()
  const announcement = site?.announcement

  if (!announcement?.enabled || !announcement.text) return null
  const requestedLink = announcement.ctaUrl || '/get-involved'
  const safeLink = requestedLink.startsWith('/') && !requestedLink.startsWith('//') || requestedLink.startsWith('https://') ? requestedLink : '/get-involved'
  const label = announcement.ctaLabel || 'Get involved'

  return (
    <aside className="studio-announcement" aria-label="Laced Up PDX announcement">
      <p>{announcement.text}</p>
      {safeLink.startsWith('/') ? <Link to={safeLink}>{label} <ArrowRight /></Link> : <a href={safeLink} target="_blank" rel="noreferrer">{label} <ExternalLink /></a>}
    </aside>
  )
}

function Layout({ children }) {
  useReveal()
  return <><ScrollManager /><Header /><StudioAnnouncement /><main id="main-content">{children}</main><Footer /></>
}

function Hero() {
  const { pages } = useStudioContent()
  const page = pages.find((item) => item.path === '/')
  const imageRef = useRef(null)
  useEffect(() => {
    const onScroll = () => {
      if (imageRef.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        imageRef.current.style.setProperty('--hero-shift', `${Math.min(window.scrollY * 0.08, 44)}px`)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <section className="hero">
      <div className="hero-photo" ref={imageRef} style={{ backgroundImage: `url('${siteAsset(page?.image || heroImage)}')` }} aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />
      <div className="hero-content">
        <p className="eyebrow hero-kicker"><span>{page?.eyebrow || 'Portland, Oregon'}</span></p>
        <h1>{page?.heroTitle || 'Changing the culture of giving.'}</h1>
        <p className="hero-script">{page?.accent || 'One sneaker at a time.'}</p>
        <p className="hero-copy">{page?.summary || 'Laced Up PDX empowers youth to move through life with confidence through intentionally placed resources, experiences, and community.'}</p>
        <div className="hero-actions">
          <a className="button button-yellow" href={DONATE_URL} target="_blank" rel="noreferrer">Support the movement <ArrowRight /></a>
          <Link className="button button-outline" to="/get-involved">Get involved</Link>
        </div>
      </div>
      <a className="scroll-cue" href="#mission"><span>Discover the movement</span><ArrowDown /></a>
      <div className="hero-number" aria-hidden="true">09</div>
    </section>
  )
}

function MissionBand() {
  return (
    <section id="mission" className="mission-band" data-reveal>
      <div className="section-index">01</div>
      <div>
        <p className="eyebrow">Our mission</p>
        <h2>Purpose. Community. <span>Impact.</span></h2>
      </div>
      <p>Laced Up PDX empowers youth to move through life with confidence by providing intentionally placed resources and experiences—changing the culture of giving through purpose, community, and impact.</p>
      <Link className="circle-link" to="/our-story" aria-label="Read our story"><ArrowRight /></Link>
    </section>
  )
}

function HomeFilm() {
  return (
    <section className="home-film section" aria-labelledby="home-film-title">
      <div className="home-film-heading" data-reveal>
        <div>
          <p className="eyebrow">The Laced Up experience</p>
          <h2 id="home-film-title">See the movement <span>in motion.</span></h2>
        </div>
        <p>Press play for a look inside the energy, people, and purpose that power Laced Up PDX.</p>
      </div>
      <figure className="home-film-frame" data-reveal>
        <video
          controls
          playsInline
          preload="metadata"
          poster={siteAsset('/media/home/laced-up-pdx-ad-poster.jpg')}
          aria-label="Laced Up PDX community experience video"
        >
          <source src={siteAsset('/media/home/laced-up-pdx-ad.mp4')} type="video/mp4" />
          Your browser does not support embedded video.
        </video>
        <figcaption><span>01:49</span> Laced Up PDX — changing the culture of giving.</figcaption>
      </figure>
    </section>
  )
}

function ProgramsSection({ limit = 6 }) {
  const { programs } = useStudioContent()
  return (
    <section className="section section-light programs-section">
      <div className="section-heading" data-reveal>
        <div><p className="eyebrow dark">What to expect</p><h2>Programs &{' '}<br /><span>experiences.</span></h2></div>
        <p>A purpose-driven experience for youth, families, and the Portland community.</p>
      </div>
      <div className="program-list">
        {programs.slice(0, limit).map(({ icon: Icon, title, copy }, index) => (
          <article className="program-row" key={title} data-reveal>
            <span className="program-number">0{index + 1}</span><Icon aria-hidden="true" />
            <h3>{title}</h3><p>{copy}</p><ArrowRight className="row-arrow" aria-hidden="true" />
          </article>
        ))}
      </div>
    </section>
  )
}

function ImpactBand() {
  return (
    <section className="impact-band">
      <div className="impact-copy" data-reveal>
        <p className="eyebrow">Community in motion</p>
        <h2>Fresh gear.{' '}<br />Real connection.{' '}<br /><span>Lasting confidence.</span></h2>
        <Link className="text-link yellow" to="/gallery">See the community <ArrowRight /></Link>
      </div>
      <div className="impact-collage" data-reveal>
        <figure className="impact-main"><img src={siteAsset('/media/featured/dbj00954.jpg')} alt="Laced Up PDX event participants" /></figure>
        <figure className="impact-side"><img src={siteAsset('/media/featured/dbj00942.jpg')} alt="Community member at a Laced Up PDX event" /></figure>
        <div className="impact-mark"><img src={siteAsset('/media/brand/laced-up-icon.png')} alt="" /></div>
      </div>
    </section>
  )
}

function StoryLink({ item, className, children }) {
  if (item.href?.startsWith('/')) return <Link className={className} to={item.href} data-reveal>{children}</Link>
  return <a className={className} href={item.href} target="_blank" rel="noreferrer" data-reveal>{children}</a>
}

function NewsSection() {
  const { posts } = useStudioContent()
  return (
    <section className="section news-section">
      <div className="section-heading compact" data-reveal>
        <div><p className="eyebrow">From the movement</p><h2>Latest <span>news.</span></h2></div>
        <Link className="text-link yellow" to="/news">View all news <ArrowRight /></Link>
      </div>
      <div className="news-grid">
        {posts.slice(0, 3).map((item, index) => (
          <StoryLink className={`news-card ${index === 0 ? 'featured' : ''}`} item={item} key={item.id || item.title}>
            <div className="news-image"><img src={siteAsset(item.image)} alt="" /></div>
            <p className="eyebrow"><CalendarDays /> {item.date}</p>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
            <span className="text-link yellow">Read story {item.href?.startsWith('/') ? <ArrowRight /> : <ExternalLink />}</span>
          </StoryLink>
        ))}
      </div>
    </section>
  )
}

function NewsletterSection() {
  return (
    <section className="newsletter-signup-section" aria-labelledby="newsletter-signup-title" data-reveal>
      <div className="newsletter-signup-visual">
        <img className="newsletter-signup-photo" src={siteAsset('/media/featured/team.jpg')} alt="Laced Up PDX community gathered at an event" />
        <div className="newsletter-signup-visual-copy">
          <img src={siteAsset('/media/brand/laced-up-icon.png')} alt="" />
          <h2 id="newsletter-signup-title">Stay close to the movement.</h2>
        </div>
      </div>
      <div className="newsletter-signup-copy">
        <p className="eyebrow">Stay in step</p>
        <h3>Be first to know what’s next.</h3>
        <p>Get event announcements, volunteer opportunities, and stories from across the Laced Up PDX community.</p>
        <NewsletterSignupForm />
        <small>Signups are saved when the secure hosted Studio service is connected. Until then, contact the Laced Up team by email.</small>
      </div>
    </section>
  )
}

function SponsorRail() {
  const featuredSponsors = sponsorLogos.filter(([, name]) => name !== 'Laced Up PDX').slice(0, 18)
  const items = [...featuredSponsors, ...featuredSponsors]
  return (
    <section className="sponsor-rail" aria-label="Community sponsors">
      <p className="eyebrow">Powered by community partners</p>
      <div className="marquee-mask">
        <div className="marquee-track">
          {items.map(([src, name, tone = 'dark'], i) => <div className={`sponsor-cell sponsor-tone-${tone}`} key={`${name}-${i}`}><img src={siteAsset(src)} alt={i >= featuredSponsors.length ? '' : name} /></div>)}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="cta-section" data-reveal>
      <div><p className="eyebrow dark">Show up. Lace up.</p><h2>Help make the{' '}<br />next event <span>unforgettable.</span></h2></div>
      <div><p>Volunteer, sponsor an experience, donate, or help connect more Portland youth with the resources they deserve.</p><div className="cta-actions"><Link className="button button-black" to="/get-involved">Get involved <ArrowRight /></Link><a className="button button-clear" href={DONATE_URL} target="_blank" rel="noreferrer">Donate now</a></div></div>
    </section>
  )
}

function HomePage() {
  return <Layout><Hero /><MissionBand /><HomeFilm /><ProgramsSection /><ImpactBand /><NewsSection /><NewsletterSection /><SponsorRail /><CTASection /></Layout>
}

function PageHero({ eyebrow, title, accent, image = heroImage, children }) {
  const { pathname } = useLocation()
  const { pages } = useStudioContent()
  const managed = pages.find((page) => page.path === pathname)
  return (
    <section className="page-hero">
      <div className="page-hero-image" style={{ backgroundImage: `url('${siteAsset(managed?.image || image)}')` }} />
      <div className="page-hero-content" data-reveal>
        <p className="eyebrow">{managed?.eyebrow || eyebrow}</p>
        <h1>{managed?.heroTitle || title}{' '}<br /><span>{managed?.accent || accent}</span></h1>
        {managed?.summary ? <p>{managed.summary}</p> : children}
      </div>
    </section>
  )
}

function StoryPage() {
  return (
    <Layout>
      <PageHero eyebrow="Who we are" title="Built on community." accent="Driven by impact." image="/media/featured/community-2017.jpg">
        <p>Changing the culture of giving through intentionally placed resources, memorable experiences, and people who show up.</p>
      </PageHero>
      <section className="story-editorial section section-light">
        <div className="story-quote" data-reveal><Quote /><p>We envision every child having the best learning opportunities possible, beginning with the tools they need to succeed in the classroom.</p></div>
        <div className="story-copy" data-reveal><p className="eyebrow dark">The movement</p><h2>More than a pair{' '}<br />of <span>sneakers.</span></h2><p>Laced Up PDX brings youth, families, volunteers, local leaders, and community partners into one high-energy space. The resources matter. So does the way they are given—with care, dignity, and an experience built to last.</p><p>Each event is designed to help young people step forward with confidence and feel the power of a community standing behind them.</p></div>
      </section>
      <section className="story-film section">
        <div className="story-film-copy" data-reveal>
          <p className="eyebrow">Our story in motion</p>
          <h2>Belief, made <span>visible.</span></h2>
          <p>A closer look at the people, purpose, and moments behind Laced Up PDX—where a pair of sneakers becomes a reminder that someone believes in you.</p>
          <div className="story-film-details"><span><strong>02:08</strong> Community film</span><span><strong>Portland</strong> Oregon</span></div>
          <Link className="button button-yellow" to="/get-involved">Be part of the next story <ArrowRight /></Link>
        </div>
        <figure className="story-film-figure" data-reveal>
          <div className="story-film-frame">
            <video controls playsInline preload="metadata" poster={siteAsset('/media/video/lacedup-our-story-poster.jpg')} aria-label="Watch the Laced Up PDX community story">
              <source src={siteAsset('/media/video/lacedup-our-story.mp4')} type="video/mp4" />
              Your browser does not support embedded video.
            </video>
          </div>
          <figcaption><strong>Someone believes in you.</strong><span>Turn on sound to experience the full story.</span></figcaption>
        </figure>
      </section>
      <section className="pillars-section section">
        <div className="section-heading compact" data-reveal><div><p className="eyebrow">What guides us</p><h2>Purpose in <span>every step.</span></h2></div></div>
        <div className="pillars-grid">{pillars.map(({ icon: Icon, title, copy }) => <article key={title} data-reveal><Icon /><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>
      <ImpactBand /><CTASection />
    </Layout>
  )
}

function ProgramsPage() {
  return (
    <Layout>
      <PageHero eyebrow="Programs & experiences" title="Resources that move" accent="youth forward." image="/media/featured/dbj01055.jpg"><p>Sneakers, supplies, connection, and event-day energy—all intentionally placed.</p></PageHero>
      <ProgramsSection />
      <section className="experience-flow section">
        <div className="section-heading" data-reveal><div><p className="eyebrow">The experience</p><h2>Every detail has{' '}<br /><span>a purpose.</span></h2></div><p>From the welcome at the door to the moment a young person leaves with fresh gear, the day is built around belonging.</p></div>
        <div className="flow-grid">
          {['Welcome & connection', 'Choice & confidence', 'Celebration & community'].map((title, i) => <article key={title} data-reveal><span>0{i + 1}</span><h3>{title}</h3><p>{['Youth and families enter a space designed to feel energetic, safe, and welcoming.','Resources are given with dignity, helping each young person step into the school year ready.','Music, games, partners, and volunteers turn support into a shared community experience.'][i]}</p></article>)}
        </div>
      </section>
      <CTASection />
    </Layout>
  )
}

function EventsPage() {
  const { events } = useStudioContent()
  return (
    <Layout>
      <PageHero eyebrow="Annual event archive" title="One mission." accent="A new energy every year." image="/media/featured/dbj01060.jpg"><p>The organization stays rooted in black, yellow, and white while each annual event receives its own visual identity.</p></PageHero>
      <section className="event-archive section section-light">
        <div className="section-heading" data-reveal><div><p className="eyebrow dark">Event identities</p><h2>Every year has{' '}<br /><span>its own colors.</span></h2></div><p>Annual palettes keep each gathering distinctive without changing the permanent Laced Up PDX brand.</p></div>
        <div className="event-year-grid">
          {eventYears.map((event) => <article className={`event-year-card ${event.className}`} key={event.year} data-reveal><div className="event-year-art"><img src={siteAsset(event.artwork)} alt={`${event.year} Laced Up PDX event artwork`} /></div><div><span>{event.year}</span><h3>{event.label}</h3><p>{event.description}</p></div></article>)}
        </div>
      </section>
      <section className="annual-event-feature section">
        <img src={siteAsset('/media/brand/august-22-campaign.png')} alt="Laced Up PDX August 22nd campaign artwork" loading="lazy" data-reveal />
        <div data-reveal><p className="eyebrow">2026 campaign</p><h2>It’s on <span>you.</span></h2><p>The current event artwork carries the 2026 black, blue, and white identity. Follow the official social channels for event updates and announcements.</p><div className="event-social-actions"><a className="button button-yellow" href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer">Instagram <ExternalLink /></a><a className="button button-outline" href={SOCIAL_LINKS.facebook} target="_blank" rel="noreferrer">Facebook <ExternalLink /></a></div></div>
      </section>
      <section className="event-records section section-light">
        <div className="section-heading compact" data-reveal><div><p className="eyebrow dark">Restored from Wix</p><h2>{events.length} event records <span>preserved.</span></h2></div><p>These completed event pages retain only supportable dates, descriptions, venues, and images. Unreliable template metadata is excluded.</p></div>
        <div className="event-record-grid">
          {events.map((event) => <Link className="event-record-card" to={`/events/${event.slug}`} key={event.id || event.slug} data-reveal><img src={siteAsset(event.image)} alt={`${event.title} event`} loading="lazy" /><div><p className="eyebrow dark">{event.date || 'Date unavailable in archive'}</p><h3>{event.title}</h3><p>{event.summary}</p><span>View restored event <ArrowRight /></span></div></Link>)}
        </div>
      </section>
      <CTASection />
    </Layout>
  )
}

function EventDetailPage() {
  const { slug } = useParams()
  const { events } = useStudioContent()
  const event = events.find((item) => item.slug === slug)
  if (!event) return <NotFound />
  const paragraphs = (event.description || event.summary || '').split(/\n{2,}/).filter(Boolean)
  return <Layout>
    <PageHero eyebrow={event.date || 'Archived event'} title={event.title} accent="Laced Up PDX." image={event.image}><p>{event.summary}</p></PageHero>
    <article className="event-detail section section-light" data-reveal>
      <aside>
        <p className="eyebrow dark">Event details</p>
        <dl>
          <div><dt>Date</dt><dd>{event.date || 'Unavailable in archive'}</dd></div>
          {event.time ? <div><dt>Time</dt><dd>{event.time}</dd></div> : null}
          {event.venue ? <div><dt>Venue</dt><dd>{event.venue}</dd></div> : null}
          <div><dt>Registration</dt><dd>{event.registrationStatus || 'Archived'}</dd></div>
        </dl>
      </aside>
      <div>
        {event.archiveMetadataNote ? <aside className="archive-note"><p className="eyebrow dark">Archive note</p><p>{event.archiveMetadataNote}</p></aside> : null}
        {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <Link className="text-link" to="/events">Back to all events <ArrowRight /></Link>
      </div>
    </article>
    <CTASection />
  </Layout>
}

function FormFeedback({ state, success }) {
  if (state === 'success') return <p className="form-status success" role="status" aria-live="polite">{success}</p>
  if (state === 'error') return <p className="form-status error" role="status" aria-live="polite">LacedUp Studio is offline, so nothing was sent. Please email <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>
  return null
}

function ContactPage() {
  const [submitState, setSubmitState] = useState('idle')
  const onSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    setSubmitState('submitting')
    try {
      await submitContactInquiry(Object.fromEntries(new window.FormData(form)))
      form.reset()
      setSubmitState('success')
    } catch {
      setSubmitState('error')
    }
  }
  return <Layout>
    <PageHero eyebrow="Connect with us today" title="Let’s build" accent="the next step." image="/media/featured/community-2017.jpg"><p>Ask about the next back-to-school event, explore a partnership, or connect with the Laced Up PDX team.</p></PageHero>
    <section className="involve-section section section-light">
      <div className="involve-copy" data-reveal><p className="eyebrow dark">Contact Laced Up PDX</p><h2>Start a <span>conversation.</span></h2><p>Use this form for event, partnership, donation, media, and general questions. During this local preview, the message is saved directly to the Forms inbox in LacedUp Studio.</p><p><a className="text-link" href={`mailto:${EMAIL}`}>{EMAIL} <Mail /></a></p></div>
      <form className="interest-form" onSubmit={onSubmit} data-reveal>
        <label className="bot-field" aria-hidden="true">Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
        <label>Name<input required name="name" autoComplete="name" /></label>
        <label>Email<input required type="email" name="email" autoComplete="email" /></label>
        <label>Subject<input name="subject" /></label>
        <label>Phone <span>(optional)</span><input type="tel" name="phone" autoComplete="tel" /></label>
        <label>Message <span>(optional)</span><textarea name="message" rows="5" /></label>
        <button className="button button-black" type="submit" disabled={submitState === 'submitting'}>{submitState === 'submitting' ? 'Saving to Studio…' : 'Send message'} <ArrowRight /></button>
        <FormFeedback state={submitState} success="Message received in LacedUp Studio. The team can now review it in Forms." />
      </form>
    </section>
  </Layout>
}

function SneakerListPage() {
  const [submitState, setSubmitState] = useState('idle')
  const onSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    setSubmitState('submitting')
    try {
      await submitSneakerListRequest(Object.fromEntries(new window.FormData(form)))
      form.reset()
      setSubmitState('success')
    } catch {
      setSubmitState('error')
    }
  }
  return <Layout>
    <PageHero eyebrow="Youth registration request" title="Request a spot" accent="on the sneaker list." image="/media/featured/dbj01055.jpg"><p>Share guardian contact details and youth sizing information for Laced Up PDX team review.</p></PageHero>
    <section className="involve-section section section-light sneaker-list-section">
      <div className="involve-copy" data-reveal><p className="eyebrow dark">Before you submit</p><h2>Dignity, fit, and <span>family presence.</span></h2><p>The current signup process reserves the primary list for privately referred families and offers 50 general-public lottery spots. A request is not a confirmation or guarantee.</p><ul><li><Check /> A parent or guardian must attend, stay, and check in with the child.</li><li><Check /> Sneakers are purchased for each selected child and picked up on event day.</li><li><Check /> The team follows up only after reviewing the request.</li></ul><aside className="archive-note"><p className="eyebrow dark">Local preview privacy</p><p>This form currently stores guardian and child information only in the local, Git-ignored LacedUp Studio data file. Production hosting, secure delivery, spam controls, retention, and access policy still need launch configuration.</p></aside></div>
      <form className="interest-form" onSubmit={onSubmit} data-reveal>
        <label className="bot-field" aria-hidden="true">Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
        <div className="field-row"><label>Parent first name<input required name="parentFirstName" autoComplete="given-name" /></label><label>Parent last name<input required name="parentLastName" autoComplete="family-name" /></label></div>
        <label>Email<input required type="email" name="email" autoComplete="email" /></label>
        <label>Phone<input required type="tel" name="phone" autoComplete="tel" /></label>
        <label>Child name<input required name="childName" autoComplete="off" /></label>
        <div className="field-row"><label>Child age<input required name="childAge" inputMode="numeric" /></label><label>Shoe size<input required name="shoeSize" /></label></div>
        <label>T-shirt size<input required name="shirtSize" /></label>
        <label className="checkbox-field"><input required type="checkbox" name="termsAccepted" /><span>I understand that a guardian must remain with the child and that submitting this request does not guarantee selection.</span></label>
        <label>Family story or context <span>(optional)</span><textarea name="message" rows="4" /></label>
        <button className="button button-black" type="submit" disabled={submitState === 'submitting'}>{submitState === 'submitting' ? 'Saving request…' : 'Request team review'} <ArrowRight /></button>
        <FormFeedback state={submitState} success="Request received in LacedUp Studio for team review. This is not a placement confirmation." />
      </form>
    </section>
  </Layout>
}

function SupportPage() {
  return <Layout>
    <PageHero eyebrow="Support the movement" title="Put generosity" accent="into motion." image="/media/featured/team.jpg"><p>Give time, sneakers, resources, or financial support to help Laced Up PDX show up for youth and families.</p></PageHero>
    <section className="support-grid section section-light">
      <article data-reveal><span>01</span><h2>Volunteer</h2><p>Bring your time and energy to event setup, family welcome, partnership support, media, and more.</p><Link className="button button-black" to="/get-involved">Volunteer interest <ArrowRight /></Link></article>
      <article data-reveal><span>02</span><h2>Donate sneakers</h2><p>Coordinate an approved sneaker drop-off directly with the Laced Up PDX team.</p><a className="button button-black" href={`mailto:${EMAIL}?subject=Sneaker donation drop-off`}>Arrange a drop-off <Mail /></a></article>
      <article data-reveal><span>03</span><h2>Give online</h2><p>Use the organization’s preserved Stripe checkout for a financial contribution.</p><a className="button button-black" href={DONATE_URL} target="_blank" rel="noreferrer">Donate securely <ExternalLink /></a></article>
      <article data-reveal><span>04</span><h2>Cash or check</h2><p>Contact the team before delivering a cash or check contribution so it can be coordinated and recorded.</p><a className="button button-black" href={`mailto:${EMAIL}?subject=Cash or check contribution`}>Contact the team <Mail /></a></article>
    </section>
    <CTASection />
  </Layout>
}

function GetInvolvedPage() {
  const [submitState, setSubmitState] = useState('idle')
  const onSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const fields = Object.fromEntries(new window.FormData(form))
    setSubmitState('submitting')
    try {
      await submitVolunteerInterest(fields)
      form.reset()
      setSubmitState('success')
    } catch {
      setSubmitState('error')
    }
  }
  return (
    <Layout>
      <PageHero eyebrow="Join the movement" title="Your time can" accent="change a step." image="/media/featured/volunteers.jpg"><p>Volunteer, become a community partner, or help power the next Laced Up PDX experience.</p></PageHero>
      <section className="involve-section section section-light">
        <div className="involve-copy" data-reveal><p className="eyebrow dark">Volunteer interest</p><h2>Bring your energy.{' '}<br /><span>We’ll bring the mission.</span></h2><p>Tell the team how you would like to help. During this local preview, your application goes directly into LacedUp Studio for the team to review. Secure Hostinger production delivery will be connected during launch setup.</p><ul><li><Check /> Event setup and support</li><li><Check /> Youth and family welcome</li><li><Check /> Sponsor and community partnerships</li><li><Check /> Photography, media, and event energy</li></ul></div>
        <form className="interest-form" onSubmit={onSubmit} data-reveal>
          <label className="bot-field" aria-hidden="true">Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
          <div className="field-row"><label>First name<input required name="firstName" autoComplete="given-name" /></label><label>Last name<input required name="lastName" autoComplete="family-name" /></label></div>
          <label>Email<input required type="email" name="email" autoComplete="email" /></label>
          <label>Phone <span>(optional)</span><input type="tel" name="phone" autoComplete="tel" /></label>
          <label>I want to help with<select name="interest" defaultValue=""><option value="" disabled>Select one</option><option>Event volunteering</option><option>Community partnership</option><option>Sponsorship</option><option>Media and photography</option><option>Something else</option></select></label>
          <label>Message<textarea name="message" rows="4" /></label>
          <button className="button button-black" type="submit" disabled={submitState === 'submitting'}>{submitState === 'submitting' ? 'Sending to Studio…' : 'Send interest'} <ArrowRight /></button>
          {submitState === 'success' ? <p className="form-status success" role="status" aria-live="polite">Application received in LacedUp Studio. Thank you for stepping up—we’ll be in touch.</p> : null}
          {submitState === 'error' ? <p className="form-status error" role="status" aria-live="polite">LacedUp Studio is offline, so this form was not sent. Please email <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p> : null}
        </form>
      </section>
      <section className="split-cta"><div><p className="eyebrow">Prefer a direct note?</p><h2>Talk with the team.</h2><a className="text-link yellow" href={`mailto:${EMAIL}`}>{EMAIL} <ArrowRight /></a></div><div><p className="eyebrow dark">Ready to give?</p><h2>Support the movement.</h2><a className="button button-black" href={DONATE_URL} target="_blank" rel="noreferrer">Donate securely <ExternalLink /></a></div></section>
    </Layout>
  )
}

function NewsPage() {
  const { posts } = useStudioContent()
  return (
    <Layout>
      <PageHero eyebrow="News & updates" title="Keep up with" accent="the movement." image="/media/featured/dbj01028.jpg"><p>Event announcements, community milestones, and stories from Laced Up PDX.</p></PageHero>
      <section className="section news-archive">
        <div className="news-archive-grid">{posts.map((item, i) => <StoryLink className="news-archive-card" item={item} key={item.id || item.title}><div className="news-archive-image"><img src={siteAsset(item.image)} alt="" loading={i < 3 ? 'eager' : 'lazy'} /></div><div className="news-archive-copy"><span>{String(i + 1).padStart(2, '0')}</span><p className="eyebrow"><CalendarDays /> {item.date}</p><h2>{item.title}</h2><p>{item.copy}</p><strong>Read full story <ArrowRight /></strong></div></StoryLink>)}</div>
      </section>
      <CTASection />
    </Layout>
  )
}

function BlogPostPage() {
  const { slug } = useParams()
  const { posts } = useStudioContent()
  const post = posts.find((item) => item.slug === slug && item.href?.startsWith('/'))
  if (!post) return <NotFound />
  return <Layout>
    <PageHero eyebrow={post.date || 'From the movement'} title={post.title} accent="Laced Up PDX." image={post.image}><p>{post.excerpt}</p></PageHero>
    <article className="managed-story section section-light" data-reveal>
      <div><p className="eyebrow dark">Published from LacedUp Studio</p>{post.author ? <p>By {post.author}</p> : null}</div>
      <div>
        {post.archiveSummaryOnly ? <aside className="archive-note"><p className="eyebrow dark">Restored archive entry</p><p>Wix no longer exposes the complete article text for this legacy post. This local copy preserves the original title, publish date, public summary, and cover photo.</p></aside> : null}
        {post.video ? <video className="managed-story-video" controls preload="metadata" poster={siteAsset(post.image)}><source src={siteAsset(post.video)} />Your browser does not support embedded video.</video> : null}
        {(post.body || post.copy || '').split(/\n{2,}/).filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {post.archiveEmpty ? <p>No public article summary was included with this archived post.</p> : null}
      </div>
      <Link className="text-link" to="/news">Back to all news <ArrowRight /></Link>
    </article>
    <CTASection />
  </Layout>
}

function GalleryPage() {
  const [selected, setSelected] = useState(null)
  const [mediaType, setMediaType] = useState('photos')
  const [visible, setVisible] = useState(24)
  const mediaSets = useMemo(() => ({ photos: archivePhotos, graphics: archiveGraphics, videos: archiveVideos }), [])
  const currentMedia = mediaSets[mediaType]
  const items = useMemo(() => currentMedia.slice(0, visible), [currentMedia, visible])
  const switchMedia = (type) => {
    setMediaType(type)
    setVisible(24)
    setSelected(null)
  }
  useEffect(() => {
    if (selected === null) return undefined
    const onKey = (e) => { if (e.key === 'Escape') setSelected(null); if (e.key === 'ArrowRight') setSelected((selected + 1) % items.length); if (e.key === 'ArrowLeft') setSelected((selected - 1 + items.length) % items.length) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, items.length])
  return (
    <Layout>
      <PageHero eyebrow="Community gallery" title="This is what" accent="showing up looks like." image="/media/featured/dbj00915.jpg"><p>Real people, real events, and moments from across the Laced Up PDX archive.</p></PageHero>
      <section className="gallery-section section section-light">
        <div className="media-tabs" role="tablist" aria-label="Media archive categories" data-reveal>
          {[['photos', 'Photos', archivePhotos.length], ['graphics', 'Graphics', archiveGraphics.length], ['videos', 'Video', archiveVideos.length]].map(([type, label, count]) => <button type="button" role="tab" aria-selected={mediaType === type} className={mediaType === type ? 'active' : ''} onClick={() => switchMedia(type)} key={type}>{label}<span>{count}</span></button>)}
        </div>
        {mediaType === 'videos' ? <div className="video-gallery">{items.map((item) => <figure key={item.id} data-reveal><video controls preload="metadata" poster={siteAsset('/media/featured/dbj01060.jpg')}><source src={item.src} type="video/mp4" />Your browser does not support embedded video.</video><figcaption>{item.name}</figcaption></figure>)}</div> : <div className={`masonry-gallery ${mediaType === 'graphics' ? 'graphics-gallery' : ''}`}>{items.map((item, i) => <button type="button" onClick={() => setSelected(i)} key={item.id} data-reveal aria-label={`Open ${mediaType.slice(0, -1)} ${i + 1}: ${item.name}`}><img src={item.src} alt={`Laced Up PDX ${mediaType.slice(0, -1)} ${i + 1}`} loading="lazy" /><span>{item.name}</span></button>)}</div>}
        <div className="media-progress" aria-live="polite"><span>Showing {items.length} of {currentMedia.length} {mediaType}</span>{visible < currentMedia.length ? <div><button className="button button-black load-more" type="button" onClick={() => setVisible((count) => Math.min(count + 24, currentMedia.length))}>Load 24 more</button><button className="text-link" type="button" onClick={() => setVisible(currentMedia.length)}>Show all</button></div> : null}</div>
      </section>
      {selected !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Gallery image viewer"><button className="lightbox-close" onClick={() => setSelected(null)} aria-label="Close"><X /></button><button onClick={() => setSelected((selected - 1 + items.length) % items.length)} aria-label="Previous image"><ChevronLeft /></button><figure><img src={items[selected].src} alt={`Laced Up PDX gallery image ${selected + 1}`} /><figcaption>{items[selected].name}</figcaption></figure><button onClick={() => setSelected((selected + 1) % items.length)} aria-label="Next image"><ChevronRight /></button></div>}
    </Layout>
  )
}

function SponsorsPage() {
  const [submitState, setSubmitState] = useState('idle')
  const onSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    setSubmitState('submitting')
    try {
      await submitSponsorInterest(Object.fromEntries(new window.FormData(form)))
      form.reset()
      setSubmitState('success')
    } catch {
      setSubmitState('error')
    }
  }
  return (
    <Layout>
      <PageHero eyebrow="Community partners" title="Powered by people" accent="who believe." image="/media/featured/team.jpg"><p>Thank you to the sponsors, organizations, and neighbors helping Laced Up PDX make a difference.</p></PageHero>
      <section className="sponsors-page section">
        <div className="section-heading compact" data-reveal><div><p className="eyebrow">Thank you</p><h2>Community makes{' '}<br /><span>this possible.</span></h2></div><p>Every partner adds reach, resources, expertise, or energy to the movement.</p></div>
        <div className="sponsor-grid">{sponsorLogos.map(([src, name, tone = 'dark'], i) => <article className={`sponsor-tone-${tone}`} key={name} data-sponsor-name={name} data-reveal><span>{String(i + 1).padStart(2, '0')}</span><img src={siteAsset(src)} alt={name} loading="lazy" decoding="async" /><h3>{name}</h3></article>)}</div>
      </section>
      <section className="partner-cta partner-form-section" id="partner-with-us" data-reveal>
        <div><p className="eyebrow dark">Partner with Laced Up PDX</p><h2>Put your support{' '}<br />into motion.</h2><p>Bring resources, expertise, volunteers, or event support to the next community experience. Hosted form delivery activates when the secure Studio service is connected.</p></div>
        <form className="interest-form sponsor-interest-form" onSubmit={onSubmit}>
          <label className="bot-field" aria-hidden="true">Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
          <label>Contact name<input required name="name" autoComplete="name" /></label>
          <label>Organization<input required name="organization" autoComplete="organization" /></label>
          <div className="field-row"><label>Email<input required type="email" name="email" autoComplete="email" /></label><label>Phone <span>(optional)</span><input type="tel" name="phone" autoComplete="tel" /></label></div>
          <label>How would you like to partner?<select required name="partnershipType" defaultValue=""><option value="" disabled>Select one</option><option>Event sponsorship</option><option>In-kind goods or services</option><option>Employee volunteers</option><option>Community partnership</option><option>Media partnership</option><option>Something else</option></select></label>
          <label>Partnership idea <span>(optional)</span><textarea name="message" rows="4" /></label>
          <button className="button button-black" type="submit" disabled={submitState === 'submitting'}>{submitState === 'submitting' ? 'Saving to Studio…' : 'Send sponsor interest'} <ArrowRight /></button>
          <FormFeedback state={submitState} success="Sponsor request received in LacedUp Studio. The team can now review it in Forms." />
        </form>
      </section>
    </Layout>
  )
}

function ManagedPageOrNotFound() {
  const { pathname } = useLocation()
  const { pages } = useStudioContent()
  const page = pages.find((item) => item.path === pathname)
  if (!page) return <NotFound />
  return <Layout>
    <PageHero eyebrow={page.eyebrow || 'Laced Up PDX'} title={page.heroTitle || page.title} accent={page.accent || 'Community in motion.'} image={page.image}><p>{page.summary}</p></PageHero>
    <section className="managed-page section section-light" data-reveal><p className="eyebrow dark">Managed in LacedUp Studio</p><h2>{page.title}</h2><p>{page.summary}</p><Link className="button button-black" to="/get-involved">Get involved <ArrowRight /></Link></section>
    <CTASection />
  </Layout>
}

function NotFound() {
  return <Layout><section className="not-found"><img src={siteAsset('/media/brand/laced-up-icon.png')} alt="" /><p className="eyebrow">404 / Wrong turn</p><h1>This page came <span>unlaced.</span></h1><Link className="button button-yellow" to="/">Back home <ArrowRight /></Link></section></Layout>
}

export default function App() {
  return (
    <StudioContentProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/our-story" element={<StoryPage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:slug" element={<EventDetailPage />} />
        <Route path="/sign-up" element={<SneakerListPage />} />
        <Route path="/get-involved" element={<GetInvolvedPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:slug" element={<BlogPostPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/sponsors" element={<SponsorsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/support-us" element={<SupportPage />} />
        <Route path="/blog" element={<Navigate to="/news" replace />} />
        <Route path="/who-we-are" element={<Navigate to="/our-story" replace />} />
        <Route path="/copy-of-sign-up-child" element={<Navigate to="/get-involved" replace />} />
        <Route path="*" element={<ManagedPageOrNotFound />} />
      </Routes>
    </StudioContentProvider>
  )
}
