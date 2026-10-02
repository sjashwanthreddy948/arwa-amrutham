import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Float,
  Lightformer,
  Environment,
  PerformanceMonitor,
} from '@react-three/drei'
import * as THREE from 'three'
import FallbackScene from './FallbackScene'
import { applyRefraction, createRefractionBackdrop } from './refraction'

type Pose = {
  x: number
  y: number
  scale: number
  z: number
  ry: number
  opacity?: number
}
const poses: Record<string, Pose> = {
  home: { x: 0.7, y: 0, scale: 1.02, z: -0.19, ry: -0.25 },
  story: { x: 2.1, y: 0, scale: 1.03, z: 0.15, ry: 0.35 },
  detail: { x: 1.4, y: -1.3, scale: 2.35, z: -0.32, ry: -0.35 },
  orange: { x: 0, y: -0.15, scale: 1.08, z: 0.08, ry: 0.2 },
  products: { x: -1.65, y: -0.22, scale: 0.94, z: -0.1, ry: -0.25 },
  water: { x: 0, y: -0.18, scale: 0.85, z: 0.16, ry: 0.4 },
  process: { x: 2.2, y: -0.1, scale: 0.76, z: 0.2, ry: -0.25 },
  hours: { x: 0.2, y: -0.1, scale: 0.98, z: -0.15, ry: 0.2 },
  bulk: { x: 2.2, y: -0.05, scale: 0.93, z: 0.2, ry: -0.3 },
  location: { x: 2.3, y: -0.4, scale: 0.72, z: -0.18, ry: 0.2 },
  contact: { x: 2.1, y: -0.1, scale: 0.83, z: 0.1, ry: 0.3 },
  finale: { x: 0, y: 0, scale: 0.95, z: -0.06, ry: 0 },
}

