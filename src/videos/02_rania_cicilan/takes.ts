// Camera for "Calonnya Cicilan": one take per shot. Rules from references/03_CAMERA_GRAMMAR.md: a slow push-in on every shot, a new angle every cut,
// close-ups for the reactions, one dead-air wide on "Semua diam", inserts for the objects (cup, nota, signs).
import {K, type Take, type Kick, type Whip, type Flash, type Props, type Size} from '../../engine/camera/takes_api';
import {SHOT_REAL as R} from './timeline';
import {INSERT_AT} from './world';
const ALL = ['nenek', 'budi', 'dewi', 'rina', 'rania', 'katering'];
const t = (n: string, sub: string | string[], size: Size, az: number, el: number, fov: number, o: Record<string, any> = {}): Take =>
  ({name: n, why: n, keys: [K(R[n], sub, size, az, el, fov, o)]});
const ins = (n: string, id: string, size: Size = 'CU', fov = 32, push = 1.06): Take => t(n, 'prop:' + id, size, 0, 0, fov, {push});
export const PROPS: Props = Object.fromEntries(Object.entries(INSERT_AT).map(([k, v]) => [k, [v.c, v.r]]));
export const TAKES: Take[] = [
  // cold open: the same framing three times (Lebaran, nikahan, arisan), then the dotted THR envelope
  t('open1', 'rina', 'CU', 0, 4, 34, {push: 1.08}), t('open2', 'rina', 'CU', 0, 4, 34, {push: 1.08}), t('open3', 'rina', 'CU', 0, 4, 34, {push: 1.08}),
  ins('thr', 'thr', 'CU', 34, 1.05),
  t('door', 'rania', 'MS', -14, 6, 40, {push: 1.08}),
  t('wide1', ALL, 'WS', 0, 9, 46, {push: 1.05}),
  t('nenek1', 'nenek', 'MCU', 10, 4, 36, {push: 1.07}),
  t('rania1', 'rania', 'MS', -12, 4, 38, {push: 1.07}),
  t('two1', ['rina', 'rania'], 'MS', 14, 5, 40, {push: 1.05}),
  t('rina1', 'rina', 'CU', -10, 3, 34, {push: 1.09}),
  t('rania2', 'rania', 'CU', 8, 3, 34, {push: 1.07}),
  t('dewi1', 'dewi', 'MS', 12, 4, 38, {push: 1.05}),
  t('dewi2', 'dewi', 'CU', -8, 3, 34, {push: 1.07}),
  t('rania3', 'rania', 'CU', 0, 2, 32, {push: 1.2}),                       // the held smile, slow push
  t('budi1', 'budi', 'MS', -12, 4, 38, {push: 1.05}),
  t('budi2', 'budi', 'CU', 10, 3, 34, {push: 1.08}),
  t('rina2', 'rina', 'MS', -8, 4, 38, {push: 1.1}),
  t('rina3', 'rina', 'CU', 6, 3, 32, {push: 1.12}),
  ins('tea1', 'cup', 'CU', 30, 1.12),
  t('rania4', 'rania', 'MS', 10, 6, 38, {push: 1.05}),
  ins('tally', 'tally', 'CU', 34, 1.05),
  t('rania5', 'rania', 'CU', -6, 3, 34, {push: 1.06}),
  t('rina4', 'rina', 'MS', 0, 4, 38, {push: 1.2}),                          // lunges in
  t('rina5', 'rina', 'CU', 0, 2, 30, {push: 1.25}),
  t('wide2', ALL, 'WS', 0, 10, 46, {push: 1.03}),                           // dead air: everyone frozen
  ins('tea2', 'cup', 'CU', 30, 1.0),
  t('rania6', 'rania', 'CU', 8, 3, 34, {push: 1.07}),
  t('rina6', 'rina', 'CU', -8, 3, 34, {push: 1.08}),
  t('rania7', 'rania', 'CU', 0, 2, 32, {push: 1.12}),
  ins('sign1', 'sign', 'CU', 34, 1.08), ins('sign2', 'sign', 'CU', 34, 1.08), ins('sign3', 'sign', 'CU', 34, 1.08),
  t('rania8', 'rania', 'MS', 10, 4, 38, {push: 1.05}),
  t('wide3', ALL, 'WS', 0, 9, 46, {push: 1.06}),                            // everyone turns to the caterer
  ins('nota', 'nota', 'CU', 30, 1.08),
  t('rania9', 'rania', 'CU', -6, 2, 32, {push: 1.08}),
  t('rania10', 'rania', 'CU', 6, 2, 32, {push: 1.04}),
  ins('cal', 'cal', 'CU', 34, 1.05),
  t('dewi3', 'dewi', 'CU', 0, 3, 34, {push: 1.05}),
  t('budi3', 'budi', 'MS', 8, 4, 38, {push: 1.05}),
  t('two2', ['nenek', 'rania'], 'MS', -12, 5, 40, {push: 1.05}),
  t('wide4', ALL, 'WS', 0, 9, 46, {push: 1.04}),
  ins('bub', 'bub', 'CU', 34, 1.04),
  t('two3', ['rina', 'rania'], 'MS', 0, 4, 40, {push: 1.05}),
];
export const KICKS: Kick[] = [20.15, 38.95, 42.1, 55.05, 56.65, 58.4, 80.45, 85.2, 100.7].map((x, i) => ({t: x, a: [0.5, 0.5, 0.7, 1.2, 1, 1.3, 0.6, 0.4, 0.8][i], z: 0.012}));
export const WHIPS: Whip[] = [];
export const FLASHES: Flash[] = [];
