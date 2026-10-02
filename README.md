# ARWA Amrutham — Purity in Motion

A responsive React + TypeScript + Vite experience with a procedural Three.js bottle, adaptive rendering, scroll storytelling, GSAP, Lenis, Framer Motion, and Tailwind CSS.

## Run

```sh
npm install
npm run dev
```

Production: `npm run build`, then `npm run preview`.

Use Node.js 24 (see `.nvmrc`) and `npm ci` for a reproducible installation. `npm run check` verifies the bottle, builds the site, runs the browser suite, and checks the compiled production enquiry download. Install the browser engines first with `npx playwright install chromium firefox webkit`.

Deploy the contents of `dist/` to a static HTTPS host at its root URL. No application server is needed for the downloadable enquiry flow. Netlify settings are included in `netlify.toml`; other hosts can use build command `npm run build` and output directory `dist`. Production source maps are disabled. The GitHub Actions workflow runs build, bottle preservation, accessibility, responsive browser tests, and a production smoke check; a passing run saves the deployable build as an artifact. That workflow does not automatically publish the site.

## Verified content and integrations

`src/config/business.ts` is the source of all business and contact details. Phone, WhatsApp, email, reviews, social accounts, and enquiry endpoint are intentionally empty. Configure them with verified information. Address links search Google Maps; they do not claim a verified location pin.

With no enquiry endpoint configured, the form validates and creates a downloadable text request. It clearly states that no request has been sent. To enable delivery, provide an HTTPS endpoint accepting the form's JSON object, returning a successful HTTP status only after receipt. Implement validation, abuse prevention, retention, and an appropriate privacy policy on that service.

No bottle photographs or GLB were supplied. The bottle is a custom procedural approximation with an illustrated SVG fallback. Replace or refine it against actual ARWA product photos before a public launch. Product sizes, stock, purification methods, reviews, ratings, and certifications are not asserted. The process story describes topics for the customer to ask about.

## Accessibility and performance

Semantic HTML remains available independently of WebGL. Navigation, tabs, forms, and native dialogs support keyboards; dialogs trap focus and restore it on close. Reduced motion disables smooth scroll, parallax, particles, and continuous motion. Mobile uses lower geometry complexity, environment resolution, and pixel ratio. The font is served locally, and the 3D scene is a separate lazy-loaded bundle. Software-only and legacy DX10 GPUs use an illustrated bottle that follows the same scroll choreography, avoiding costly shader initialization. The 3D bundle is loaded only when suitable hardware WebGL is available.

## Check

```sh
npx playwright install chromium firefox webkit
npm run test:e2e
```

Eight automated checks cover desktop rendering, browser runtime errors, all brief-specified widths, WebGL fallback, navigation, product selectors, form validation, request downloads, map links, legal dialogs, WCAG AA rules, Firefox, and WebKit. Real iPhone/Android devices and Safari require separate device testing. Performance scores must also be measured on the final hosting setup. A local production Lighthouse audit is saved in `artifacts/lighthouse.report.html`.

The local desktop Lighthouse audit on the legacy GPU fallback measured: Performance **97**, Accessibility **100**, Best Practices **100**, SEO **100**; LCP **0.7 s**, CLS **0.034**, TBT **0 ms**. These are lab results for this machine and rendering tier, not field Core Web Vitals or measurements of every GPU/device. INP requires real interaction measurements.

The locally bundled Inter font is licensed under the SIL Open Font License; see `public/fonts/OFL.txt`.

## Mobile interaction refinement

The existing bottle implementation is locked. `node scripts/verify-bottle-lock.mjs` checks SHA-256 hashes of all five bottle files, the original scene CSS, scene mounting, and the existing scroll animation block against the snapshot in `artifacts/bottle-lock`. UI changes live in `src/interactions.css`, `src/Interaction.tsx`, and `src/Enquiry.tsx`. The original brand orange is unchanged.

The enquiry uses one column below 600px, semantic autofill, native select/date controls, inline errors, and a real downloadable request. Prepared requests retain their values when edited. The mobile dock shows only configured contact methods and working directions/enquiry links; it hides for dialogs and near the footer. Requested viewport screenshots are in `artifacts/enquiry-*.png`. Automated viewport and browser checks do not emulate a physical phone keyboard or browser autofill popup; those require device checks.