function createLabel() {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 512
  const c = canvas.getContext('2d')!
  c.fillStyle = '#f45b18'
  c.fillRect(0, 0, 2048, 512)
  c.strokeStyle = 'rgba(255,255,255,.25)'
  c.lineWidth = 1
  for (let i = 0; i < 9; i++) {
    c.beginPath()
    for (let x = 0; x <= 2048; x += 8) {
      const y = 390 + i * 12 + Math.sin(x / 130 + i * 0.5) * 25
      if (!x) c.moveTo(x, y)
      else c.lineTo(x, y)
    }
    c.stroke()
  }
  for (const x of [512, 1536]) {
    c.fillStyle = '#ffffff'
    c.textAlign = 'center'
    c.font = '500 19px Arial'
    c.letterSpacing = '7px'
    c.fillText('PURE REFRESHMENT', x, 94)
    c.font = '900 150px Arial'
    c.letterSpacing = '-8px'
    c.fillText('ARWA', x, 263)
    c.font = '500 32px Arial'
    c.letterSpacing = '10px'
    c.fillText('AMRUTHAM', x, 320)
    c.font = '400 16px Arial'
    c.letterSpacing = '3px'
    c.fillText('PACKAGED DRINKING WATER', x, 368)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function Bottle({ reduced, low }: { reduced: boolean; low: boolean }) {
  const group = useRef<THREE.Group>(null)
  const { viewport } = useThree()
  const sections = useRef<HTMLElement[]>([])
  const visible = useRef(true)
  const pointer = useRef({ x: 0, y: 0 })
  const pose = useRef({ ...poses.home })
  const backdrop = useMemo(createRefractionBackdrop, [])
  const bodyMaterial = useMemo(() => {
    const material = new THREE.MeshPhysicalMaterial({
      color: '#f3fbfb',
      roughness: 0.06,
      transmission: 0.98,
      thickness: 0.6,
      ior: 1.46,
      clearcoat: 0.8,
      clearcoatRoughness: 0.12,
      envMapIntensity: 0.85,
      side: THREE.DoubleSide,
      dispersion: low ? 0 : 0.08,
    })
    applyRefraction(material, backdrop.texture)
    return material
  }, [backdrop, low])
  const geometry = useMemo(() => {
    const points: THREE.Vector2[] = []
    const outline = [
      [0.05, -1.95],
      [0.42, -1.98],
      [0.58, -1.88],
      [0.61, -1.7],
      [0.61, -1.5],
      [0.58, -1.46],
      [0.61, -1.42],
      [0.61, -1.27],
      [0.58, -1.23],
      [0.61, -1.19],
      [0.61, -1.04],
      [0.58, -1],
      [0.61, -0.96],
      [0.61, -0.74],
      [0.6, -0.7],
      [0.6, 0.35],
      [0.61, 0.39],
      [0.61, 0.57],
      [0.575, 0.61],
      [0.61, 0.65],
      [0.61, 0.8],
      [0.575, 0.84],
      [0.61, 0.88],
      [0.6, 1.02],
      [0.57, 1.14],
      [0.5, 1.3],
      [0.38, 1.44],
      [0.27, 1.57],
      [0.25, 1.68],
      [0.25, 1.9],
    ]
    outline.forEach(([x, y]) => points.push(new THREE.Vector2(x, y)))
    return new THREE.LatheGeometry(points, low ? 40 : 72)
  }, [low])
  const label = useMemo(createLabel, [])
  useEffect(() => {
    sections.current = Array.from(
      document.querySelectorAll<HTMLElement>('[data-scene]'),
    )
    const move = (e: PointerEvent) => {
      pointer.current = {
        x: (e.clientX / innerWidth) * 2 - 1,
        y: (e.clientY / innerHeight) * 2 - 1,
      }
    }
    const visibility = () => {
      visible.current = !document.hidden
    }
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('visibilitychange', visibility)
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [geometry, label])
  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => label.dispose(), [label])
  useEffect(() => () => bodyMaterial.dispose(), [bodyMaterial])
  useEffect(() => {
    backdrop.start()
    return () => {
      backdrop.stop()
      backdrop.dispose()
    }
  }, [backdrop])
  useFrame(({ clock }, delta) => {
    if (!group.current || !visible.current) return
    backdrop.paint(clock.elapsedTime * 1000)
    const vh = innerHeight
    const index = sections.current.findIndex((el) => {
      const r = el.getBoundingClientRect()
      return (
        r.top <= (reduced ? vh * 0.5 : 1) && r.bottom > (reduced ? vh * 0.5 : 1)
      )
    })
    const active = sections.current[index]
    const mobile = innerWidth < 768
    const target = { ...(poses[active?.dataset.scene || 'home'] || poses.home) }
    const next = sections.current[index + 1]
    if (!reduced && active && next) {
      const mix = THREE.MathUtils.clamp(
        (vh - active.getBoundingClientRect().bottom) / vh,
        0,
        1,
      )
      const nextPose = poses[next.dataset.scene || 'home'] || poses.home
      for (const key of ['x', 'y', 'scale', 'z', 'ry'] as const)
        target[key] = THREE.MathUtils.lerp(target[key], nextPose[key], mix)
    }
    if (mobile) {
      target.x = ['home', 'orange', 'water', 'hours', 'finale'].includes(
        active?.dataset.scene || 'home',
      )
        ? 0
        : 0.72
      target.scale *= ['detail'].includes(active?.dataset.scene || '')
        ? 0.68
        : 0.78
      target.y = ['story', 'bulk', 'location', 'contact', 'process'].includes(
        active?.dataset.scene || '',
      )
        ? -0.85
        : -0.12
    }
    if (
      active?.dataset.scene === 'products' &&
      active.dataset.product === 'compact'
    )
      target.scale *= 0.8
    const a = reduced ? 1 : 1 - Math.exp(-delta * 3)
    const p = pose.current
    p.x = THREE.MathUtils.lerp(p.x, target.x, a)
    p.y = THREE.MathUtils.lerp(p.y, target.y, a)
    p.scale = THREE.MathUtils.lerp(p.scale, target.scale, a)
    p.z = THREE.MathUtils.lerp(p.z, target.z, a)
    p.ry = THREE.MathUtils.lerp(p.ry, target.ry, a)
    const t = clock.elapsedTime
    const responsiveScale = Math.min(
      viewport.height / 5.8,
      viewport.width / (mobile ? 3.7 : 10.5),
    )
    group.current.position.set(
      p.x * responsiveScale,
      (p.y + (reduced ? 0 : Math.sin(t * 0.75) * 0.055)) * responsiveScale,
      0,
    )
    group.current.scale.setScalar(p.scale * responsiveScale)
    group.current.rotation.set(
      reduced ? 0 : pointer.current.y * 0.045,
      p.ry + (reduced ? 0 : pointer.current.x * 0.1),
      p.z,
    )
    group.current.visible = !!active
  })
  return (
    <group ref={group}>
      <mesh geometry={geometry} material={bodyMaterial} />
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.555, 0.555, 3.02, low ? 24 : 48]} />
        <meshPhysicalMaterial
          color="#b3d9df"
          transmission={0.97}
          roughness={0.07}
          thickness={0.4}
          ior={1.333}
          transparent
          opacity={0.22}
          envMapIntensity={0.4}
        />
      </mesh>
      <mesh position={[0, -0.14, 0]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.615, 0.615, 1.03, 64, 1, true]} />
        <meshStandardMaterial
          map={label}
          roughness={0.38}
          metalness={0.05}
          side={THREE.DoubleSide}
          emissive="#f45b18"
          emissiveIntensity={0.15}
        />
      </mesh>
      <mesh position={[0, 1.91, 0]}>
        <cylinderGeometry args={[0.295, 0.295, 0.31, 64]} />
        <meshStandardMaterial
          color="#f45b18"
          roughness={0.35}
          metalness={0.06}
        />
      </mesh>
      <mesh position={[0, 1.72, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.045, 48]} />
        <meshStandardMaterial color="#ee5010" roughness={0.42} />
      </mesh>
      {Array.from({ length: low ? 24 : 48 }, (_, i) => {
        const a = (i / (low ? 24 : 48)) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.294, 1.91, Math.sin(a) * 0.294]}
            rotation={[0, -a, 0]}
          >
            <boxGeometry args={[0.011, 0.25, 0.016]} />
            <meshStandardMaterial color="#ee5718" roughness={0.45} />
          </mesh>
        )
      })}
      {[-1.65, -1.43, -1.2, -0.98, 0.58, 0.82].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.6, 0.012, 6, low ? 32 : 64]} />
          <meshPhysicalMaterial
            color="white"
            transmission={0.75}
            roughness={0.1}
            thickness={0.1}
          />
        </mesh>
      ))}
      {!low &&
        [
          [0.33, 0.9, 0.5],
          [-0.27, -0.9, 0.53],
          [0.48, 0.42, 0.36],
          [-0.42, 1, 0.3],
          [0.3, -1.5, 0.52],
        ].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]} scale={[1, 1.35, 0.55]}>
            <sphereGeometry args={[0.036, 12, 8]} />
            <meshPhysicalMaterial
              color="white"
              transmission={1}
              roughness={0}
              thickness={0.05}
              ior={1.33}
            />
          </mesh>
        ))}
    </group>
  )
}

