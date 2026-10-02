import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import {
  business,
  addressText,
  directionsUrl,
  mapSearchUrl,
} from './config/business'
import BottleFallback from './BottleFallback'
import FallbackScene from './FallbackScene'
import { supportsHardwareWebGL } from './graphics'
import Enquiry from './Enquiry'
import { Icon, MobileActionDock } from './Interaction'

const Scene = lazy(() => import('./Scene'))
gsap.registerPlugin(ScrollTrigger)
const nav = [
  ['Story', 'story'],
  ['Water', 'water'],
  ['Products', 'products'],
  ['Bulk', 'bulk'],
  ['Find us', 'location'],
]
const products = [
  {
    title: 'Regular bottle',
    line: 'Your everyday refresh.',
    text: 'From a morning on the move to a well-earned pause. A little ARWA goes with you.',
    tag: '01 / THE EVERYDAY',
    size: 'regular',
  },
  {
    title: 'Compact bottle',
    line: 'Small bottle. Big refresh.',
    text: 'For the moments that travel light. Ask our team about compact bottle availability.',
    tag: '02 / ON THE MOVE',
    size: 'compact',
  },
  {
    title: 'Bulk supply',
    line: 'More moments. More ARWA.',
    text: 'Planning for a crowd? Tell us your requirement, delivery area, and preferred date.',
    tag: '03 / BETTER TOGETHER',
    size: 'bulk',
  },
]

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true">{diagonal ? '↗' : '↗'}</span>
}
function Eyebrow({
  children,
  light = false,
}: {
  children: ReactNode
  light?: boolean
}) {
  return (
    <div className={`eyebrow ${light ? 'light' : ''}`}>
      <span className="tiny-dot" />
      {children}
    </div>
  )
}

class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn(
      'ARWA: using the illustrated bottle fallback.',
      error.message,
      info.componentStack,
    )
  }
  render() {
    return this.state.failed ? <FallbackScene /> : this.props.children
  }
}

function Legal({
  kind,
  close,
}: {
  kind: 'Privacy' | 'Terms'
  close: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const p = document.activeElement as HTMLElement
    ref.current?.showModal()
    return () => p?.focus()
  }, [])
  return (
    <dialog
      ref={ref}
      className="legal-dialog"
      onCancel={close}
      aria-labelledby="legal-title"
    >
      <button
        className="close-button"
        onClick={close}
        aria-label="Close information"
      >
        ✕
      </button>
      <Eyebrow>ARWA AMRUTHAM</Eyebrow>
      <h2 id="legal-title">{kind}</h2>
      {kind === 'Privacy' ? (
        <>
          <p>
            This website does not use advertising or analytics cookies. Enquiry
            details remain in your browser unless you choose to download them or
            a configured submission service is enabled.
          </p>
          <p>
            Map links open Google Maps, which has its own privacy policy.
            Downloaded enquiry files contain the personal details you entered;
            share them only with your intended recipient.
          </p>
        </>
      ) : (
        <>
          <p>
            This website introduces ARWA Amrutham’s packaged drinking water
            offering. Product illustrations are visual approximations. Product
            formats, availability, price, quantities, and delivery arrangements
            must be confirmed directly with the business.
          </p>
          <p>
            Preparing an enquiry does not place an order. Directions use the
            supplied address and are not a verified geographic pin.
          </p>
        </>
      )}
      <button className="line-button" onClick={close}>
        BACK TO ARWA <Arrow />
      </button>
    </dialog>
  )
}

