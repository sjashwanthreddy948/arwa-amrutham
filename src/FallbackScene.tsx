import { useEffect, useRef } from 'react'
import BottleFallback from './BottleFallback'

const positions: Record<string, [number, number, number, number]> = {
  home: [8, 0, 1, -11],
  story: [24, 0, 1, 9],
  detail: [17, 17, 2.3, -18],
  orange: [0, 0, 1.05, 5],
  products: [-19, 2, 0.92, -6],
  water: [0, 0, 0.85, 9],
  process: [25, 0, 0.76, 12],
  hours: [2, 0, 0.95, -9],
  bulk: [25, 0, 0.92, 12],
  location: [26, 6, 0.72, -10],
  contact: [24, 0, 0.83, 6],
  finale: [0, 0, 0.95, -3],
}

export default function FallbackScene() {
  const image = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let frame = 0
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const draw = () => {
      if (!image.current) return
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>('[data-scene]'),
      )
      const index = sections.findIndex((el) => {
        const r = el.getBoundingClientRect()
        return (
          r.top <= (reduced ? innerHeight * 0.5 : 1) &&
          r.bottom > (reduced ? innerHeight * 0.5 : 1)
        )
      })
      const active = sections[index]
      image.current.style.visibility = active ? 'visible' : 'hidden'
      const pose = [
        ...(positions[active?.dataset.scene || 'home'] || positions.home),
      ]
      const next = sections[index + 1]
      if (!reduced && active && next) {
        const mix = Math.max(
          0,
          Math.min(
            1,
            (innerHeight - active.getBoundingClientRect().bottom) / innerHeight,
          ),
        )
        const nextPose =
          positions[next.dataset.scene || 'home'] || positions.home
        pose.forEach((p, i) => {
          pose[i] = p + (nextPose[i] - p) * mix
        })
      }
      if (innerWidth < 768) {
        pose[0] = ['home', 'orange', 'water', 'hours', 'finale'].includes(
          active?.dataset.scene || 'home',
        )
          ? 0
          : 15
        pose[1] = ['story', 'bulk', 'location', 'contact', 'process'].includes(
          active?.dataset.scene || '',
        )
          ? 15
          : 0
        if (active?.dataset.scene === 'detail') pose[2] *= 0.68
      }
      if (active?.dataset.product === 'compact') pose[2] *= 0.8
      image.current.style.transform = `translate(${pose[0]}vw,${pose[1]}vh) rotate(${reduced ? 0 : pose[3]}deg) scale(${pose[2]})`
    }
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(draw)
    }
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    const observer = new MutationObserver(update)
    const products = document.getElementById('products')
    if (products)
      observer.observe(products, {
        attributes: true,
        attributeFilter: ['data-product'],
      })
    draw()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      observer.disconnect()
    }
  }, [])
  return (
    <div className="fixed-bottle fallback-scene" aria-hidden="true">
      <div ref={image} className="fallback-object">
        <BottleFallback />
      </div>
    </div>
  )
}
