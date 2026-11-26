// Pure data shared by set / stage / takes (no three.js here, so the checkers can import it cheaply).
import type {V3} from '../../engine/core/clock';
/** the six people stand in one row in front of the house (x, metres; z = 0); spacing 0.95 m */
export const X = {nenek: -2.375, budi: -1.425, dewi: -0.475, rina: 0.475, rania: 1.425, katering: 2.375};
export type Cast = keyof typeof X;
export const CAST = Object.keys(X) as Cast[];
/** inserts = tiny stages far away from the party (object close-ups: THR envelope, cup, tally card, signs, nota, calendar, question bubble) */
export const INSERT_AT: Record<string, {c: V3; r: V3}> = {
  thr: {c: [20, 1.3, 0], r: [0.7, 0.95, 0.05]},
  cup: {c: [28, 0.98, 0], r: [0.42, 0.34, 0.1]},
  tally: {c: [36, 1.25, 0], r: [0.55, 0.8, 0.05]},
  sign: {c: [44, 1.25, 0], r: [0.7, 0.5, 0.05]},
  nota: {c: [52, 1.25, 0], r: [0.5, 0.7, 0.05]},
  cal: {c: [60, 1.25, 0], r: [0.7, 0.7, 0.05]},
  bub: {c: [68, 1.25, 0], r: [0.75, 0.5, 0.05]},
};
/** shot name -> insert id (shots without people) */
export const INSERT_SHOT: Record<string, string> = {thr: 'thr', tea1: 'cup', tea2: 'cup', tally: 'tally', sign1: 'sign', sign2: 'sign', sign3: 'sign', nota: 'nota', cal: 'cal', bub: 'bub'};
