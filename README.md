# Laced Up PDX

A modern, responsive Laced Up PDX website prototype built with Vite, React, and Tailwind. The visual system translates the supplied athletic poster references into a readable black, yellow, and white web experience.

## Run locally

```bash
npm install
npm run media:prepare
npm run dev
```

Production verification:

```bash
npm run lint
npm test
npm run build
npm run preview
```

Run LacedUp Studio at `http://127.0.0.1:4177` alongside this website at `http://127.0.0.1:4179` to enable the local Content Bridge. Studio manages pages, 44 restored posts, seven restored event records and media; volunteer, contact, sneaker-list and email-list submissions flow into its private intake records.

## Connection status

- The existing Stripe Payment Link is preserved and live.
- Content, events, media, volunteer intake, public forms and homepage announcement publishing are connected to LacedUp Studio in local development.
- Hostinger production delivery, authentication, spam protection, email notifications and the full editorial CMS still require credentials and launch configuration.
- The 44-post Wix blog archive and seven Wix event pages are restored locally with source/provenance manifests; legacy summary-only posts are labeled honestly.
- No DNS, Wix, Stripe, Hostinger, Google, or social account settings are modified by this package.

To point the public build at a different authorized Studio service, set `VITE_STUDIO_BRIDGE_URL` to its `/api/bridge` URL before building.

See [HOSTINGER-HANDOFF.md](./HOSTINGER-HANDOFF.md) and [migration/media-manifest.json](./migration/media-manifest.json).
