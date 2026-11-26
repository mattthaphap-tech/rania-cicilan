// Set for "Calonnya Cicilan": a yard in front of a house (Nenek's 75th birthday) + seven tiny insert stages far to the right (objects: THR envelope,
// cup, tally card, signs, nota, calendar, question bubble). Flat toon materials, canvas-painted signs. No external files.
import React from 'react';
import * as THREE from 'three';
import {lookToon, type Tod} from '../../engine/look/look';
import {shotAt, cl, ease, pop} from '../../engine/core/clock';
import type {Stage} from './stage';
import {X, INSERT_AT, INSERT_SHOT} from './world';

export const AUDIO: {voice: string | null; bed: string | null} = {voice: 'rania/mix.mp3', bed: null};
export const useSetData = () => null;
type P = {d: unknown; f: number; st: Stage; cam: THREE.Vector3; vel: (THREE.Vector3 | null)[]; tod: Tod};

// ---------- tiny helpers: cached materials + painted textures ----------
const MATS = new Map<string, THREE.Material>();
const toon = (c: string) => { let m = MATS.get('t' + c); if (!m) { m = lookToon({color: c}); MATS.set('t' + c, m); } return m; };
const flat = (c: string) => { let m = MATS.get('f' + c); if (!m) { m = new THREE.MeshBasicMaterial({color: c}); MATS.set('f' + c, m); } return m; };
const TEX = new Map<string, THREE.CanvasTexture>();
type G = CanvasRenderingContext2D;
function tex(key: string, w: number, h: number, draw: (g: G, w: number, h: number) => void) {
  let t = TEX.get(key);
  if (!t) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!, w, h); t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; TEX.set(key, t); }
  return t;
}
const INK = '#241726', FONT = 'Impact, "Arial Black", "Helvetica Neue", sans-serif';
const rr = (g: G, x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
const label = (g: G, s: string, x: number, y: number, size: number, fill = INK, stroke = '') => {
  g.font = `${size}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (stroke) { g.lineWidth = size * 0.16; g.strokeStyle = stroke; g.lineJoin = 'round'; g.strokeText(s, x, y); }
  g.fillStyle = fill; g.fillText(s, x, y);
};
const lines = (g: G, s: string, x: number, y: number, size: number, fill = INK, stroke = '') => { const L = s.split('\n'); L.forEach((l, i) => label(g, l, x, y + (i - (L.length - 1) / 2) * size * 1.05, size, fill, stroke)); };

/** a flat picture plane (unlit, alpha) */
const Pic: React.FC<{map: THREE.Texture; w: number; h: number; pos: [number, number, number]; s?: number; rz?: number; add?: boolean; op?: number}> = ({map, w, h, pos, s = 1, rz = 0, add, op = 1}) => (
  <mesh position={pos} rotation={[0, 0, rz]} scale={[s, s, 1]} renderOrder={5}>
    <planeGeometry args={[w, h]} />
    <meshBasicMaterial map={map} transparent opacity={op} depthWrite={false} toneMapped={false} blending={add ? THREE.AdditiveBlending : THREE.NormalBlending} />
  </mesh>
);
const Box: React.FC<{p: [number, number, number]; s: [number, number, number]; c: string; shadow?: boolean}> = ({p, s, c, shadow = true}) => (
  <mesh position={p} material={toon(c)} castShadow={shadow} receiveShadow><boxGeometry args={s} /></mesh>
);
const Cyl: React.FC<{p: [number, number, number]; r: number; h: number; c: string; r2?: number}> = ({p, r, h, c, r2}) => (
  <mesh position={p} material={toon(c)} castShadow receiveShadow><cylinderGeometry args={[r2 ?? r, r, h, 28]} /></mesh>
);

// ---------- painted pictures ----------
const bubbleTex = (txt: string, dotted: boolean, key = '') => tex('bub:' + txt + dotted + key, 512, 512, (g) => {
  g.lineWidth = 16; g.strokeStyle = INK; g.fillStyle = '#fff'; if (dotted) g.setLineDash([26, 22]);
  g.beginPath(); g.ellipse(256, 230, 220, 190, 0, 0, 7); g.fill(); g.stroke(); g.setLineDash([]);
  g.beginPath(); g.moveTo(130, 380); g.lineTo(86, 470); g.lineTo(220, 410); g.closePath(); g.fillStyle = '#fff'; g.fill(); g.lineWidth = dotted ? 0 : 16; if (!dotted) g.stroke();
  lines(g, txt, 256, 230, txt.length > 3 ? 78 : 230, dotted ? '#9a7b3a' : INK);
});
const envelopeTex = tex('thr', 512, 512, (g) => {
  g.lineWidth = 14; g.strokeStyle = INK; g.setLineDash([26, 22]); g.fillStyle = '#fffdf2';
  g.beginPath(); g.ellipse(256, 240, 232, 214, 0, 0, 7); g.fill(); g.stroke(); g.setLineDash([]);
  g.lineWidth = 12; rr(g, 120, 150, 272, 176, 22); g.fillStyle = '#f7e7b8'; g.fill(); g.stroke();
  g.beginPath(); g.moveTo(124, 158); g.lineTo(256, 256); g.lineTo(388, 158); g.stroke();
  g.beginPath(); g.arc(256, 258, 22, 0, 7); g.fillStyle = '#d0332f'; g.fill(); g.lineWidth = 6; g.stroke(); label(g, 'THR', 256, 306, 46, '#b2391f'); label(g, '(mungkin)', 256, 392, 54, '#9a7b3a');
});
const signTex = (txt: string) => tex('sign:' + txt, 768, 512, (g, w, h) => { rr(g, 24, 24, w - 48, h - 48, 40); g.fillStyle = '#fffaf0'; g.fill(); g.lineWidth = 18; g.strokeStyle = INK; g.stroke(); lines(g, txt, w / 2, h / 2, txt.includes('\n') ? 150 : 170, INK); });
const bannerTex = (txt: string) => tex('banner:' + txt, 1536, 256, (g, w, h) => { rr(g, 8, 20, w - 16, h - 40, 34); g.fillStyle = '#fffaf0'; g.fill(); g.lineWidth = 12; g.strokeStyle = INK; g.stroke(); label(g, txt, w / 2, h / 2 + 6, 128, '#c0392b'); });
const cardTex = (n: number) => tex('tally:' + n, 512, 768, (g) => {
  g.lineWidth = 16; g.strokeStyle = INK; rr(g, 30, 30, 452, 708, 44); g.fillStyle = '#ffffff'; g.fill(); g.stroke();
  g.beginPath(); g.ellipse(256, 80, 38, 16, 0, 0, 7); g.fillStyle = '#cfd6dc'; g.fill(); g.lineWidth = 8; g.stroke();
  label(g, 'RANIA', 256, 190, 110, '#2f8f8a'); g.fillStyle = '#e6edf0'; g.fillRect(80, 270, 352, 6);
  g.lineWidth = 16; g.strokeStyle = '#c0392b'; g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const grp = Math.floor(i / 5), k = i % 5, x0 = 90 + (grp % 2) * 190, y0 = 330 + Math.floor(grp / 2) * 120;
    if (k < 4) { g.beginPath(); g.moveTo(x0 + k * 38, y0); g.lineTo(x0 + k * 38, y0 + 90); g.stroke(); } else { g.beginPath(); g.moveTo(x0 - 14, y0 + 78); g.lineTo(x0 + 140, y0 + 6); g.stroke(); } }
  label(g, String(n), 256, 650, 120, INK);
});
const notaTex = tex('nota', 512, 768, (g) => {
  g.beginPath(); g.moveTo(40, 30); for (let i = 0; i <= 12; i++) g.lineTo(40 + i * 36, i % 2 ? 30 : 56); g.lineTo(472, 720); for (let i = 12; i >= 0; i--) g.lineTo(40 + i * 36, i % 2 ? 744 : 718); g.closePath();
  g.fillStyle = '#fffdf6'; g.fill(); g.lineWidth = 12; g.strokeStyle = INK; g.stroke();
  label(g, 'NOTA', 256, 120, 96, INK); g.fillStyle = '#d5d0c4';
  for (const y of [190, 250, 310, 370]) { g.fillRect(80, y, 270, 14); g.fillRect(380, y, 60, 14); }
  g.fillRect(80, 430, 352, 8); label(g, 'LUNAS', 256, 520, 84, '#2a9d5a'); label(g, 'a.n. RANIA', 256, 640, 84, '#c0392b');
});
const haloTex = tex('halo', 256, 256, (g) => { const r = g.createRadialGradient(128, 128, 10, 128, 128, 128); r.addColorStop(0, 'rgba(255,214,120,1)'); r.addColorStop(0.45, 'rgba(255,170,60,.55)'); r.addColorStop(1, 'rgba(255,170,60,0)'); g.fillStyle = r; g.fillRect(0, 0, 256, 256); });
const calTex = (n: number) => tex('cal:' + n, 768, 768, (g, w) => {
  g.lineWidth = 16; g.strokeStyle = INK; rr(g, 24, 24, 720, 720, 40); g.fillStyle = '#fffaf0'; g.fill(); g.stroke(); label(g, 'TIAP BULAN', 384, 120, 110, '#c0392b');
  for (let i = 0; i < 12; i++) { const x = 90 + (i % 4) * 170, y = 230 + Math.floor(i / 4) * 160; rr(g, x, y, 130, 120, 16); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
    if (i < n) { g.lineWidth = 18; g.strokeStyle = '#2a9d5a'; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + 28, y + 62); g.lineTo(x + 56, y + 92); g.lineTo(x + 104, y + 28); g.stroke(); } }
  void w;
});
const strikeTex = (struck: boolean) => tex('strike:' + struck, 1024, 512, (g) => {
  g.lineWidth = 16; g.strokeStyle = INK; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(512, 230, 470, 200, 0, 0, 7); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(250, 390); g.lineTo(190, 490); g.lineTo(360, 410); g.closePath(); g.fill(); g.stroke();
  label(g, 'kapan nikah?', 512, 230, 150, INK);
  if (struck) { g.lineWidth = 26; g.strokeStyle = '#c0392b'; g.lineCap = 'round'; g.beginPath(); g.moveTo(110, 300); g.lineTo(920, 150); g.stroke(); }
});

// ---------- the world tint of the three cold-open gatherings ----------
const WORLDS: Record<string, {wall: string; ground: string; text: string; ball: [string, string, string]}> = {
  open1: {wall: '#3f9a6a', ground: '#7fb77a', text: 'LEBARAN', ball: ['#f2b234', '#fff3c4', '#2f6f73']},
  open2: {wall: '#e87aa8', ground: '#d9c9a8', text: 'NIKAHAN', ball: ['#ffffff', '#ffd1e1', '#f2b234']},
  open3: {wall: '#f0a040', ground: '#b9d6a0', text: 'ARISAN', ball: ['#e4467f', '#7a4fb0', '#2f8f8a']},
};
const DAY = {wall: '#f2e2c0', ground: '#8fc274', text: 'SELAMAT ULANG TAHUN NENEK  75', ball: ['#e4467f', '#f2b234', '#2f8f8a'] as [string, string, string]};

const Yard: React.FC<{shot: string}> = ({shot}) => {
  const W = WORLDS[shot] ?? DAY;
  return (<>
    <mesh position={[0, -0.05, 0]} material={toon(W.ground)} receiveShadow><boxGeometry args={[400, 0.1, 400]} /></mesh>
    <Box p={[0, 0.005, -0.6]} s={[13, 0.01, 8]} c="#e8d8b8" shadow={false} />
    {/* house */}
    <Box p={[0, 2, -4.35]} s={[18, 4, 0.3]} c={W.wall} />
    <Box p={[0, 4.12, -4.35]} s={[18.4, 0.25, 0.5]} c="#9a4b2f" />
    <Box p={[-5.2, 1.9, -4.17]} s={[1.6, 1.5, 0.08]} c="#cfe8f2" /><Box p={[5.2, 1.9, -4.17]} s={[1.6, 1.5, 0.08]} c="#cfe8f2" />
    <Box p={[-5.2, 1.9, -4.12]} s={[0.08, 1.5, 0.06]} c="#7a5a3a" /><Box p={[5.2, 1.9, -4.12]} s={[0.08, 1.5, 0.06]} c="#7a5a3a" />
    <Box p={[-6.4, 1.1, -4.17]} s={[1.2, 2.2, 0.08]} c="#7a5a3a" />
    <Pic map={bannerTex(W.text)} w={5.6} h={0.95} pos={[0, 2.95, -4.14]} />
    {/* balloons */}
    {[-3.2, -2.6, -1.9, 1.9, 2.6, 3.2].map((x, i) => (
      <mesh key={i} position={[x, 3.3 + (i % 3) * 0.28, -3.9]} material={toon(W.ball[i % 3])} castShadow><sphereGeometry args={[0.26, 20, 16]} /></mesh>))}
    {/* buffet table with the tumpeng, the cake and a few dishes */}
    <Box p={[0, 0.37, -1.9]} s={[7.2, 0.74, 0.8]} c="#fff6e3" />
    <mesh position={[-1.2, 1.04, -1.9]} material={toon('#f2b234')} castShadow><coneGeometry args={[0.3, 0.6, 24]} /></mesh>
    <Cyl p={[-1.2, 0.78, -1.9]} r={0.38} h={0.05} c="#c8a46a" />
    <Cyl p={[0.9, 0.84, -1.9]} r={0.3} h={0.2} c="#f7b6cf" /><Cyl p={[0.9, 0.96, -1.9]} r={0.3} h={0.04} c="#ffffff" />
    <Box p={[0.82, 1.06, -1.9]} s={[0.025, 0.12, 0.025]} c="#2f8f8a" /><Box p={[0.98, 1.06, -1.9]} s={[0.025, 0.12, 0.025]} c="#d0332f" />
    {[-2.6, -2.0, 0.0, 0.4, 1.9, 2.5, 3.0].map((x, i) => <Cyl key={i} p={[x, 0.78, -1.9]} r={0.2} h={0.06} c={['#d0532f', '#2f8f8a', '#f2b234', '#e4467f', '#8fb89a', '#f7d8e4', '#d0532f'][i]} />)}
    {/* chairs behind the row */}
    {[-3.4, -1.2, 1.2, 3.4].map((x, i) => (<React.Fragment key={i}>
      <Box p={[x, 0.42, -3.1]} s={[0.5, 0.05, 0.5]} c={i % 2 ? '#e4467f' : '#2f8f8a'} /><Box p={[x, 0.72, -3.33]} s={[0.5, 0.55, 0.05]} c={i % 2 ? '#e4467f' : '#2f8f8a'} />
      {[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map(([a, b], j) => <Box key={j} p={[x + a, 0.2, -3.1 + b]} s={[0.04, 0.4, 0.04]} c="#4a4a58" />)}
    </React.Fragment>))}
  </>);
};

const QMark: React.FC<{t: number}> = ({t}) => {
  const starts = [0.45, 1.95, 2.95], i = starts.findIndex((s, k) => t >= s && t < (k < 2 ? starts[k + 1] : 3.5));
  if (i < 0) return null;
  const k = pop(cl((t - starts[i]) / 0.28));
  return <Pic map={bubbleTex('?', false)} w={0.5} h={0.5} pos={[X.rina + 0.24, 1.42, 0.3]} s={k} />;
};

const NotaSmall: React.FC<{t: number}> = ({t}) => (t >= 76.9 && t < 80.4 ? <Pic map={notaTex} w={0.14} h={0.21} pos={[X.katering + 0.2, 0.62, 0.12]} /> : null);

// ---------- the inserts ----------
const INS = (id: string) => INSERT_AT[id].c;
const Backdrop: React.FC<{x: number; color: string}> = ({x, color}) => <mesh position={[x, 5, -1.3]} material={flat(color)}><planeGeometry args={[7.6, 14]} /></mesh>;
const Inserts: React.FC<{t: number}> = ({t}) => {
  const shot = shotAt(t * 30).name, cur = INSERT_SHOT[shot];
  const thr = INS('thr'), cup = INS('cup'), tal = INS('tally'), sig = INS('sign'), not = INS('nota'), cal = INS('cal'), bub = INS('bub');
  // signs: TENDA / KATERING / SOUND SYSTEM
  const sg = t < 73.55 ? ['TENDA', '#ffd9a0'] : t < 74.35 ? ['KATERING', '#cfe8e4'] : ['SOUND\nSYSTEM', '#d9d2f2'];
  const sgStart = t < 73.55 ? 72.7 : t < 74.35 ? 73.55 : 74.35;
  const tick = [0, 1, 2, 3, 4, 5, 6].filter((i) => t >= 48.2 + i * 0.36).length;
  const stir = shot === 'tea1' ? t * 6.5 : 1.2;
  const glow = ease(cl((t - 80.5) / 0.7)), notaK = pop(cl((t - 80.45) / 0.5));
  const nCal = Math.min(12, Math.max(0, Math.floor((t - 87.3) / 0.11)));
  const struck = t >= 100.35;
  if (!cur) return null;
  return (<>
    {cur === 'thr' && <>
      <Backdrop x={thr[0]} color="#ffe9b8" />
      <Pic map={bubbleTex('?', false)} w={0.8} h={0.8} pos={[thr[0], 1.85, 0]} s={pop(cl((t - 3.55) / 0.3))} />
      <Pic map={envelopeTex} w={1.2} h={1.2} pos={[thr[0], 0.85, 0]} s={pop(cl((t - 5.3) / 0.35)) * (0.97 + 0.03 * Math.sin(t * 5))} rz={0.05 * Math.sin(t * 3)} />
    </>}
    {cur === 'cup' && <>
      <Backdrop x={cup[0]} color={shot === 'tea1' ? '#cfe8e4' : '#d4dfe4'} />
      <Box p={[cup[0], 0.86, 0]} s={[1.6, 0.06, 1.2]} c="#b98a5a" />
      <Cyl p={[cup[0], 0.91, 0]} r={0.2} h={0.02} c="#ffffff" />
      <Cyl p={[cup[0], 0.99, 0]} r={0.12} r2={0.095} h={0.14} c="#ffffff" />
      <Cyl p={[cup[0], 1.055, 0]} r={0.1} h={0.012} c="#b8864a" />
      <group position={[cup[0], 1.06, 0]} rotation={[0, stir, 0]}>
        <mesh position={[0.045, 0.04, 0]} rotation={[0, 0, -0.35]} material={toon('#c9ccd4')} castShadow><cylinderGeometry args={[0.007, 0.007, 0.26, 8]} /></mesh>
        <mesh position={[0.0, -0.035, 0]} material={toon('#c9ccd4')}><sphereGeometry args={[0.02, 12, 8]} /></mesh>
      </group>
    </>}
    {cur === 'tally' && <><Backdrop x={tal[0]} color="#cfe8e4" /><Pic map={cardTex(tick)} w={0.95} h={1.43} pos={[tal[0], 1.25, 0]} s={1 + 0.04 * Math.sin(t * 9) * (tick > 0 ? 1 : 0)} /></>}
    {cur === 'sign' && <><Backdrop x={sig[0]} color={sg[1]} /><Pic map={signTex(sg[0])} w={1.5} h={1.0} pos={[sig[0], 1.25, 0]} s={pop(cl((t - sgStart) / 0.25))} rz={0.03 * Math.sin(t * 4)} /></>}
    {cur === 'nota' && <>
      <Backdrop x={not[0]} color="#3b2f4a" />
      <Pic map={haloTex} w={2.6} h={2.6} pos={[not[0], 1.25, -0.05]} s={0.6 + 0.6 * glow} op={glow} add />
      <Pic map={notaTex} w={0.8} h={1.2} pos={[not[0], 1.25, 0]} s={notaK * (1 + 0.015 * Math.sin(t * 6) * glow)} />
    </>}
    {cur === 'cal' && <><Backdrop x={cal[0]} color="#e9d9b8" /><Pic map={calTex(nCal)} w={1.3} h={1.3} pos={[cal[0], 1.25, 0]} s={pop(cl((t - 87.2) / 0.25))} /></>}
    {cur === 'bub' && <><Backdrop x={bub[0]} color="#ffe9b8" /><Pic map={strikeTex(struck)} w={1.5} h={0.75} pos={[bub[0], 1.25, 0]} s={pop(cl((t - 99.75) / 0.3))} rz={-0.04} /></>}
  </>);
};

export const SetBefore: React.FC<P> = ({f}) => {
  const t = f / 30, shot = shotAt(f).name;
  return (<>
    <Yard shot={shot} />
    <QMark t={t} />
    <NotaSmall t={t} />
    <Inserts t={t} />
  </>);
};
export const SetAfter: React.FC<P> = () => null;
