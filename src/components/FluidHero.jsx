import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

const VERTEX = `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT = `
  precision highp float;

  uniform vec3  iResolution;
  uniform vec2  iMouse;
  uniform float iTime;

  uniform vec3  uColor0;
  uniform vec3  uColor1;
  uniform vec3  uColor2;
  uniform vec3  uColor3;
  uniform vec3  uColor4;
  uniform int   uColorCount;

  uniform vec2  uFlow;
  uniform float uSpeed;
  uniform float uScale;
  uniform float uTurbulence;
  uniform float uFluidity;
  uniform float uRimWidth;
  uniform float uSharpness;
  uniform float uShimmer;
  uniform float uGlow;
  uniform float uOpacity;
  uniform float uMouseEnabled;
  uniform float uMouseStrength;
  uniform float uMouseRadius;

  varying vec2 vUv;

  #define PI 3.14159265

  vec3 palette(float h) {
    int count = uColorCount;
    if (count < 1) count = 1;
    int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
    if (idx <= 0) return uColor0;
    if (idx == 1) return uColor1;
    if (idx == 2) return uColor2;
    if (idx == 3) return uColor3;
    return uColor4;
  }

  float hash(vec3 p3) {
    p3 = fract(p3 * 0.1031);
    p3 += dot(p3, p3.zyx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float smin(float a, float b, float k) {
    float r = exp2(-a / k) + exp2(-b / k);
    return -k * log2(r);
  }

  float sinlerp(float a, float b, float w) {
    return mix(a, b, (sin(w * PI - PI / 2.0) + 1.0) / 2.0);
  }

  float vn(vec2 p, float s, float seed) {
    vec2 cellp = floor(p / s);
    vec2 relp = mod(p, s);
    float g1 = hash(vec3(cellp, seed));
    float g2 = hash(vec3(cellp.x + 1.0, cellp.y, seed));
    float g3 = hash(vec3(cellp.x + 1.0, cellp.y + 1.0, seed));
    float g4 = hash(vec3(cellp.x, cellp.y + 1.0, seed));
    float bx = sinlerp(g1, g2, relp.x / s);
    float tx = sinlerp(g4, g3, relp.x / s);
    return sinlerp(bx, tx, relp.y / s);
  }

  float dbn(vec2 p, float s, float seed) {
    float o = s / 2.0;
    float n0 = vn(p, s, seed);
    float n1 = vn(p + vec2(o, o), s, seed + 0.1);
    float n2 = vn(p + vec2(-o, o), s, seed + 0.2);
    float n3 = vn(p + vec2(o, -o), s, seed + 0.3);
    float n4 = vn(p + vec2(-o, -o), s, seed + 0.4);
    return (2.0 * n0 + 1.5 * n1 + 1.25 * n2 + 1.125 * n3 + n4) / 7.0;
  }

  void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    float ref = 700.0 / max(uScale, 0.05);
    vec2 p = fragCoord / iResolution.y * ref;

    float spd = 200.0 * uSpeed;
    float t = iTime;

    vec2 dir = uFlow;
    vec2 perp = vec2(-dir.y, dir.x);

    float distort1 = vn(p + perp * (t * spd), 60.0, 10.0) * 50.0 * uTurbulence;
    float distort2 = vn(p - perp * (t * spd), 120.0, 15.0) * 100.0 * uTurbulence;

    float peaks = dbn(p + distort1 + dir * (t * spd * 0.5), 40.0, 1.0);
    float peaks2 = dbn(p + distort2 - dir * (t * spd * 0.5), 40.0, 0.0);

    float mapeaks = smin(peaks, peaks2, max(uFluidity, 0.001));

    float mGlow = 0.0;
    if (uMouseEnabled > 0.5) {
      vec2 mp = iMouse / iResolution.y * ref;
      float md = length(p - mp) / ref;
      float rr = max(uMouseRadius, 0.02);
      mGlow = exp(-md * md / (rr * rr)) * uMouseStrength;
    }

    float band = (uRimWidth - abs((mapeaks - 0.4) * 2.0)) * 5.0;
    float ltn = clamp(band - vn(p + dir * (t * spd * 0.5), 60.0, 12.0) * uShimmer, 0.0, 1.0);
    ltn = pow(ltn, uSharpness) * uGlow;
    ltn *= clamp(1.0 - mGlow * 0.3, 0.0, 1.0);

    // Mouse influence adds extra glow color
    float mouseInfluence = mGlow * 0.6;

    float h = clamp(0.5 + (peaks - peaks2) * 0.8, 0.0, 1.0);
    vec3 col = palette(h);

    vec3 outc = col * (ltn + mouseInfluence);
    float a = clamp(max(outc.r, max(outc.g, outc.b)), 0.0, 1.0);
    fragColor = vec4(outc, a * uOpacity);
  }

  void main() {
    vec4 color;
    mainImage(color, vUv * iResolution.xy);
    gl_FragColor = color;
  }
`;

function hexToRGB(hex) {
  const c = hex.replace('#', '').padEnd(6, '0');
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  return [r, g, b];
}

export default function FluidHero({
  colors = ['#F3C8B8', '#AECBDA', '#E8A98F', '#8FB4C6', '#DCC495'],
  interactive = true,
  intensity = 1.8,
}) {
  const containerRef = useRef(null);
  const reduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (reduced.current) return;

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      alpha: true,
      antialias: true,
    });
    const gl = renderer.gl;
    const canvas = gl.canvas;
    gl.clearColor(0, 0, 0, 0);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const base = colors.slice(0, 5);
    const arr = [];
    for (let i = 0; i < 5; i++) arr.push(hexToRGB(base[Math.min(i, base.length - 1)]));

    const uniforms = {
      iResolution: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1] },
      iMouse: { value: [0, 0] },
      iTime: { value: 0 },
      uColor0: { value: arr[0] },
      uColor1: { value: arr[1] },
      uColor2: { value: arr[2] },
      uColor3: { value: arr[3] },
      uColor4: { value: arr[4] },
      uColorCount: { value: base.length },
      uFlow: { value: [0, -1] },
      uSpeed: { value: 0.28 },         // más lento = más elegante
      uScale: { value: 1.1 },          // más grande = más envolvente
      uTurbulence: { value: 1.1 },     // más turbulencia = más orgánico
      uFluidity: { value: 0.08 },
      uRimWidth: { value: 0.32 },      // bordes más amplios
      uSharpness: { value: 1.6 },
      uShimmer: { value: 0.8 },
      uGlow: { value: 2.2 * intensity }, // GLOW alto = MUY visible
      uOpacity: { value: Math.min(0.98, 0.88 * intensity) }, // casi opaco
      uMouseEnabled: { value: interactive ? 1 : 0 },
      uMouseStrength: { value: 1.8 },  // mouse más impactante
      uMouseRadius: { value: 0.45 },   // área de efecto mouse más grande
    };

    const program = new Program(gl, { vertex: VERTEX, fragment: FRAGMENT, uniforms });
    const geometry = new Triangle(gl);
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1];
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const mouseTarget = [0, 0];
    const mouseDampening = 0.12;
    let lastTime = 0;

    const setPointer = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const sc = renderer.dpr || 1;
      mouseTarget[0] = (clientX - rect.left) * sc;
      mouseTarget[1] = (rect.height - (clientY - rect.top)) * sc;
    };
    const onPointerMove = (e) => setPointer(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) setPointer(e.touches[0].clientX, e.touches[0].clientY);
    };

    if (interactive) {
      window.addEventListener('pointermove', onPointerMove);
      container.addEventListener('touchmove', onTouchMove, { passive: true });
    }

    let rafId;
    let isVisible = true;
    const onVisibility = () => { isVisible = document.visibilityState === 'visible'; };
    document.addEventListener('visibilitychange', onVisibility);

    const loop = (t) => {
      rafId = requestAnimationFrame(loop);
      if (!isVisible) return;
      uniforms.iTime.value = t * 0.001;
      if (mouseDampening > 0) {
        if (!lastTime) lastTime = t;
        const dt = (t - lastTime) / 1000;
        lastTime = t;
        const tau = Math.max(1e-4, mouseDampening);
        let factor = 1 - Math.exp(-dt / tau);
        if (factor > 1) factor = 1;
        const cur = uniforms.iMouse.value;
        cur[0] += (mouseTarget[0] - cur[0]) * factor;
        cur[1] += (mouseTarget[1] - cur[1]) * factor;
      } else {
        lastTime = t;
      }
      try {
        renderer.render({ scene: mesh });
      } catch (err) {
        console.error('FluidHero render error:', err);
      }
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', onVisibility);
      if (interactive) {
        window.removeEventListener('pointermove', onPointerMove);
        container.removeEventListener('touchmove', onTouchMove);
      }
      ro.disconnect();
      canvas.remove();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-auto"
      aria-hidden="true"
    />
  );
}