function Contents({ reduced, low }: { reduced: boolean; low: boolean }) {
  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => {
    if (!reduced) return
    const redraw = () => invalidate()
    window.addEventListener('scroll', redraw, { passive: true })
    window.addEventListener('resize', redraw, { passive: true })
    return () => {
      window.removeEventListener('scroll', redraw)
      window.removeEventListener('resize', redraw)
    }
  }, [reduced, invalidate])
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 6, 5]} intensity={1.8} />
      <directionalLight position={[-4, 2, -2]} intensity={1} color="#bfeaff" />
      <Environment resolution={low ? 128 : 256}>
        <Lightformer
          form="rect"
          intensity={1.5}
          position={[-3, 2, 4]}
          scale={[0.65, 8, 1]}
          rotation={[0, 0.4, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          position={[3, 0, 3]}
          scale={[0.35, 7, 1]}
          rotation={[0, -0.4, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.7}
          position={[0, 5, 0]}
          scale={[5, 3, 1]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </Environment>
      <Bottle reduced={reduced} low={low} />
      {!reduced && !low && (
        <Float speed={0.6} floatIntensity={0.25} rotationIntensity={0.1}>
          {[
            [-2, 1.1, -1],
            [2.5, 0.5, -1],
            [1.3, -1.8, -1],
          ].map((p, i) => (
            <mesh
              key={i}
              position={p as [number, number, number]}
              scale={[1, 1.2, 1]}
            >
              <sphereGeometry args={[0.05 + i * 0.014, 16, 16]} />
              <meshPhysicalMaterial
                transmission={1}
                roughness={0.03}
                thickness={0.2}
                ior={1.33}
                color="#d8faff"
              />
            </mesh>
          ))}
        </Float>
      )}
    </>
  )
}

export default function Scene({ reduced }: { reduced: boolean }) {
  const [failed, setFailed] = useState(false)
  const [low, setLow] = useState(
    window.innerWidth < 768 || (navigator.hardwareConcurrency || 4) <= 4,
  )
  const [visible, setVisible] = useState(!document.hidden)
  useEffect(() => {
    const visibility = () => setVisible(!document.hidden)
    const scroll = () => {
      const main = document.querySelector('main')
      setVisible(
        !document.hidden && !!main && main.getBoundingClientRect().bottom > 0,
      )
    }
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('scroll', scroll, { passive: true })
    try {
      const c = document.createElement('canvas')
      if (!c.getContext('webgl2')) setFailed(true)
    } catch {
      setFailed(true)
    }
    return () => {
      document.removeEventListener('visibilitychange', visibility)
      window.removeEventListener('scroll', scroll)
    }
  }, [])
  if (failed) return <FallbackScene />
  return (
    <div className="fixed-bottle" aria-hidden="true">
      <Canvas
        frameloop={visible ? (reduced ? 'demand' : 'always') : 'never'}
        dpr={low ? 1 : Math.min(devicePixelRatio, 1.5)}
        camera={{ position: [0, 0, 9], fov: 34 }}
        gl={{
          alpha: true,
          antialias: !low,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1
          const context = gl.getContext()
          const info = context.getExtension('WEBGL_debug_renderer_info')
          if (
            info &&
            /swiftshader|llvmpipe|software/i.test(
              context.getParameter(info.UNMASKED_RENDERER_WEBGL),
            )
          )
            setLow(true)
          gl.domElement.addEventListener(
            'webglcontextlost',
            () => setFailed(true),
            { once: true },
          )
        }}
      >
        <PerformanceMonitor
          onDecline={() => setLow(true)}
          flipflops={1}
          onFallback={() => setLow(true)}
        >
          <Contents reduced={reduced} low={low} />
        </PerformanceMonitor>
      </Canvas>
    </div>
  )
}
