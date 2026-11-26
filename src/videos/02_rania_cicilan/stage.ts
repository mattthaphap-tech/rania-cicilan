// Staging for "Calonnya Cicilan": who stands where and what they do, per frame. The staging clock = the voice clock (identity timeline).
import {TOTAL, shotAt} from '../../engine/core/clock';
import {seq, type PersonP, type ActName} from '../../engine/chars/rig';
import type {Expr} from '../../engine/chars/charparts';
import {autoGaze} from '../../engine/core/staging';
import type {CarP, MeterP, Things} from '../../engine/kits/downtown/street';
import type {CartP} from '../../engine/kits/grocery/store';
import {SPEECH} from './timeline';
import {X, CAST, INSERT_SHOT, type Cast} from './world';
export {TOTAL, shotAt};
export type Stage = {people: PersonP[]; carts: CartP[]; extra: string[]; cars: CarP[]; meters: MeterP[]; things: Things; clock: number; nStoryCars: number};

type Trk = [number, ActName, Expr][];   // [seconds, action, expression]
const TR: Record<Cast, Trk> = {
  rania: [[0, 'idle', 'neutral'], [6.2, 'tired', 'tired'], [17.7, 'idle', 'tired'], [20.9, 'idle', 'fake'], [22.3, 'shrug', 'fake'], [24.2, 'idle', 'fake'], [41.9, 'idle', 'tired'],
    [52.4, 'idle', 'neutral'], [62.8, 'idle', 'smirk'], [71, 'present', 'neutral'], [76.8, 'idle', 'smirk'], [83, 'idle', 'smug'], [86.3, 'proud', 'proud'], [88.9, 'idle', 'smug'],
    [93.8, 'idle', 'happy']],
  rina: [[0, 'idle', 'surprised'], [6.2, 'idle', 'smug'], [17.7, 'idle', 'surprised'], [20.9, 'idle', 'smug'], [37.2, 'idle', 'surprised'], [44.4, 'idle', 'smug'], [52.4, 'idle', 'surprised'],
    [58.94, 'idle', 'shock'], [66, 'idle', 'smug'], [69, 'idle', 'shock'], [93.8, 'idle', 'neutral'], [97.1, 'idle', 'smirk'], [101.6, 'idle', 'worried']],
  dewi: [[0, 'idle', 'neutral'], [24.2, 'idle', 'smug'], [28.5, 'idle', 'neutral'], [58.94, 'idle', 'shock'], [88.9, 'idle', 'worried'], [91.5, 'idle', 'shock'], [97.1, 'idle', 'smirk']],
  budi: [[0, 'idle', 'neutral'], [32.2, 'idle', 'smug'], [37.2, 'idle', 'neutral'], [58.94, 'idle', 'shock'], [91.4, 'idle', 'neutral'], [97.1, 'idle', 'smirk']],
  nenek: [[0, 'idle', 'happy'], [93.8, 'proud', 'proud'], [97.1, 'idle', 'happy']],
  katering: [[0, 'idle', 'worried']],
};
const FR = (k: Trk) => k.map(([s, a, e]) => [Math.round(s * 30), a, e] as [number, ActName, Expr]);
const TRF = Object.fromEntries(CAST.map((w) => [w, FR(TR[w])])) as Record<Cast, [number, ActName, Expr][]>;
const speaking = (who: string, t: number) => SPEECH.some(([w, a, b]) => w === who && t >= a && t < b);
/** Rania looks into the lens (deadpan to the viewer) during these seconds */
const RANIA_CAM: [number, number][] = [[28.5, 32.2], [41.9, 52.4], [58.94, 60.5], [62.8, 66], [83, 88.9], [101.6, 105]];
const inAny = (t: number, L: [number, number][]) => L.some(([a, b]) => t >= a && t < b);

export function stage(f: number): Stage {
  const s = shotAt(f), t = f / 30, P: PersonP[] = [];
  const who: Cast[] = s.name.startsWith('open') ? ['rina'] : INSERT_SHOT[s.name] ? [] : CAST;
  for (const w of who) {
    const talk = speaking(w, t) || (s.name.startsWith('open') && w === 'rina');
    const sq = seq(f, TRF[w], 8);
    const p: PersonP = {who: w, p: [X[w], 0, 0], ...sq, talk, seed: CAST.indexOf(w) * 7 + 3};
    if (talk && (sq.act === 'idle' || sq.act === undefined)) p.act = 'talk';
    if (w === 'katering') p.sweat = true;
    // lunge: "Calonnya mana?" Tante Rina leans into the lens
    if (w === 'rina' && t >= 52.4 && t < 58.94) p.p = [X.rina, 0, 0.5 * Math.min(1, (t - 52.4) / 2.2)];
    // gaze
    if (s.name.startsWith('open')) p.gaze = 'cam';
    else if (w === 'rania') p.gaze = inAny(t, RANIA_CAM) ? 'cam' : [X.rina, 1.1, 0];
    else if (t >= 77.2 && t < 80.4) p.gaze = [X.katering, 1.1, 0];
    else if (w === 'rina' && s.name === 'two3') p.gaze = [X.rania, 1.1, 0];
    else p.gaze = [X.rania, 1.1, 0];
    P.push(p);
  }
  autoGaze(P, []);
  return {people: P, carts: [], extra: [], cars: [], meters: [], things: {}, clock: 9, nStoryCars: 0};
}
