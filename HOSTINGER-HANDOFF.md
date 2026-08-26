# Hostinger + WordPress handoff

## Recommended launch shape

Use Hostinger Managed WordPress for the editor experience the organization wants. WordPress should own editable pages, news posts, galleries, sponsor records, and form entries. Keep Google Workspace for Nonprofits as the internal source-media archive and organization email layer.

This React build is the approved visual/front-end reference. It can be deployed as a static preview now, then translated into a lightweight custom WordPress block theme without changing the design language.

The local prototype now includes a working LacedUp Studio Content Bridge: Studio publishes the homepage announcement and receives volunteer applications. This proves the workflow locally; it is not a production API. For launch, implement the same content and volunteer schema behind an authenticated HTTPS service or approved WordPress endpoints, then build the public site with `VITE_STUDIO_BRIDGE_URL` set to that service.

## Content model

| Content | WordPress type | Editable fields |
| --- | --- | --- |
| News | Posts | title, date, author, body, cover image, category |
| Gallery | Gallery entries | image, alt text, event, year, caption |
| Sponsors | Sponsor records | name, logo, URL, tier, sort order |
| Programs | Program records | name, description, icon, CTA |
| Events | Event records | date, location, status, registration URL |
| Forms | Hostinger/WordPress forms | volunteer interest, contact, newsletter, youth sneaker list |

## Launch checklist requiring owner access

1. Create or confirm the Hostinger Managed WordPress plan.
2. Provision a private staging domain and install the custom theme.
3. Import the 44-post Wix archive and seven legacy event pages.
4. Connect secure form delivery, spam protection, and confirmation email.
5. Protect Studio with authentication and role enforcement; do not expose its local JSON bridge publicly.
6. Verify the existing Stripe Payment Link and all social links.
7. Add redirects for every old Wix URL.
8. Run accessibility, performance, mobile, form, and donation tests on staging.
9. Back up Wix, then move DNS only after owner approval.

## Storage strategy

The source archive is retained outside the public gallery. Web delivery uses optimized images and a 1080p H.264 event video. This avoids repeating the Wix 2 GB problem while preserving every original filename in the migration manifest.

## Honest boundaries

This package does not claim that Hostinger, WordPress, production forms, analytics, DNS, authentication, or email are connected. Only the two loopback development apps are connected. Production actions require account access, security review, and explicit launch approval.
