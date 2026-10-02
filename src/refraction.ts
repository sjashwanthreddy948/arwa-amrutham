import * as THREE from 'three'

// HTML cannot be sampled by WebGL. A lightweight, locally drawn copy of the
// background and rear typography lets the physical material refract the scene.
// All real text remains semantic HTML; this texture is visual only.
export function createRefractionBackdrop() {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  let previous = -1000
  let dirty = true
  const mark = () => {
    dirty = true
  }
  const paint = (now: number) => {
    if (!dirty || now - previous < 90) return
    dirty = false
    previous = now
    const ratio = Math.min(1, 1024 / innerWidth)
    const width = Math.round(innerWidth * ratio),
      height = Math.round(innerHeight * ratio)
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('main > section'),
    )
    ctx.fillStyle = '#fafcfd'
    ctx.fillRect(0, 0, innerWidth, innerHeight)
    sections.forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.bottom < 0 || r.top > innerHeight) return
      const style = getComputedStyle(el)
      ctx.fillStyle = style.backgroundColor
      ctx.fillRect(0, r.top, innerWidth, r.height)
    })
    document
      .querySelectorAll<HTMLElement>(
        '.hero-pure,.hero-refresh,.orange-word,.water-title h2,.hours-title>span,.finale-word',
      )
      .forEach((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.bottom < 0 || rect.top > innerHeight) return
        const style = getComputedStyle(el)
        const size = parseFloat(style.fontSize)
        ctx.font = `${style.fontWeight} ${size}px Inter,Arial,sans-serif`
        ctx.letterSpacing =
          style.letterSpacing === 'normal' ? '0px' : style.letterSpacing
        ctx.textBaseline = 'alphabetic'
        ctx.fillStyle = style.color
        // Only single-line rear typography is reproduced. The multiline water
        // headline stays in HTML while the dark atmosphere refracts in the bottle.
        if (el.classList.contains('hero-pure'))
          ctx.fillText('PURE', rect.left, rect.bottom - size * 0.12)
        else if (!el.querySelector('br'))
          ctx.fillText(
            el.textContent || '',
            rect.left,
            rect.bottom - size * 0.12,
          )
      })
    texture.needsUpdate = true
  }
  return {
    texture,
    paint,
    start() {
      dirty = true
      window.addEventListener('scroll', mark, { passive: true })
      window.addEventListener('resize', mark, { passive: true })
      document.fonts.ready.then(mark)
    },
    stop() {
      window.removeEventListener('scroll', mark)
      window.removeEventListener('resize', mark)
    },
    dispose() {
      texture.dispose()
    },
  }
}

export function applyRefraction(
  material: THREE.MeshPhysicalMaterial,
  texture: THREE.Texture,
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.arwaBackdrop = { value: texture }
    const chunk = THREE.ShaderChunk.transmission_pars_fragment
      .replace(
        'uniform sampler2D transmissionSamplerMap;',
        'uniform sampler2D transmissionSamplerMap;\nuniform sampler2D arwaBackdrop;',
      )
      .replace(
        'return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );',
        `
        vec4 physicalSample = textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
        vec3 backdrop = pow(texture2D(arwaBackdrop, fragCoord.xy).rgb, vec3(2.2));
        return vec4(mix(physicalSample.rgb, backdrop * 1.4, 0.9), 1.0);
      `,
      )
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <transmission_pars_fragment>',
      chunk,
    )
  }
  material.customProgramCacheKey = () => 'arwa-refraction-v1'
}
