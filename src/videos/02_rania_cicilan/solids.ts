// Solids for the checkers (x0, x1, y0, y1, z0, z1, name). Everything the people could walk into: the house wall and the long table behind them.
type Box = [number, number, number, number, number, number, string];
export const SOLIDS: Box[] = [
  [-9, 9, 0, 4, -4.5, -4.2, 'bldg house'],
  [-3.6, 3.6, 0, 0.74, -2.3, -1.5, 'table buffet'],
];
export const LOGIC_SOLIDS: Box[] = SOLIDS;
export const GATE_WAIVERS: {key: string; kind: string; why: string}[] = [];
