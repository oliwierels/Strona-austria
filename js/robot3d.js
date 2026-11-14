
(() => {
  'use strict';
  const html = document.documentElement;
  const scenaRobot = document.querySelector('[data-scena="robot"]');
  if (!scenaRobot) return;
  const sekcjaRobot = document.getElementById('robot');
  const scenaWystep = document.querySelector('[data-scena="wystep"]');
  const wystep = document.getElementById('wystep');
  const ruchMq = matchMedia('(prefers-reduced-motion: reduce)');
  let reduce = ruchMq.matches;
  const lekki = !!(navigator.connection && navigator.connection.saveData) || (navigator.hardwareConcurrency || 8) <= 2;

  const canvas = document.createElement('canvas');
  canvas.className = 'robot3d';
  canvas.setAttribute('aria-hidden', 'true');
  let gl = null;
  try {
    gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: true, stencil: false,
      premultipliedAlpha: true, powerPreference: lekki ? 'low-power' : 'high-performance' });
  } catch (e) { gl = null; }
  const bez3d = () => { html.classList.add('bez-3d'); html.dataset.robot = 'brak'; canvas.remove(); };
  if (!gl) { bez3d(); return; }

  /* ——— Matematyka: macierze 3×3 wierszowe (kinematyka), 4×4 kolumnowe (GL) ——— */
  const mnoz3 = (a, b) => {
    const r = new Array(9);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
    return r;
  };
  const razy3 = (m, v) => [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];
  const obrotOs = (o, k) => {
    const c = Math.cos(k), s = Math.sin(k), t = 1 - c, [x, y, z] = o;
    return [t * x * x + c, t * x * y - s * z, t * x * z + s * y, t * x * y + s * z, t * y * y + c, t * y * z - s * x, t * x * z - s * y, t * y * z + s * x, t * z * z + c];
  };
  const kwaternion = (m, q, o) => {
    const tr = m[0] + m[4] + m[8];
    let x, y, z, w;
    if (tr > 0) { const s = Math.sqrt(tr + 1) * 2; w = s / 4; x = (m[7] - m[5]) / s; y = (m[2] - m[6]) / s; z = (m[3] - m[1]) / s; }
    else if (m[0] > m[4] && m[0] > m[8]) { const s = Math.sqrt(1 + m[0] - m[4] - m[8]) * 2; w = (m[7] - m[5]) / s; x = s / 4; y = (m[1] + m[3]) / s; z = (m[2] + m[6]) / s; }
    else if (m[4] > m[8]) { const s = Math.sqrt(1 + m[4] - m[0] - m[8]) * 2; w = (m[2] - m[6]) / s; x = (m[1] + m[3]) / s; y = s / 4; z = (m[5] + m[7]) / s; }
    else { const s = Math.sqrt(1 + m[8] - m[0] - m[4]) * 2; w = (m[3] - m[1]) / s; x = (m[2] + m[6]) / s; y = (m[5] + m[7]) / s; z = s / 4; }
    q[o] = x; q[o + 1] = y; q[o + 2] = z; q[o + 3] = w;
  };
  const m4 = () => new Float32Array(16);
  const m4mnoz = (a, b) => {
    const r = m4();
    for (let c = 0; c < 4; c++) for (let w = 0; w < 4; w++) r[c * 4 + w] = a[w] * b[c * 4] + a[4 + w] * b[c * 4 + 1] + a[8 + w] * b[c * 4 + 2] + a[12 + w] * b[c * 4 + 3];
    return r;
  };
  const m4persp = (fov, near, far) => {
    const f = 1 / Math.tan(fov / 2), r = m4();
    r[0] = f; r[5] = f; r[10] = (far + near) / (near - far); r[11] = -1; r[14] = 2 * far * near / (near - far);
    return r;
  };
  const m4widok = (oko, cel) => {
    const z = [oko[0] - cel[0], oko[1] - cel[1], oko[2] - cel[2]];
    const dz = Math.hypot(...z); z[0] /= dz; z[1] /= dz; z[2] /= dz;
    const x = [z[2], 0, -z[0]]; const dx = Math.hypot(...x); x[0] /= dx; x[2] /= dx;
    const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
    const r = m4();
    r[0] = x[0]; r[4] = x[1]; r[8] = x[2]; r[1] = y[0]; r[5] = y[1]; r[9] = y[2]; r[2] = z[0]; r[6] = z[1]; r[10] = z[2];
    r[12] = -(x[0] * oko[0] + x[1] * oko[1] + x[2] * oko[2]);
    r[13] = -(y[0] * oko[0] + y[1] * oko[1] + y[2] * oko[2]);
    r[14] = -(z[0] * oko[0] + z[1] * oko[1] + z[2] * oko[2]);
    r[15] = 1;
    return r;
  };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const gladko = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const hash = (i) => { const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };


  const VS = `
attribute vec3 aPos; attribute vec2 aNrm; attribute float aSeg; attribute float aLos;
uniform vec4 uQ[26]; uniform vec4 uT[26];
uniform float uSkala, uMorf, uCzas, uPx, uSkan, uRozb, uZaslona, uLogo, uLed, uJasnosc, uTors;
uniform mat4 uM, uVP; uniform vec3 uKam, uBarwa; uniform vec4 uBlask;
varying vec3 vK;
vec3 obr(vec4 q, vec3 v) { return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v); }
vec3 okt(vec2 e) {
  vec3 v = vec3(e, 1.0 - abs(e.x) - abs(e.y));
  if (v.z < 0.0) v.xy = (1.0 - abs(v.yx)) * vec2(v.x >= 0.0 ? 1.0 : -1.0, v.y >= 0.0 ? 1.0 : -1.0);
  return normalize(v);
}
void main() {
  float k = aSeg;
  float kraw = step(127.5, k); k -= 128.0 * kraw;
  float logo = step(63.5, k); k -= 64.0 * logo;
  float led = step(31.5, k); k -= 32.0 * led;
  int i = int(k + 0.5);
  vec3 lp = aPos * uSkala;
  vec3 wp = obr(uQ[i], lp) + uT[i].xyz;
  vec3 wn = obr(uQ[i], okt(aNrm));
  vec4 sw = uM * vec4(wp, 1.0);
  vec3 n = normalize(mat3(uM) * wn);
  vec4 c = uVP * sw;
  vec3 ndcR = c.xyz / c.w;
  float a1 = aLos * 6.2832, a2 = fract(aLos * 7.31) * 6.2832;
  vec2 chmura = vec2(cos(a1), sin(a1)) * (0.35 + 0.9 * fract(aLos * 3.7)) * vec2(1.3, 1.0) + vec2(0.0, 0.1);
  float t = clamp(uMorf * 1.7 - aLos * 0.7, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  vec2 p = mix(ndcR.xy, chmura, t);
  p += sin(3.14159 * t) * uRozb * vec2(cos(a2 + uCzas * 0.7), sin(a2 * 1.3 + uCzas * 0.5)) * (0.08 + 0.22 * fract(aLos * 5.3));
  float z = mix(clamp(ndcR.z, -1.0, 1.0), 0.0, t) + uZaslona * 0.004 - (logo + led) * 0.002;
  gl_Position = vec4(p, z, 1.0);
  vec3 V = normalize(uKam - sw.xyz);
  float nv = dot(n, V);
  float swiatlo = max(dot(n, normalize(vec3(-0.45, 0.75, 0.55))), 0.0);
  float kontur = pow(1.0 - abs(nv), 2.2);
  float przod = mix(0.55, 1.0, smoothstep(-0.2, 0.4, nv));
  float skan = exp(-pow((wp.z - uSkan) / 0.012, 2.0)) * 0.6;
  float blask = uBlask.w * (1.0 - smoothstep(0.0, 0.11, distance(wp, uBlask.xyz)));
  float j = (0.16 + 0.6 * swiatlo + 0.55 * kontur + 0.55 * kraw) * przod + 0.85 * skan + 0.9 * blask;
  if (i == 25) j = 0.22 * (1.0 - smoothstep(0.35, 0.62, length(wp.xy)));
  if (abs(k - uTors) < 0.5 && logo < 0.5 && lp.x > 0.04 && abs(lp.y) < 0.11 && lp.z > 0.11 && lp.z < 0.222) j *= 0.28;
  vec3 kol = vec3(j * uJasnosc) * uBarwa;
  if (i != 25) kol += vec3(1.0, 0.24, 0.8) * (0.5 * kontur * przod + 0.55 * skan) * uBarwa.z * uJasnosc;
  kol = mix(kol, uBarwa * (1.05 + 0.5 * uLogo), logo);
  kol = mix(kol, vec3(0.05, 0.62, 1.0) * uLed, led);
  vK = mix(kol, vec3(0.95) * uBarwa, t);
  float rozm = uPx * mix(1.0, 0.85, kraw) * (1.0 + 0.8 * skan + 0.6 * blask + 0.1 * led) * (3.3 / c.w) * (1.0 + uZaslona * 1.6);
  gl_PointSize = mix(rozm, uPx * 1.15, t);
}`;
  const FS = `
precision mediump float;
varying vec3 vK; uniform float uAlfa;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r = dot(d, d);
  if (r > 0.25) discard;
  float a = (1.0 - r * 4.0) * uAlfa * 0.75;
  gl_FragColor = vec4(min(vK, vec3(1.6)) * a, a);
}`;
  const shader = (typ, zrodlo) => {
    const s = gl.createShader(typ); gl.shaderSource(s, zrodlo); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (e) { bez3d(); return; }
  const U = {};
  for (const n of ['uQ', 'uT', 'uSkala', 'uMorf', 'uCzas', 'uPx', 'uSkan', 'uRozb', 'uM', 'uVP', 'uKam', 'uBlask', 'uBarwa', 'uAlfa', 'uZaslona', 'uLogo', 'uLed', 'uJasnosc', 'uTors']) U[n] = gl.getUniformLocation(prog, n);
  const A = {};
  for (const n of ['aPos', 'aNrm', 'aSeg', 'aLos']) A[n] = gl.getAttribLocation(prog, n);

  /* ——— Stan robota ——— */
  let S = null;           // segmenty z pliku
  let q = null, qCel = null;
  const IDX = {};
  let N = 0, podeszwa = null;
  const kw = new Float32Array(26 * 4), tr = new Float32Array(26 * 4);
  const swiat = [];

  const kinematyka = () => {
    for (let i = 0; i < S.length; i++) {
      const s = S[i];
      if (s.rodzic < 0) { swiat[i] = [[1, 0, 0, 0, 1, 0, 0, 0, 1], [0, 0, 0]]; continue; }
      const [Rp, tp] = swiat[s.rodzic];
      const R = mnoz3(mnoz3(Rp, s.R), obrotOs(s.os, q[i]));
      const t0 = razy3(Rp, s.t);
      swiat[i] = [R, [t0[0] + tp[0], t0[1] + tp[1], t0[2] + tp[2]]];
    }
    const st = [IDX.left_ankle_roll_joint, IDX.right_ankle_roll_joint].map((i) => {
      const [R, t] = swiat[i]; const p = razy3(R, podeszwa[i]);
      return [p[0] + t[0], p[1] + t[1], p[2] + t[2]];
    });
    const dx = -(st[0][0] + st[1][0]) / 2, dy = -(st[0][1] + st[1][1]) / 2, dz = -Math.min(st[0][2], st[1][2]);
    for (let i = 0; i < S.length; i++) {
      const [R, t] = swiat[i];
      t[0] += dx; t[1] += dy; t[2] += dz;
      kwaternion(R, kw, i * 4);
      tr[i * 4] = t[0]; tr[i * 4 + 1] = t[1]; tr[i * 4 + 2] = t[2];
    }
    kw[25 * 4 + 3] = 1;
  };
  const punktSwiata = (i, lokalny) => { const [R, t] = swiat[i]; const p = razy3(R, lokalny); return [p[0] + t[0], p[1] + t[1], p[2] + t[2]]; };


  const BAZA = {
    left_hip_pitch_joint: -0.14, right_hip_pitch_joint: -0.14, left_knee_joint: 0.32, right_knee_joint: 0.32,
    left_ankle_pitch_joint: -0.18, right_ankle_pitch_joint: -0.18,
    left_hip_roll_joint: 0.02, right_hip_roll_joint: -0.02, left_ankle_roll_joint: -0.02, right_ankle_roll_joint: 0.02,
    left_shoulder_pitch_joint: 0.18, right_shoulder_pitch_joint: 0.18, left_shoulder_roll_joint: 0.16, right_shoulder_roll_joint: -0.16,
    left_shoulder_yaw_joint: 0.05, right_shoulder_yaw_joint: -0.05, left_elbow_joint: 1.15, right_elbow_joint: 1.15,
    left_wrist_roll_joint: 0, right_wrist_roll_joint: 0, waist_yaw_joint: 0,
  };
  const POZY = {
    stoi: (t) => ({ left_elbow_joint: 1.15 + 0.03 * Math.sin(t * 1.3), right_elbow_joint: 1.15 + 0.03 * Math.sin(t * 1.3 + 1) }),
    macha: (t) => ({ right_shoulder_pitch_joint: -1.0, right_shoulder_roll_joint: -0.7, right_shoulder_yaw_joint: -0.05 + 0.34 * Math.sin(t * 6.5),
      right_elbow_joint: 0.1, waist_yaw_joint: -0.1 }),
    wskazuje: () => ({ right_shoulder_pitch_joint: -0.85, right_shoulder_roll_joint: -0.85, right_shoulder_yaw_joint: 0,
      right_elbow_joint: 1.45, waist_yaw_joint: -0.32 }),
    wita: (t) => ({ left_shoulder_pitch_joint: -0.45, right_shoulder_pitch_joint: -0.45, left_shoulder_roll_joint: 0.72 + 0.05 * Math.sin(t * 1.6),
      right_shoulder_roll_joint: -0.72 - 0.05 * Math.sin(t * 1.6), left_shoulder_yaw_joint: 0.3, right_shoulder_yaw_joint: -0.3,
      left_elbow_joint: 0.95, right_elbow_joint: 0.95 }),
    mowi: (t) => ({ left_shoulder_pitch_joint: -0.2 + 0.1 * Math.sin(t * 2.6), right_shoulder_pitch_joint: -0.22 + 0.12 * Math.sin(t * 2.1 + 1.4),
      left_shoulder_roll_joint: 0.25, right_shoulder_roll_joint: -0.25,
      left_elbow_joint: 0.3 + 0.15 * Math.sin(t * 2.6 + 0.5), right_elbow_joint: 0.3 + 0.18 * Math.sin(t * 2.1 + 2),
      left_wrist_roll_joint: -0.5 + 0.3 * Math.sin(t * 3), right_wrist_roll_joint: 0.5 + 0.3 * Math.sin(t * 2.7),
      waist_yaw_joint: 0.12 * Math.sin(t * 0.9) }),
    przedstawia: (t) => ({ right_shoulder_pitch_joint: -1.25, right_shoulder_roll_joint: -0.6, right_elbow_joint: 1.45,
      right_wrist_roll_joint: 0.6, waist_yaw_joint: -0.25 + 0.04 * Math.sin(t * 1.2), left_elbow_joint: 1.0 }),
    tanczy: (t) => {
      const b = t * 4.2, s = Math.sin(b), k = Math.abs(Math.sin(b / 2));
      return { left_shoulder_pitch_joint: -0.9 - 0.5 * s, right_shoulder_pitch_joint: -0.9 + 0.5 * s,
        left_shoulder_roll_joint: 0.5 + 0.25 * s, right_shoulder_roll_joint: -0.5 + 0.25 * s,
        left_elbow_joint: 0.2 + 0.3 * k, right_elbow_joint: 0.2 + 0.3 * (1 - k), waist_yaw_joint: 0.35 * s,
        left_knee_joint: 0.32 + 0.22 * k, right_knee_joint: 0.32 + 0.22 * k,
        left_hip_pitch_joint: -0.14 - 0.11 * k, right_hip_pitch_joint: -0.14 - 0.11 * k,
        left_ankle_pitch_joint: -0.18 - 0.11 * k, right_ankle_pitch_joint: -0.18 - 0.11 * k };
    },
    buziak: (t) => {
      const f = gladko(1.0, 1.45, t);
      return { right_shoulder_pitch_joint: lerp(-1.15, -1.3, f), right_shoulder_roll_joint: lerp(-0.3, -0.65, f),
        right_shoulder_yaw_joint: lerp(0.48, 0, f), right_elbow_joint: lerp(0.45, 1.45, f), right_wrist_roll_joint: 0.3,
        waist_yaw_joint: lerp(0.08, -0.15, f) };
    },
    branding: (t) => ({ left_shoulder_pitch_joint: 0.3, right_shoulder_pitch_joint: 0.3, left_shoulder_roll_joint: 0.35,
      right_shoulder_roll_joint: -0.35, left_elbow_joint: 1.35, right_elbow_joint: 1.35, waist_yaw_joint: 0.05 * Math.sin(t) }),
    chodzi: (t) => {
      const f = Math.sin(t * 5.6), L = Math.max(0, f), R = Math.max(0, -f);
      const k = 0.07 * f;
      return { left_hip_pitch_joint: -0.14 - 0.85 * L, left_knee_joint: 0.32 + 1.45 * L, left_ankle_pitch_joint: -0.18 - 0.6 * L,
        right_hip_pitch_joint: -0.14 - 0.85 * R, right_knee_joint: 0.32 + 1.45 * R, right_ankle_pitch_joint: -0.18 - 0.6 * R,
        left_hip_roll_joint: 0.02 + k, right_hip_roll_joint: -0.02 + k, left_ankle_roll_joint: -0.02 - k, right_ankle_roll_joint: 0.02 - k,
        left_shoulder_pitch_joint: 0.18 + 0.6 * f, right_shoulder_pitch_joint: 0.18 - 0.6 * f,
        left_elbow_joint: 0.9, right_elbow_joint: 0.9, waist_yaw_joint: 0.14 * f };
    },
    obrot: () => ({ left_shoulder_roll_joint: 0.55, right_shoulder_roll_joint: -0.55, left_elbow_joint: 0.8, right_elbow_joint: 0.8 }),
    zdjecie: (t) => ({ left_shoulder_pitch_joint: -2.6, right_shoulder_pitch_joint: -2.6, left_shoulder_roll_joint: 0.5 + 0.06 * Math.sin(t * 3),
      right_shoulder_roll_joint: -0.5 - 0.06 * Math.sin(t * 3), left_elbow_joint: 1.4, right_elbow_joint: 1.4 }),
  };


  const WERSJA_DANYCH = '4ef53e7e';
  const dpr = Math.min(devicePixelRatio || 1, lekki ? 1.5 : 2);
  let skala = 1;

  const dodatki = (pos, seg, n, ts) => {
    const K = 0.004, Y0 = -0.24, Z0 = -0.05, NY = 120, NZ = 160, mapa = new Float32Array(NY * NZ).fill(-9);
    for (let i = 0; i < n; i++) {
      if ((seg[i] & 31) !== ts || seg[i] >= 128) continue;
      const x = pos[i * 3] / 32767 * skala, y = pos[i * 3 + 1] / 32767 * skala, z = pos[i * 3 + 2] / 32767 * skala;
      if (x < 0.02) continue;
      const a = Math.floor((y - Y0) / K), b = Math.floor((z - Z0) / K);
      if (a < 0 || b < 0 || a >= NY || b >= NZ) continue;
      if (x > mapa[b * NY + a]) mapa[b * NY + a] = x;
    }
    const przod = (y, z, maxR = 4) => {
      const a = Math.floor((y - Y0) / K), b = Math.floor((z - Z0) / K);
      for (let r = 0; r < maxR; r++) {
        let m = -9;
        for (let db = -r; db <= r; db++) for (let da = -r; da <= r; da++) {
          const aa = a + da, bb = b + db;
          if (aa >= 0 && bb >= 0 && aa < NY && bb < NZ) m = Math.max(m, mapa[bb * NY + aa]);
        }
        if (m > -9) return m;
      }
      return null;
    };
    const pkt = [];
    const zLed = 0.418, krokL = lekki ? 0.0009 : 0.0006;
    let s0 = 0, s2 = 0, s4 = 0, sx = 0, sx2 = 0, ile = 0;
    for (let y = -0.044; y <= 0.044; y += 0.004) {
      const x = przod(y, zLed, 2);
      if (x === null) continue;
      const y2 = y * y; s0++; s2 += y2; s4 += y2 * y2; sx += x; sx2 += x * y2; ile++;
    }
    const det = s0 * s4 - s2 * s2;
    const kLed = ile > 3 && det ? clamp((s0 * sx2 - s2 * sx) / det, -6, 0) : -2;
    const a0 = ile ? (sx - kLed * s2) / s0 : 0.053;
    for (let y = -0.048; y <= 0.048; y += krokL) for (const dz of [-0.0014, 0, 0.0014]) {
      if (dz && Math.abs(y) > 0.045) continue;
      pkt.push([a0 + kLed * y * y + 0.003, y, zLed + dz, 32 + ts]);
    }
    // napis „TWOJE / LOGO” na piersi
    const c = document.createElement('canvas'); c.width = 360; c.height = 220;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.fillStyle = '#fff'; g.font = '700 96px "Space Grotesk", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText("IHR", 180, 62); g.fillText("LOGO", 180, 160);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const krok = lekki ? 3 : 2, szer = 0.19, wys = szer * c.height / c.width, zLogo = 0.165;
    for (let py = 0; py < c.height; py += krok) for (let px = (py / krok) % 2 ? krok / 2 : 0; px < c.width; px += krok) {
      if (d[(Math.floor(py) * c.width + Math.floor(px)) * 4 + 3] < 150) continue;
      const y = (px / c.width - 0.5) * szer, z = zLogo + (0.5 - py / c.height) * wys; // +y (lewa strona robota) = prawa strona ekranu
      const x = przod(y, z);
      if (x !== null) pkt.push([x + 0.004, y, z, 64 + ts]);
    }
    return pkt;
  };

  const wczytaj = async () => {
    const r = await fetch((lekki ? 'robot/g1-lekki.bin' : 'robot/g1.bin') + '?v=' + WERSJA_DANYCH, { priority: 'low' });
    if (!r.ok) throw new Error('robot: ' + r.status);
    const dane = await r.arrayBuffer();
    const dv = new DataView(dane);
    const dl = dv.getUint32(0, true);
    const nag = JSON.parse(new TextDecoder().decode(new Uint8Array(dane, 4, dl)));
    const n = nag.n, o = 4 + dl;
    skala = nag.skala;
    const pos = new Int16Array(dane, o, n * 3);
    const nrm = new Int8Array(dane, o + n * 6, n * 2);
    const seg = new Uint8Array(n);
    let k0 = 0;
    for (const [si, ilePow, ileKraw] of nag.bloki) { seg.fill(si, k0, k0 + ilePow); seg.fill(si | 128, k0 + ilePow, k0 + ilePow + ileKraw); k0 += ilePow + ileKraw; }
    S = nag.segmenty.map((s) => {
      const m = s.macierz || [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0]];
      return { nazwa: s.nazwa, rodzic: s.rodzic, staw: s.staw, os: s.os || [0, 0, 1], min: s.min ?? -9, max: s.max ?? 9,
        R: [m[0][0], m[0][1], m[0][2], m[1][0], m[1][1], m[1][2], m[2][0], m[2][1], m[2][2]], t: [m[0][3], m[1][3], m[2][3]] };
    });
    S.forEach((s, i) => { if (s.staw) IDX[s.staw] = i; });
    q = new Float32Array(S.length); qCel = new Float32Array(S.length);
    for (const [k, v] of Object.entries(BAZA)) q[IDX[k]] = v;

    podeszwa = {};
    for (const nazwa of ['left_ankle_roll_joint', 'right_ankle_roll_joint']) {
      const si = IDX[nazwa]; let zmin = 32767, sx = 0, sy = 0, ile = 0;
      for (let i = 0; i < n; i++) if ((seg[i] & 127) === si) zmin = Math.min(zmin, pos[i * 3 + 2]);
      for (let i = 0; i < n; i++) if ((seg[i] & 127) === si && pos[i * 3 + 2] < zmin + 600) { sx += pos[i * 3]; sy += pos[i * 3 + 1]; ile++; }
      podeszwa[si] = [sx / ile / 32767 * skala, sy / ile / 32767 * skala, zmin / 32767 * skala];
    }

    try { await document.fonts.load('600 92px "Space Grotesk"'); } catch (e) { /* font systemowy */ }
    const ekstra = dodatki(pos, seg, n, IDX.waist_yaw_joint);

    const kola = [];
    for (const [r, ile] of [[0.26, 150], [0.36, 220], [0.46, 300], [0.56, 360]]) {
      for (let i = 0; i < ile; i++) { const a = (i / ile) * Math.PI * 2; kola.push(Math.cos(a) * r, Math.sin(a) * r * 0.999, 0); }
    }
    for (let i = 0; i < 72; i++) { const a = (i / 72) * Math.PI * 2; for (let k = 0; k < 6; k++) { const r = 0.58 + k * 0.012; kola.push(Math.cos(a) * r, Math.sin(a) * r, 0); } }
    const nP = kola.length / 3, nE = ekstra.length;
    N = n + nE + nP;
    const P16 = new Int16Array(N * 3); P16.set(pos);
    const N8 = new Int8Array(N * 2); N8.set(nrm);
    const S8 = new Uint8Array(N); S8.set(seg);
    ekstra.forEach(([x, y, z, s], i) => {
      const j = n + i;
      P16[j * 3] = Math.round(x / skala * 32767); P16[j * 3 + 1] = Math.round(y / skala * 32767); P16[j * 3 + 2] = Math.round(z / skala * 32767);
      N8[j * 2] = 127; N8[j * 2 + 1] = 0; // normalna do przodu (+x)
      S8[j] = s;
    });
    for (let i = 0; i < kola.length; i++) P16[(n + nE) * 3 + i] = Math.round(kola[i] / skala * 32767);
    S8.fill(25, n + nE);
    const los = new Float32Array(N);
    for (let i = 0; i < N; i++) los[i] = hash(i + 0.5);

    const bufor = (dane, atr, rozm, typ, norm) => {
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, dane, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(atr); gl.vertexAttribPointer(atr, rozm, typ, norm, 0, 0);
    };
    gl.useProgram(prog);
    bufor(P16, A.aPos, 3, gl.SHORT, true);
    bufor(N8, A.aNrm, 2, gl.BYTE, true);
    bufor(S8, A.aSeg, 1, gl.UNSIGNED_BYTE, false);
    bufor(los, A.aLos, 1, gl.FLOAT, false);
    gl.uniform1f(U.uSkala, skala);
    gl.uniform1f(U.uTors, IDX.waist_yaw_joint);
  };


  const mysz = { x: 0.5, y: 0.4, jest: false };
  let orbita = 0, orbitaV = 0, ciagnie = null, puszczono = -9;
  addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') { mysz.x = e.clientX / innerWidth; mysz.y = e.clientY / innerHeight; mysz.jest = true; } }, { passive: true });
  document.addEventListener('mouseleave', () => { mysz.jest = false; });
  scenaRobot.addEventListener('pointerdown', (e) => {
    if (reduce || e.button !== 0 || e.target.closest('button, a')) return;
    ciagnie = { id: e.pointerId, x: e.clientX, t: performance.now(), dx: 0 };
    scenaRobot.setPointerCapture(e.pointerId);
  });
  scenaRobot.addEventListener('pointermove', (e) => {
    if (!ciagnie || ciagnie.id !== e.pointerId) return;
    const dx = e.clientX - ciagnie.x, t = performance.now();
    orbita += dx * 0.008; orbitaV = dx * 0.008 / Math.max(0.008, (t - ciagnie.t) / 1000);
    ciagnie.x = e.clientX; ciagnie.t = t; ciagnie.dx += Math.abs(dx);
  });
  const pusc = (e) => {
    if (!ciagnie || ciagnie.id !== e.pointerId) return;
    if (ciagnie.dx < 6) polecenie('macha');
    ciagnie = null; puszczono = performance.now() / 1000;
  };
  scenaRobot.addEventListener('pointerup', pusc);
  scenaRobot.addEventListener('pointercancel', pusc);

  // Klasa ruch-stop na <html> (przyciski [data-ruch-przelacz], js/glowna.js) zatrzymuje robota i animacje kart.
  const pauzy = [document.getElementById('heroPauza')].filter(Boolean);
  const zatrzymany = () => reduce || html.classList.contains('ruch-stop') || pauzy.some((p) => p.getAttribute('aria-pressed') === 'true');

  /* ——— Polecenia: przyciski [data-robot-gest] i dymek z tekstem ——— */
  const dymek = document.getElementById('robotDymek');
  const MOWA = ["Grüß Gott! Ich spreche Deutsch und jede andere Sprache.",
    "Hello! Welcome to your event.",
    "Dzień dobry! Schön, Sie zu sehen.",
    "Laba diena! Machen wir ein Foto?",
    "Dobrý den! Ich komme zu Ihren Gästen.",
    "Bună ziua! Ich erzähle von Ihrem Unternehmen."];
  const TEKST = { macha: "Hallo! Schön, Sie zu sehen.",
    tanczy: "Musik, Maestro!",
    buziak: "Muah!",
    zdjecie: "Bitte lächeln!",
    chodzi: "Ich gehe zu Ihren Gästen!",
    obrot: "Sehen Sie mich von allen Seiten.",
    przedstawia: "Meine Damen und Herren — unser Redner!" };
  const CZAS = { macha: 2.6, tanczy: 4.5, buziak: 2.4, zdjecie: 3, mowi: 3.6, chodzi: 4, obrot: 2.4, przedstawia: 3 };
  const PROGRAM = ['macha', 'chodzi', 'mowi', 'tanczy', 'buziak', 'obrot', 'zdjecie', 'chodzi', 'przedstawia', 'tanczy', 'mowi', 'buziak'];
  let programNr = 0, nastepnyAuto = 0;
  let gestNazwa = null, gestDo = 0, gestOd = 0, dbgKaty = null, dbgOrbita = null, mowaNr = 0, zegar = 0;
  const gest = (nazwa, czas) => { if (zatrzymany()) return; gestNazwa = nazwa; gestOd = zegar; gestDo = zegar + czas; obudz(); };
  const polecenie = (nazwa, zPrzycisku = false) => {
    if (zatrzymany() || !POZY[nazwa]) return;
    gest(nazwa, CZAS[nazwa] || 2.5);
    if (nazwa === 'obrot') { orbitaV = 19; puszczono = performance.now() / 1000 + 0.6; }
    nastepnyAuto = gestDo + (zPrzycisku ? 3 : 0.9 + Math.random() * 0.8);
    if (dymek && (zPrzycisku || innerWidth >= 768)) {
      dymek.textContent = nazwa === 'mowi' ? MOWA[mowaNr++ % MOWA.length] : (TEKST[nazwa] || '');
      dymek.dataset.do = String(gestDo);
    }
    if (zPrzycisku && window.dataLayer) window.dataLayer.push({ event: 'robot_gest', robot_gest: nazwa });
  };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-robot-gest]');
    if (!b) return;
    polecenie(b.dataset.robotGest, true);
  });


  let gotowy = false, morfAkt = 1;
  const rezyser = () => {
    const vh = innerHeight, vw = innerWidth;
    if (scenaWystep && scenaWystep.offsetParent !== null) {
      const rW = scenaWystep.getBoundingClientRect(), rs = wystep.getBoundingClientRect();
      if (rs.top < vh && rs.bottom > 0) {
        const widac = rs.top < vh * 0.5 && rs.bottom > vh * 0.5;
        return { rect: rW, pole: rW, morfCel: widac ? 0 : 1, poza: wystep.dataset.poza || 'wita', strefa: 'wystep' };
      }
    }
    const rs = sekcjaRobot.getBoundingClientRect();
    if (rs.bottom <= 0 || rs.top >= vh || scenaRobot.offsetParent === null) return { rect: null, morfCel: 1, strefa: 'nic' };
    const pole = scenaRobot.getBoundingClientRect();
    const p = clamp(-rs.top / Math.max(1, rs.height - vh), 0, 1);
    const widac = rs.top < vh * 0.4 && rs.bottom > vh * 0.6;
    const okno = vw < 768 ? 1.46 : 1.5;
    const pe = p * p * (3 - 2 * p) * 0.4 + p * 0.6;
    const pxm = Math.min(pole.height / okno, pole.width / 0.95), h = 1.42 * pxm;
    const cx = pole.left + pole.width / 2, cy = pole.top + pole.height / 2 + 0.02 * pxm;
    return { rect: { left: cx - h / 2, top: cy - h / 2, width: h, height: h }, pole, morfCel: widac ? 0 : 1,
      poza: null, strefa: 'robot', p, yaw: lerp(-0.35, 0.55, pe) };
  };

  /* ——— Rysowanie ——— */
  let W = 0, H = 0;
  const rozmiar = () => {
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (w !== W || h !== H) { W = canvas.width = w; H = canvas.height = h; }
  };
  const FOV = 24 * Math.PI / 180, ODL = 1.42 / (2 * Math.tan(FOV / 2));
  const OKO = [0, 0.7, ODL], CEL = [0, 0.66, 0];
  const PROJ = m4persp(FOV, 0.1, 20), WIDOK = m4widok(OKO, CEL), VP0 = m4mnoz(PROJ, WIDOK);
  const hud = [...document.querySelectorAll('[data-hud]')].map((el) => ({ el, scena: el.closest('[data-scena]'),
    pozy: (el.dataset.hudPoza || '').split(' ').filter(Boolean) }));
  const HUD_PKT = {
    glowa: ['waist_yaw_joint', [0.04, 0.09, 0.47]], twarz: ['waist_yaw_joint', [0.08, 0.06, 0.41]],
    piers: ['waist_yaw_joint', [0.1, 0.12, 0.17]], dlon: ['left_wrist_roll_joint', [0.08, 0.03, 0]],
    kolano: ['left_knee_joint', [0.06, 0.05, -0.12]], stopa: ['left_ankle_roll_joint', [0.12, 0.05, -0.02]],
  };
  const HUD_CZESC = { glowa: 'glowa', twarz: 'twarz', piers: 'piers', rece: 'dlon', nogi: 'kolano', stopy: 'stopa' };
  let ost = 0, wyglad = { alfa: 0 }, klatkaId = 0, dziala = false, lookX = 0, przywital = false;

  const klatka = (tms) => {
    klatkaId = 0;
    const t = tms / 1000, dt = Math.min(0.05, ost ? t - ost : 0.016); ost = t;
    const stoj = zatrzymany();
    if (!stoj) zegar += dt;
    let gestTrwa = gestNazwa && zegar < gestDo;
    const st = rezyser();
    rozmiar();
    const cr = canvas.getBoundingClientRect();

    if (reduce) morfAkt = st.morfCel;
    else if (st.morfCel < morfAkt) morfAkt = Math.max(st.morfCel, morfAkt - dt / 1.6);
    else morfAkt = Math.min(st.morfCel, morfAkt + dt / 2.2);
    const morf = morfAkt;
    if (st.strefa === 'robot' && morf < 0.05 && !stoj && !(gestNazwa && zegar < gestDo) && zegar >= nastepnyAuto) {
      polecenie(przywital ? PROGRAM[programNr++ % PROGRAM.length] : 'macha');
      if (!przywital) { przywital = true; programNr = 1; }
      gestTrwa = gestNazwa && zegar < gestDo;
    }
    wyglad.alfa = st.rect ? 1 - gladko(0.75, 1, morf) : 0;

    // pozy
    let poza = st.poza || 'stoi';
    if (st.strefa !== 'wystep') {
      if (gestTrwa) poza = gestNazwa;
      else if (gestNazwa && zegar >= gestDo) gestNazwa = null;
    }
    for (const [k, v] of Object.entries(BAZA)) qCel[IDX[k]] = v;
    const czas = stoj ? 0 : zegar;
    const nad = (POZY[poza] || POZY.stoi)(poza === gestNazwa && gestTrwa ? zegar - gestOd : czas);
    for (const [k, v] of Object.entries(nad)) qCel[IDX[k]] = v;
    if (dbgKaty) for (const [k, v] of Object.entries(dbgKaty)) qCel[IDX[k]] = v;
    if (!stoj) {
      const o = 0.025 * Math.sin(czas * 1.4);
      for (const s of ['left', 'right']) { qCel[IDX[s + '_knee_joint']] += o * 2; qCel[IDX[s + '_hip_pitch_joint']] -= o; qCel[IDX[s + '_ankle_pitch_joint']] -= o; }
    }
    const rr = st.rect || { left: 0, top: 0, width: 1, height: 1 };
    const sx = (rr.left + rr.width / 2) / innerWidth;
    const celLook = mysz.jest && !stoj && st.strefa === 'robot' && !gestTrwa ? clamp((mysz.x - sx) * 1.4, -0.7, 0.7) : 0;
    lookX += (celLook - lookX) * (1 - Math.exp(-dt * 4));
    qCel[IDX.waist_yaw_joint] += lookX * 0.8;
    const k = reduce ? 1 : 1 - Math.exp(-dt * (['tanczy', 'macha', 'mowi', 'buziak'].includes(poza) ? 14 : 6));
    for (let i = 0; i < S.length; i++) {
      const s = S[i]; if (!s.staw) continue;
      q[i] += (clamp(qCel[i], s.min, s.max) - q[i]) * k;
    }
    kinematyka();

    if (!ciagnie) {
      orbita += orbitaV * dt; orbitaV *= Math.exp(-dt * 3);
      if (t - puszczono > 1.2) { const cel0 = Math.round(orbita / (Math.PI * 2)) * Math.PI * 2; orbita += (cel0 - orbita) * (1 - Math.exp(-dt * 1.6)); }
    }
    const yaw = dbgOrbita ?? orbita + (reduce ? 0 : (st.yaw || 0)) + lookX * 0.35;

    const c = Math.cos(yaw), s = Math.sin(yaw);
    const M = m4();
    M[0] = s; M[2] = c; M[4] = c; M[6] = -s; M[9] = 1; M[15] = 1;
    const cx = ((rr.left - cr.left + rr.width / 2) / cr.width) * 2 - 1;
    const cy = 1 - ((rr.top - cr.top + rr.height / 2) / cr.height) * 2;
    const SH = m4(); SH[0] = rr.height / cr.width; SH[5] = rr.height / cr.height; SH[10] = 1; SH[15] = 1;
    const VP2 = m4mnoz(SH, VP0);
    for (let i = 0; i < 4; i++) { VP2[i * 4] += cx * VP0[i * 4 + 3]; VP2[i * 4 + 1] += cy * VP0[i * 4 + 3]; }

    gl.viewport(0, 0, W, H);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (wyglad.alfa > 0.004 && st.rect) {
      const po = st.pole, sk = W / cr.width;
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(Math.floor((po.left - cr.left) * sk), Math.floor((cr.bottom - po.bottom) * sk), Math.ceil(po.width * sk), Math.ceil(po.height * sk));
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(prog);
      gl.uniform4fv(U.uQ, kw); gl.uniform4fv(U.uT, tr);
      gl.uniformMatrix4fv(U.uM, false, M);
      gl.uniformMatrix4fv(U.uVP, false, VP2);
      gl.uniform3f(U.uKam, OKO[0], OKO[1], OKO[2]);
      gl.uniform1f(U.uMorf, morf);
      gl.uniform1f(U.uCzas, czas);
      gl.uniform1f(U.uRozb, reduce ? 0 : 1);
      gl.uniform1f(U.uSkan, stoj ? -1 : ((czas % 7) / 5.2) * 1.5 - 0.1);
      const branding = poza === 'branding';
      gl.uniform1f(U.uLogo, branding ? 1.2 + 0.6 * Math.sin(czas * 6) : 0.6);
      gl.uniform1f(U.uLed, stoj ? 1.1 : 1.0 + 0.25 * Math.sin(czas * 2.2) + (poza === 'mowi' ? 0.45 * Math.abs(Math.sin(czas * 9)) : 0));
      const [bStaw, bLok] = st.strefa === 'robot' ? HUD_PKT[HUD_CZESC[sekcjaRobot.dataset.czesc]] || [] : [];
      const pk = bLok ? punktSwiata(IDX[bStaw], bLok) : punktSwiata(IDX.waist_yaw_joint, [0.1, 0, 0.17]);
      gl.uniform4f(U.uBlask, pk[0], pk[1], pk[2], branding ? 0.35 : bLok ? 0.22 : 0);
      const px = clamp(rr.height / 820, 0.3, 1.3) * (lekki ? 2.5 : 2.4);
      gl.uniform1f(U.uPx, px * Math.pow(dpr, 0.85));
      gl.uniform1f(U.uAlfa, wyglad.alfa);
      gl.uniform1f(U.uJasnosc, st.strefa === 'robot' ? lerp(0.9, 1.45, clamp((rr.height - 250) / 450, 0, 1)) : 1.15);
      const sila = innerWidth < 768 ? 0.5 : 1; // telefon: srebrnoszary, nie jaskrawa biel
      gl.uniform3f(U.uBarwa, sila * 0.92, sila * 0.96, sila);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
      gl.colorMask(false, false, false, false);
      gl.uniform1f(U.uZaslona, 1);
      gl.drawArrays(gl.POINTS, 0, N);
      gl.colorMask(true, true, true, true);
      gl.depthMask(false);
      gl.uniform1f(U.uZaslona, 0);
      gl.drawArrays(gl.POINTS, 0, N);
      gl.depthMask(true);
      gl.disable(gl.SCISSOR_TEST);
    }

    const naEkran = (p) => {
      const v = [M[0] * p[0] + M[4] * p[1] + M[8] * p[2], M[1] * p[0] + M[5] * p[1] + M[9] * p[2], M[2] * p[0] + M[6] * p[1] + M[10] * p[2], 1];
      const cl = [0, 1, 3].map((r) => VP2[r] * v[0] + VP2[4 + r] * v[1] + VP2[8 + r] * v[2] + VP2[12 + r]);
      return [(cl[0] / cl[2] + 1) / 2 * cr.width + cr.left, (1 - cl[1] / cl[2]) / 2 * cr.height + cr.top];
    };
    const scenaTeraz = st.strefa === 'wystep' ? scenaWystep : st.strefa === 'robot' ? scenaRobot : null;
    const spokoj = morf < 0.05 && wyglad.alfa > 0.5;
    for (const h of hud) {
      const [staw, lok] = HUD_PKT[h.el.dataset.hud] || [];
      let pokaz = !!lok && spokoj && (!h.pozy.length || h.pozy.includes(poza));
      pokaz = pokaz && h.scena === scenaTeraz && (h.scena !== scenaRobot || HUD_CZESC[sekcjaRobot.dataset.czesc] === h.el.dataset.hud);
      let X = 0, Y = 0;
      if (pokaz) {
        [X, Y] = naEkran(punktSwiata(IDX[staw], lok));
        const r = h.scena.getBoundingClientRect(); X -= r.left; Y -= r.top;
        pokaz = Y > r.height * 0.03 && Y < r.height * 0.98 && X > 0 && X < r.width;
      }
      h.el.classList.toggle('hud--widoczny', pokaz);
      if (pokaz) {
        h.el.classList.toggle('hud--lewo', X > h.scena.clientWidth - 200);
        h.el.style.setProperty('--x', X.toFixed(1) + 'px'); h.el.style.setProperty('--y', Y.toFixed(1) + 'px');
      }
    }
    if (dymek) {
      const widac = gestTrwa && st.strefa === 'robot' && +dymek.dataset.do === gestDo && wyglad.alfa > 0.3;
      if (widac) {
        const [X, Y] = naEkran(punktSwiata(IDX.waist_yaw_joint, [0.05, -0.07, 0.42]));
        const w = dymek.offsetWidth, hD = dymek.offsetHeight;
        dymek.style.setProperty('--x', clamp(X - w - 16, 16, innerWidth - w - 16).toFixed(1) + 'px');
        dymek.style.setProperty('--y', clamp(Y - hD / 2, 88, innerHeight - hD - 16).toFixed(1) + 'px');
      }
      dymek.classList.toggle('dymek--widoczny', widac);
    }

    const dalej = !!st.rect && (wyglad.alfa > 0.004 || morfAkt !== st.morfCel);
    if (dalej && !document.hidden) planuj();
    else { dziala = false; canvas.style.visibility = 'hidden'; }
  };
  const planuj = () => { if (!klatkaId) klatkaId = requestAnimationFrame(klatka); };
  const obudz = () => {
    if (!gotowy) return;
    if (!dziala) { dziala = true; canvas.style.visibility = ''; ost = 0; }
    planuj();
  };
  addEventListener('scroll', obudz, { passive: true });
  addEventListener('resize', obudz);
  document.addEventListener('visibilitychange', obudz);
  addEventListener('pointermove', obudz, { passive: true });
  pauzy.forEach((p) => new MutationObserver(obudz).observe(p, { attributes: true, attributeFilter: ['aria-pressed'] }));
  new MutationObserver(obudz).observe(html, { attributes: true, attributeFilter: ['class'] });
  if (wystep) new MutationObserver(obudz).observe(wystep, { attributes: true, attributeFilter: ['data-poza'] });
  ruchMq.addEventListener?.('change', (e) => { reduce = e.matches; obudz(); });

  let rusza = false;
  const start = async () => {
    if (rusza) return;
    rusza = true;
    try { await wczytaj(); } catch (e) { bez3d(); return; }
    document.body.append(canvas);
    html.classList.add('z-3d');
    gotowy = true; dziala = true;
    html.dataset.robot = 'gotowy';
    planuj();
  };
  html.dataset.robot = 'czeka';
  const obserwuj = () => {
    if (!('IntersectionObserver' in window)) { start(); return; }
    const io = new IntersectionObserver((w) => { if (w.some((x) => x.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: '100% 0px' });
    [sekcjaRobot, wystep].filter(Boolean).forEach((e) => io.observe(e));
  };
  if (document.readyState === 'complete') obserwuj(); else addEventListener('load', obserwuj, { once: true });

  if (/[?&]robot-debug/.test(location.search)) {
    window.__robot = { POZY, BAZA, IDX: () => IDX, ustaw: (n) => { gestNazwa = n; gestDo = 1e9; obudz(); }, q: () => q,
      orbita: (v) => { dbgOrbita = v; obudz(); }, katy: (o) => { dbgKaty = o; obudz(); }, polecenie };
  }
})();
