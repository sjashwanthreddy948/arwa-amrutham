export function supportsHardwareWebGL() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2', {
      failIfMajorPerformanceCaveat: true,
    })
    if (!gl) return false
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = info
      ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
      : ''
    // Legacy DX10 GPUs can stall input while compiling transmission shaders.
    const hardware =
      !/swiftshader|llvmpipe|software|basic render|ps_4_|vs_4_/i.test(renderer)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return hardware
  } catch {
    return false
  }
}