function App() {
  const [hardware3D, setHardware3D] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setHardware3D(supportsHardwareWebGL()), 250)
    return () => clearTimeout(timer)
  }, [])
  const reduced = useReducedMotion() ?? false
  const [intro, setIntro] = useState(
    !reduced && !sessionStorage.getItem('arwa-visited'),
  )
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [enquiry, setEnquiry] = useState<string | null>(null)
  const [legal, setLegal] = useState<'Privacy' | 'Terms' | null>(null)
  const [product, setProduct] = useState(0)
  const [activeStage, setActiveStage] = useState(0)
  const cursor = useRef<HTMLDivElement>(null)
  const progress = useRef<HTMLDivElement>(null)
  const menuDialog = useRef<HTMLDialogElement>(null)
  const openEnquiry = (type = 'Bulk supply') => {
    setMenu(false)
    setEnquiry(type)
  }

  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: business.name,
      description: business.category,
      address: {
        '@type': 'PostalAddress',
        streetAddress: business.address.street,
        addressLocality: `${business.address.locality}, ${business.address.city}`,
        addressRegion: business.address.state,
        postalCode: business.address.postalCode,
        addressCountry: 'IN',
      },
      openingHours: business.open24Hours ? 'Mo-Su 00:00-24:00' : undefined,
    }
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(schema)
    document.head.append(script)
    const timer = setTimeout(() => {
      setIntro(false)
      sessionStorage.setItem('arwa-visited', '1')
    }, 1400)
    return () => {
      script.remove()
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (menu) {
      menuDialog.current?.showModal()
      document.body.style.overflow = 'hidden'
    } else {
      menuDialog.current?.close()
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menu])

  useEffect(() => {
    const scroll = () => {
      setScrolled(window.scrollY > 70)
      if (progress.current)
        progress.current.style.transform = `scaleX(${window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)})`
    }
    window.addEventListener('scroll', scroll, { passive: true })
    scroll()
    let lenis: Lenis | undefined
    if (!reduced) {
      lenis = new Lenis({
        autoRaf: true,
        duration: 1.1,
        anchors: true,
        prevent: (node) => node.closest('dialog') !== null,
      })
      lenis.on('scroll', ScrollTrigger.update)
    }
    const ctx = gsap.context(() => {
      if (!reduced) {
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.fromTo(
            el,
            { y: 55, clipPath: 'inset(0 0 100% 0)' },
            {
              y: 0,
              clipPath: 'inset(0 0 0% 0)',
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 92%', once: true },
            },
          )
        })
        gsap.to('.hero-pure', {
          yPercent: -25,
          ease: 'none',
          scrollTrigger: {
            trigger: '#home',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
        gsap.to('.hero-refresh', {
          xPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: '#home',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
      }
      ScrollTrigger.create({
        trigger: '#process',
        start: 'top center',
        end: 'bottom center',
        onUpdate: (self) =>
          setActiveStage(Math.min(6, Math.floor(self.progress * 7))),
      })
    })
    let magnetic: HTMLElement | null = null
    const move = (e: PointerEvent) => {
      if (!reduced && e.pointerType === 'mouse') {
        const next = (e.target as HTMLElement).closest<HTMLElement>(
          '.solid-button,.line-button,.nav-contact',
        )
        if (magnetic && magnetic !== next) magnetic.style.transform = ''
        magnetic = next
        if (next) {
          const r = next.getBoundingClientRect()
          next.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.07}px,${(e.clientY - r.top - r.height / 2) * 0.13}px)`
        }
      }
      if (!cursor.current) return
      cursor.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      cursor.current.classList.toggle(
        'hover',
        !!(e.target as HTMLElement).closest('a,button,input,select,textarea'),
      )
    }
    const click = (e: MouseEvent) => {
      if (
        reduced ||
        (e.target instanceof HTMLElement && e.target.closest('dialog'))
      )
        return
      const ripple = document.createElement('span')
      ripple.className = 'click-ripple'
      ripple.style.left = `${e.clientX}px`
      ripple.style.top = `${e.clientY}px`
      document.body.append(ripple)
      setTimeout(() => ripple.remove(), 650)
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('click', click)
    return () => {
      window.removeEventListener('scroll', scroll)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('click', click)
      lenis?.destroy()
      ctx.revert()
    }
  }, [reduced])

  const p = products[product]
  return (
    <>
      <a className="skip-link" href="#story">
        Skip to content
      </a>
      <div className="scroll-progress" ref={progress} />
      <div ref={cursor} className="custom-cursor" aria-hidden="true">
        <span />
      </div>
      <AnimatePresence>
        {intro && (
          <motion.div
            className="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(8px)' }}
            transition={{ duration: 0.35 }}
            aria-hidden="true"
          >
            <div className="intro-logo">
              ARWA<span>PURE REFRESHMENT</span>
            </div>
            <div className="intro-drop" />
            <div className="intro-ripple" />
          </motion.div>
        )}
      </AnimatePresence>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <a href="#home" className="wordmark">
          ARWA<span>AMRUTHAM</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map(([name, id]) => (
            <a key={id} href={`#${id}`}>
              {name}
            </a>
          ))}
        </nav>
        <a className="nav-contact" href="#contact">
          LET’S TALK <Arrow />
        </a>
        <button
          className="menu-toggle"
          onClick={() => setMenu(true)}
          aria-label="Open navigation menu"
          aria-expanded={menu}
          aria-controls="arwa-mobile-menu"
        >
          <span />
          <span />
        </button>
      </header>
      <dialog
        ref={menuDialog}
        className="mobile-menu"
        id="arwa-mobile-menu"
        onCancel={() => setMenu(false)}
        aria-label="Main navigation"
      >
        <div className="dialog-top">
          <span className="wordmark">
            ARWA<span>AMRUTHAM</span>
          </span>
          <button
            className="close-button"
            onClick={() => setMenu(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <BottleFallback />
        <nav>
          {[['Home', 'home'], ...nav, ['Contact', 'contact']].map(
            ([name, id], i) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setMenu(false)}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span>0{i + 1}</span>
                {name}
                <Arrow />
              </a>
            ),
          )}
        </nav>
        <span className="menu-bottom">PURE REFRESHMENT. FROM KURNOOL.</span>
      </dialog>
      <SceneBoundary>
        {hardware3D ? (
          <Suspense fallback={<FallbackScene />}>
            <Scene reduced={reduced} />
          </Suspense>
        ) : (
          <FallbackScene />
        )}
      </SceneBoundary>
      <main>
        <section
          id="home"
          className="hero scene"
          data-scene="home"
          aria-label="ARWA pure refreshment"
        >
          <div className="hero-topline">
            <span>PURE WATER. EVERYDAY MOMENTS.</span>
            <span className="coordinates">
              KURNOOL, INDIA <span className="orange-dot" />
            </span>
          </div>
          <div className="hero-title">
            <h1>
              <span className="hero-pure">
                PURE<span className="headline-star">✳</span>
              </span>
              <span className="hero-refresh">REFRESHMENT.</span>
            </h1>
          </div>
          <div className="hero-note">
            <span className="note-line" />
            <p>
              Good things
              <br />
              come in clear bottles.
            </p>
            <span className="note-meta">PACKAGED DRINKING WATER</span>
          </div>
          <span className="floating-note">
            A LITTLE WATER.
            <br />A WHOLE LOT OF LIFE.
          </span>
          <div className="hero-bottom">
            <div className="hero-copy">
              <p>
                Refreshment for every moment.
                <br />
                Rooted in Kurnool. Ready for you.
              </p>
              <div className="hero-actions">
                <a className="solid-button" href="#story">
                  EXPLORE ARWA <Arrow />
                </a>
                <button className="text-button" onClick={() => openEnquiry()}>
                  BULK ORDERS <Arrow />
                </button>
              </div>
            </div>
            <a className="explore-indicator" aria-label="Explore our story" href="#story">
              <span className="droplet-track">
                <i />
              </span>
              <span>SCROLL TO FEEL IT</span>
            </a>
            <div className="hero-edition">
              <span>01 — 12</span>
              <span>PURITY IN MOTION</span>
            </div>
          </div>
          <span className="hero-watermark" aria-hidden="true">
            H₂O
          </span>
        </section>

        <section id="story" className="story scene" data-scene="story">
          <div className="section-number">
            01 / ROOTED HERE. READY EVERYWHERE.
          </div>
          <div className="story-copy foreground">
            <Eyebrow>MEET ARWA AMRUTHAM</Eyebrow>
            <h2 data-reveal>
              BORN
              <br />
              TO <em>REFRESH.</em>
            </h2>
            <p className="body-copy" data-reveal>
              From the first sip to the last.
              <br />
              Packaged drinking water serving Kurnool
              <br className="desktop-only" /> and the communities around it.
            </p>
            <a className="line-button" href="#products">
              FIND YOUR EVERYDAY <Arrow />
            </a>
          </div>
          <span className="vertical-label">CLEAR WATER. CLEAR INTENT.</span>
          <div className="story-caption">
            <span className="crosshair">+</span>
            <p>
              Orange on the outside.
              <br />
              Refreshment on the inside.
            </p>
          </div>
          <div className="water-line" aria-hidden="true" />
        </section>

        <section id="detail" className="macro scene" data-scene="detail">
          <div className="section-number">02 / TAKE A CLOSER LOOK</div>
          <div className="foreground macro-copy">
            <Eyebrow>THE DETAILS MAKE THE DIFFERENCE</Eyebrow>
            <h2 data-reveal>
              PURENESS
              <br />
              YOU CAN
              <br />
              <em>SEE.</em>
            </h2>
            <p className="body-copy">
              Clear water. A familiar orange cap.
              <br />
              An everyday essential, unmistakably ARWA.
            </p>
          </div>
          <div className="macro-label foreground">
            <span className="crosshair">+</span>
            <span>
              CLEAR.
              <br />
              REFRESHING.
              <br />
              READY.
            </span>
          </div>
          <span className="macro-bottom">
            NOTHING COMPLICATED. JUST REFRESHMENT.
          </span>
        </section>

        <section id="orange" className="orange-scene scene" data-scene="orange">
          <div className="orange-lines" aria-hidden="true" />
          <div className="section-number">03 / A COLOR YOU’LL REMEMBER</div>
          <h2 className="orange-word" data-reveal>
            ARWA
          </h2>
          <div className="orange-bottom foreground">
            <span>
              PACKAGED
              <br />
              DRINKING WATER.
            </span>
            <p>
              Good water.
              <br />
              Great energy.
            </p>
            <span className="orange-circle">
              PURE
              <br />
              REFRESHMENT <Arrow />
            </span>
          </div>
        </section>
        <div className="marquee" aria-hidden="true">
          <div>
            DRINK. <span>REFRESH.</span> REPEAT. <span>ARWA.</span> DRINK.{' '}
            <span>REFRESH.</span> REPEAT. <span>ARWA.</span>
          </div>
        </div>

        <section
          id="products"
          className={`products scene product-${p.size}`}
          data-scene="products"
          data-product={p.size}
        >
          <div className="section-number">04 / YOUR MOMENT. YOUR ARWA.</div>
          <div className="products-heading">
            <Eyebrow>THE EVERYDAY COLLECTION</Eyebrow>
            <h2 data-reveal>
              MADE FOR
              <br />
              <em>EVERY MOMENT.</em>
            </h2>
          </div>
          <div className="product-stage">
            <div className="product-orbit" aria-hidden="true" />
            <span className="product-annotation">
              THE ORANGE CAP.
              <br />
              YOU KNOW THE ONE.
            </span>
            <div className="product-info foreground" key={product}>
              <span className="mono orange-text">{p.tag}</span>
              <h3>{p.title}</h3>
              <p className="product-line">{p.line}</p>
              <p className="body-copy">{p.text}</p>
              <p className="availability">
                Formats and availability confirmed on enquiry.
              </p>
              <button
                className="line-button"
                onClick={() =>
                  openEnquiry(
                    p.title === 'Bulk supply'
                      ? 'Bulk supply'
                      : p.title === 'Regular bottle'
                        ? 'Regular bottle'
                        : 'Compact bottle',
                  )
                }
              >
                ENQUIRE <Arrow />
              </button>
            </div>
          </div>
          <div
            className="product-controls foreground"
            role="tablist"
            aria-label="Bottle formats"
          >
            {products.map((item, i) => (
              <button
                key={item.title}
                role="tab"
                aria-selected={i === product}
                tabIndex={0}
                className={i === product ? 'active' : ''}
                onClick={() => setProduct(i)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.preventDefault()
                    const next =
                      (product + (e.key === 'ArrowRight' ? 1 : 2)) % 3
                    setProduct(next)
                    ;(
                      e.currentTarget.parentElement?.children[
                        next
                      ] as HTMLButtonElement
                    )?.focus()
                  }
                }}
              >
                <span>0{i + 1}</span>
                {item.title}
                <Arrow />
              </button>
            ))}
          </div>
        </section>

        <section
          id="water"
          className="water-scene scene dark"
          data-scene="water"
        >
          <div className="caustics" aria-hidden="true" />
          <div className="section-number">05 / GO A LITTLE DEEPER</div>
          <div className="water-portal" aria-hidden="true" />
          <div className="water-title">
            <Eyebrow light>PURITY IN MOTION</Eyebrow>
            <h2 data-reveal>
              EVERY DROP
              <br />
              <span className="outline-white">MATTERS.</span>
            </h2>
          </div>
          <div className="bubble-field" aria-hidden="true">
            {Array.from({ length: 16 }, (_, i) => (
              <i
                key={i}
                style={{
                  left: `${5 + i * 6}%`,
                  animationDelay: `${i * 0.8}s`,
                  animationDuration: `${10 + (i % 4) * 3}s`,
                }}
              />
            ))}
          </div>
          <div className="water-bottom foreground">
            <p>
              Take a breath.
              <br />
              Take a sip.
              <br />
              Keep moving.
            </p>
            <span>
              REFRESHMENT
              <br />
              IN MOTION. <Arrow />
            </span>
          </div>
        </section>

        <section id="process" className="process scene" data-scene="process">
          <div className="section-number">06 / CURIOUS ABOUT YOUR WATER?</div>
          <div className="process-content foreground">
            <Eyebrow>THE JOURNEY TO YOUR BOTTLE</Eyebrow>
            <h2 data-reveal>
              FROM SOURCE
              <br />
              TO <em>SIP.</em>
            </h2>
            <p className="body-copy">
              Every bottle has a journey.
              <br />
              Ask ARWA about each step of theirs.
            </p>
            <ol className="process-list">
              {[
                'Water preparation',
                'Treatment & filtration',
                'Bottle preparation',
                'Filling',
                'Sealing',
                'Packaging',
                'Distribution',
              ].map((s, i) => (
                <li key={s} className={i === activeStage ? 'active' : ''}>
                  <span>0{i + 1}</span>
                  <span>{s}</span>
                  <i />
                </li>
              ))}
            </ol>
            <p className="process-note">
              An overview of topics to discuss with our team.
              <br />
              Specific methods and technologies are subject to confirmation.
            </p>
          </div>
          <span className="process-side">
            A CLEARER PICTURE, ONE STEP AT A TIME.
          </span>
        </section>

        <section id="hours" className="hours scene dark" data-scene="hours">
          <div className="section-number">07 / ON YOUR TIME</div>
          <div className="clock-ring" aria-hidden="true" />
          <h2 className="hours-title">
            <span>24</span>
            <span>/7</span>
          </h2>
          <div className="hours-copy foreground">
            <Eyebrow light>ARWA AMRUTHAM · OPEN 24 HOURS</Eyebrow>
            <p>
              Early starts. Late nights.
              <br />
              Refreshment whenever you need it.
            </p>
          </div>
          <span className="hours-note">
            NO OFF SWITCH
            <br />
            FOR REFRESHMENT.
          </span>
        </section>

        <section id="bulk" className="bulk scene" data-scene="bulk">
          <div className="section-number">
            08 / GOOD THINGS ARE BETTER SHARED
          </div>
          <div className="foreground bulk-content">
            <Eyebrow>BIG PLANS? WE’RE HERE.</Eyebrow>
            <h2 data-reveal>
              NEED
              <br />
              MORE <em>ARWA?</em>
            </h2>
            <p className="body-copy">
              For the team. For the table. For everyone.
              <br />
              Let’s talk about your bulk water requirements.
            </p>
            <div className="use-cases">
              {[
                'Events',
                'Offices',
                'Retail',
                'Restaurants',
                'Businesses',
                'Institutions',
              ].map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
            <button className="solid-button" onClick={() => openEnquiry()}>
              REQUEST BULK SUPPLY <Arrow />
            </button>
          </div>
          <div className="bulk-stamp">
            MORE PEOPLE.
            <br />
            MORE MOMENTS.
            <br />
            <strong>MORE ARWA.</strong>
          </div>
        </section>

        <section id="location" className="location scene" data-scene="location">
          <div className="topography" aria-hidden="true">
            <svg viewBox="0 0 900 800" preserveAspectRatio="xMidYMid slice">
              {Array.from({ length: 16 }, (_, i) => (
                <ellipse
                  key={i}
                  cx="680"
                  cy="330"
                  rx={110 + i * 31}
                  ry={60 + i * 23}
                  transform="rotate(-28 680 330)"
                />
              ))}
            </svg>
          </div>
          <div className="section-number">09 / A LITTLE LOCAL LOVE</div>
          <div className="location-content foreground">
            <Eyebrow>FROM HERE, WITH REFRESHMENT</Eyebrow>
            <h2 data-reveal>
              KURNOOL,
              <br />
              STAY
              <br />
              <em>REFRESHED.</em>
            </h2>
            <div className="location-address">
              <span className="location-mark"><Icon name="pin" /></span>
              <div>
                <h3>Find your ARWA.</h3>
                <address>
                  {business.address.street}
                  <br />
                  {business.address.locality}
                  <br />
                  {business.address.city}, {business.address.state}{' '}
                  {business.address.postalCode}
                </address>
              </div>
            </div>
            <div className="location-actions">
              <a
                className="solid-button"
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                GET DIRECTIONS <Arrow />
              </a>
              <a
                className="line-button location-button"
                href={mapSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                OPEN MAP <Arrow />
              </a>
            </div>
          </div>
          <a
            className="map-pin foreground"
            href={mapSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="KALLURU KURNOOL, AP — search for ARWA on Google Maps"
          >
            <span aria-hidden="true">✳</span>
            <span>
              KALLURU
              <br />
              KURNOOL, AP
            </span>
          </a>
        </section>

        <section className="reviews">
          <Eyebrow>THE LOCAL CONVERSATION</Eyebrow>
          <h2>
            PEOPLE KNOW <em>ARWA.</em>
          </h2>
          <div>
            <p>
              Real people. Real experiences.
              <br />
              Verified Google reviews will appear here when connected.
            </p>
            {business.googleReviewsUrl ? (
              <a
                className="line-button"
                href={business.googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                VIEW GOOGLE REVIEWS <Arrow />
              </a>
            ) : (
              <a
                className="line-button"
                href={mapSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                FIND ARWA ON GOOGLE <Arrow />
              </a>
            )}
          </div>
        </section>

        <section
          id="contact"
          className="contact scene dark"
          data-scene="contact"
        >
          <div className="section-number">
            10 / KEEP THE CONVERSATION FLOWING
          </div>
          <div className="contact-content foreground">
            <Eyebrow light>YOUR NEXT REFRESHMENT STARTS HERE</Eyebrow>
            <h2 data-reveal>
              THIRSTY?
              <br />
              <em>LET’S TALK.</em>
            </h2>
            <div className="contact-links">
              {business.phone ? (
                <a href={`tel:${business.phone}`}>
                  CALL ARWA <Arrow />
                </a>
              ) : (
                <button onClick={() => openEnquiry('General enquiry')}>
                  MAKE AN ENQUIRY <Arrow />
                </button>
              )}
              {business.whatsapp && (
                <a
                  href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WHATSAPP <Arrow />
                </a>
              )}
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                COME SAY HELLO <Arrow />
              </a>
              <button onClick={() => openEnquiry()}>
                LET’S TALK BULK <Arrow />
              </button>
            </div>
            <p className="contact-meta">KALLURU, KURNOOL · OPEN 24 HOURS</p>
          </div>
          <div className="spotlight" aria-hidden="true" />
        </section>

        <section id="finale" className="finale scene" data-scene="finale">
          <div className="section-number">11 / ONE LAST THING</div>
          <span className="finale-word" aria-hidden="true">
            ARWA
          </span>
          <div className="finale-copy foreground">
            <h2>STAY REFRESHED.</h2>
            <p>
              Kurnool, Andhra Pradesh.
              <br />
              Your everyday. Our ARWA.
            </p>
          </div>
        </section>
      </main>
      <footer>
        <div className="footer-top">
          <a className="wordmark" href="#home">
            ARWA<span>AMRUTHAM</span>
          </a>
          <span>
            PURE REFRESHMENT.
            <br />
            NO MATTER THE MOMENT.
          </span>
          <a href="#home" className="back-top">
            BACK TO TOP <span>↑</span>
          </a>
        </div>
        <div className="footer-grid">
          <p>
            Packaged drinking water.
            <br />
            From Kurnool, with refreshment.
          </p>
          <nav aria-label="Footer navigation">
            {nav.map(([name, id]) => (
              <a key={id} href={`#${id}`}>
                {name}
              </a>
            ))}
          </nav>
          <address>
            {business.address.street}
            <br />
            {business.address.locality}
            <br />
            {business.address.state} {business.address.postalCode}, India
            <br />
            <span className="open-status">
              <i /> Open 24 hours
            </span>
          </address>
        </div>
        <div className="footer-word">
          ARWA<span>✳</span>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {business.name}
          </span>
          <span>PURITY IN MOTION.</span>
          <div>
            <button onClick={() => setLegal('Privacy')}>Privacy</button>
            <button onClick={() => setLegal('Terms')}>Terms</button>
          </div>
        </div>
      </footer>
      <MobileActionDock openEnquiry={() => openEnquiry()} hidden={menu || enquiry !== null || legal !== null} />
      <AnimatePresence>
        {enquiry !== null && (
          <Enquiry close={() => setEnquiry(null)} initial={enquiry} />
        )}
      </AnimatePresence>
      {legal && <Legal kind={legal} close={() => setLegal(null)} />}
      <span className="sr-only">{addressText}</span>
    </>
  )
}

export default App
