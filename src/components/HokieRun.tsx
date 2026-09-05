import React, { useCallback, useEffect, useRef, useState } from "react";
import '../assets/styles/HokieRun.scss';

/**
 * A HokieBird endless runner, in the shape of Chrome's offline dinosaur.
 *
 * The canvas is kept at a small fixed resolution and scaled up by CSS with
 * `image-rendering: pixelated`, which is what makes it look like pixel art
 * rather than smooth vector shapes at any screen size. Every coordinate below is
 * in that small space, so the numbers stay readable.
 */
const W = 600;
const H = 160;
const GROUND_Y = 132;
const BIRD_X = 48;

/** One sprite pixel, in canvas units. */
const PIXEL = 2;

const MAROON = '#861F41';
/** Darker maroon, used to separate the tail feathers from the body. */
const MAROON_DK = '#5e1530';
const ORANGE = '#E5751F';
/** The snood and wattle - the bits that stop it reading as a chicken. */
const RED = '#c8341f';

const INK: Record<string, string> = {
  M: MAROON, D: MAROON_DK, O: ORANGE, R: RED, W: '#ffffff',
};

/**
 * The HokieBird, half again as large as it was and with the features a turkey
 * actually has: a fanned tail with separated feathers, a snood hanging over the
 * beak, and a wattle at the throat. Without those it was a chicken.
 *
 * Everything above the legs, shared by both run frames.
 */
const BODY = [
  '.....DD.................',
  '....DMMD................',
  '...DMMMMD......MMMM.....',
  '..DMMDMMD.....MMMMMM....',
  '.DMMMDMMMD....MMMWMM....',
  '.DMMMDMMMD....MMMMMMOOO.',
  'DMMMMDMMMMD...MMMMMMOOOO',
  'DMMMDMMMMMD...MMMMMRR...',
  'DMMMDMMMMMD...MMMMRR....',
  '.DMMDMMMMMD..MMMMMR.....',
  '.DMMMMMMMMMD.MMMMM......',
  '..DMMMMMMMMMMMMMMM......',
  '...DMMMMMMMMMMMMMM......',
  '...MMMMMMMMMMMMMMMM.....',
  '..MMMMMMMMMMMMMMMMM.....',
  '..MMMMMMMMMMMMMMMM......',
  '...MMMMMMMMMMMMMMM......',
  '....MMMMMMMMMMMMM.......',
  '......MMMMMMMMM.........',
];

const LEGS = [
  [
    '.......OO...OO..........',
    '.......O.....O..........',
    '......OOO...OOO.........',
  ],
  [
    '.......OO...OO..........',
    '........O...O...........',
    '.......OOO.OOO..........',
  ],
];

/** Legs tucked while airborne, so a jump reads as a jump. */
const LEGS_JUMP = [
  '......OO.....OO.........',
  '.....OO.......OO........',
  '........................',
];

const BIRD_W = 24 * PIXEL;
const BIRD_H = 22 * PIXEL;

/**
 * A UVA Cavalier: wide plumed hat, sash, boots, sword held out. Nearly twice
 * the size it started at - at twelve rows he was a blue smudge, and the hat is
 * the thing that identifies him, so the hat needs room.
 *
 * Real UVA navy, which only works because the sky is now daylight. Against the
 * old night backdrop this exact colour was invisible.
 */
const CAV_INK: Record<string, string> = {
  N: '#232D4B', // coat
  O: '#F84C1E', // plume and sash
  F: '#f0dcc4', // face
  S: '#8f9bb5', // sword
  L: '#3d4d7d', // lit edge
};

const CAV = [
  '.......OOO........',
  '......OOOOO.......',
  '....NNNNNNNN......',
  '...NNNNNNNNNN.....',
  '..NNNNNNNNNNNN....',
  '.....FFFFF........',
  '.....FFFFF........',
  '......FFF.........',
  '....NNNNNNN.......',
  '...NNNNNNNNN......',
  '...NOOOOOOON....SS',
  '...NNOOOOONN..SS..',
  '...NNNNNNNNN.SS...',
  '...NNNNNNNNN......',
  '....NNNNNNN.......',
  '....NN...NN.......',
  '....NN...NN.......',
  '....NN...NN.......',
  '....NN...NN.......',
  '...NNNN.NNNN......',
  '...NNNN.NNNN......',
  '..................',
];

const CAV_W = CAV[0].length * PIXEL;
const CAV_H = CAV.length * PIXEL;
/** Space between Cavaliers standing as a group. */
const CAV_GAP = 0;

/**
 * Collision box for one Cavalier, narrower than his sprite. The grid carries
 * empty margins and an outstretched sword, and counting those as solid made him
 * 36px of obstacle instead of the ~20px he looks like - which was most of the
 * reason nothing could be jumped.
 */
const CAV_HIT_X = 6;
const CAV_HIT_W = 20;
/** How long the topple takes, in 60fps frames. */
const FALL_FRAMES = 16;

const groupWidth = (count: number) => count * CAV_W + (count - 1) * CAV_GAP;

/** Shared by the bird and the Cavalier: paints a character grid as pixels. */
const paint = (
  ctx: CanvasRenderingContext2D,
  rows: string[], ink: Record<string, string>, x: number, y: number
) => {
  rows.forEach((row, ry) => {
    for (let cx = 0; cx < row.length; cx++) {
      const key = row[cx];
      if (key === '.') continue;
      ctx.fillStyle = ink[key];
      ctx.fillRect(x + cx * PIXEL, y + ry * PIXEL, PIXEL, PIXEL);
    }
  });
};

/* ---- Campus backdrop ---------------------------------------------------
   An autumn afternoon: Blue Ridge behind, then Burruss, the Pylons, Torgersen
   Bridge and Lane Stadium in Hokie Stone, with the canopy turned. Daylight is
   also what lets the Cavalier wear real UVA navy and still be seen.

   It scrolls at a quarter of the ground's speed, which is what makes it sit
   behind the action rather than beside it. */
/** Sky, top to horizon. Generated rather than listed so the steps stay even
 *  and the count can change without re-picking every colour by hand. */
const lerp = (a: number[], b: number[], t: number) =>
  a.map((v, i) => Math.round(v + (b[i] - v) * t));
const SKY = Array.from({ length: 26 }, (_, i) => {
  const c = lerp([102, 164, 206], [236, 220, 196], i / 25);
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
});

/**
 * Hokie Stone. The real thing is a limestone laid in irregular courses, and
 * its character is entirely in the colour variation - greys next to tans next
 * to a dusty pink - so the blocks are picked from three tones rather than one.
 */
const STONE = '#bdb3a6';
const STONE_DK = '#a1978a';
const STONE_A = '#a89e90';
const STONE_B = '#c9b8a4';
const STONE_C = '#b9a8a6';
const MORTAR = '#9e9488';
const PANE = '#6d6350';

const GROUND = '#bfb49b';
const GROUND_LINE = '#8a7d66';
const SPECK = '#a2977e';

/** Autumn canopy: amber, rust, gold, and one tree that has not turned yet. */
const FALL = ['#c2571f', '#a83226', '#d69a2a', '#5a7a3a'];
const BG_TRUNK = '#6b5238';

/** Width of one backdrop tile. Drawn twice, offset, so it wraps seamlessly. */
const BG_W = 600;
const BG_PARALLAX = 0.25;

/** Deterministic 0..1 from a block's row and column. Scatters the tones without
 *  Math.random, which would repick every frame and make the wall boil. */
const blockNoise = (r: number, c: number) => {
  const s = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

/**
 * A wall of Hokie Stone: irregular courses, staggered, blocks picked from three
 * tones. The pattern belongs to the wall, not to the screen - see below.
 */
const stoneFace = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number
) => {
  ctx.fillStyle = STONE;
  ctx.fillRect(x, y, w, h);

  const tones = [STONE_A, STONE_B, STONE_C];
  const rows = Math.ceil(h / 5);

  for (let r = 0; r < rows; r++) {
    const cy = y + r * 5;
    if (cy >= y + h - 1) break;
    const stagger = r % 2 ? 4 : 0;
    const cols = Math.ceil((w + stagger) / 8);

    for (let c = 0; c < cols; c++) {
      const cx = x - stagger + c * 8;
      // Keyed off the block's row and column WITHIN this wall, never off its
      // position on screen. Keyed off screen coordinates - as this was - the
      // pattern stays pinned to the display while the building slides past
      // underneath it, so the stonework appears to crawl across the walls.
      const pick = Math.floor(blockNoise(r, c) * 5);
      if (pick > 2) continue;
      const bx = Math.max(cx, x);
      const bw = Math.min(cx + 7, x + w) - bx;
      if (bw <= 0) continue;
      ctx.fillStyle = tones[pick];
      ctx.fillRect(bx, cy, bw, Math.min(4, y + h - cy));
    }
  }

  ctx.fillStyle = MORTAR;
  for (let cy = y + 4; cy < y + h - 1; cy += 5) ctx.fillRect(x, cy, w, 1);
};

const drawTree = (
  ctx: CanvasRenderingContext2D,
  x: number, base: number, h: number, tone: number
) => {
  ctx.fillStyle = BG_TRUNK;
  ctx.fillRect(x + 4, base - 6, 3, 6);
  ctx.fillStyle = FALL[tone % FALL.length];
  ctx.fillRect(x, base - h, 11, h - 6);
  ctx.fillRect(x + 2, base - h - 4, 7, 4);
  ctx.fillRect(x + 4, base - h - 7, 3, 3);
};

const drawBlock = (
  ctx: CanvasRenderingContext2D,
  x: number, base: number, w: number, h: number
) => {
  stoneFace(ctx, x, base - h, w, h);
  ctx.fillStyle = STONE_DK;
  ctx.fillRect(x, base - h, w, 3);
  ctx.fillStyle = PANE;
  for (let cy = base - h + 7; cy < base - 6; cy += 9) {
    for (let cx = x + 4; cx < x + w - 5; cx += 8) ctx.fillRect(cx, cy, 3, 5);
  }
};

/** Burruss Hall. The tower and spire carry the whole silhouette, so it is
 *  drawn tall enough to sit above everything else on the tile. */
const drawBurruss = (ctx: CanvasRenderingContext2D, x: number, base: number) => {
  stoneFace(ctx, x, base - 26, 84, 26);
  stoneFace(ctx, x + 34, base - 56, 16, 30);
  ctx.fillStyle = STONE;
  ctx.fillRect(x + 2, base - 32, 16, 6);
  ctx.fillRect(x + 5, base - 36, 10, 4);
  ctx.fillRect(x + 66, base - 32, 16, 6);
  ctx.fillRect(x + 69, base - 36, 10, 4);
  ctx.fillRect(x + 35, base - 63, 14, 4);
  ctx.fillRect(x + 38, base - 67, 8, 4);
  ctx.fillRect(x + 41, base - 71, 2, 4);
  ctx.fillStyle = STONE_DK;
  ctx.fillRect(x + 32, base - 59, 20, 3);
  ctx.fillRect(x, base - 26, 84, 3);
  ctx.fillStyle = PANE;
  for (let i = 0; i < 8; i++) ctx.fillRect(x + 5 + i * 10, base - 20, 4, 8);
  ctx.fillRect(x + 37, base - 51, 3, 7);
  ctx.fillRect(x + 44, base - 51, 3, 7);
};

/** The War Memorial pylons. Free-standing, because a bar across the top made
 *  them read as a bench rather than eight columns. */
const drawPylons = (ctx: CanvasRenderingContext2D, x: number, base: number) => {
  for (let i = 0; i < 8; i++) stoneFace(ctx, x + i * 8, base - 30, 5, 30);
  ctx.fillStyle = STONE_DK;
  for (let i = 0; i < 8; i++) ctx.fillRect(x + i * 8 - 1, base - 33, 7, 3);
};

/** Torgersen Bridge: two end buildings and the enclosed glass span between
 *  them, which is the bit everyone pictures. */
const drawTorgersen = (ctx: CanvasRenderingContext2D, x: number, base: number) => {
  stoneFace(ctx, x, base - 34, 26, 34);
  stoneFace(ctx, x + 64, base - 34, 26, 34);
  ctx.fillStyle = STONE;
  ctx.fillRect(x + 26, base - 30, 38, 12);
  ctx.fillRect(x + 38, base - 18, 3, 18);
  ctx.fillRect(x + 50, base - 18, 3, 18);
  ctx.fillStyle = STONE_DK;
  ctx.fillRect(x + 26, base - 30, 38, 2);
  ctx.fillStyle = PANE;
  for (let i = 0; i < 7; i++) ctx.fillRect(x + 28 + i * 5, base - 27, 3, 6);
  for (let i = 0; i < 2; i++) {
    ctx.fillRect(x + 5 + i * 9, base - 28, 4, 7);
    ctx.fillRect(x + 69 + i * 9, base - 28, 4, 7);
  }
};

/** Lane Stadium, reduced to the bowl and its light towers. */
const drawStadium = (ctx: CanvasRenderingContext2D, x: number, base: number) => {
  stoneFace(ctx, x, base - 18, 92, 18);
  ctx.fillStyle = STONE;
  ctx.fillRect(x + 8, base - 25, 76, 7);
  ctx.fillStyle = STONE_DK;
  ctx.fillRect(x + 8, base - 25, 76, 2);
  ctx.fillRect(x + 6, base - 45, 3, 20);
  ctx.fillRect(x + 83, base - 45, 3, 20);
  ctx.fillRect(x + 2, base - 49, 11, 5);
  ctx.fillRect(x + 79, base - 49, 11, 5);
};

const drawBackdrop = (ctx: CanvasRenderingContext2D, x: number, base: number) => {
  drawTree(ctx, x + 8, base, 22, 0);
  drawTree(ctx, x + 22, base, 28, 1);
  drawBurruss(ctx, x + 45, base);
  drawTree(ctx, x + 140, base, 24, 2);
  drawTree(ctx, x + 154, base, 19, 0);
  drawPylons(ctx, x + 180, base);
  drawTorgersen(ctx, x + 255, base);
  drawTree(ctx, x + 355, base, 26, 1);
  drawTree(ctx, x + 369, base, 20, 3);
  drawStadium(ctx, x + 392, base);
  drawTree(ctx, x + 495, base, 21, 2);
  drawTree(ctx, x + 509, base, 27, 0);
  drawBlock(ctx, x + 536, base, 48, 30);
  drawTree(ctx, x + 590, base, 23, 1);
};

const START_SPEED = 4.2;
const MAX_SPEED = 9;
/**
 * Apex is v^2 / 2g, so this arc peaks around 72px and leaves 16px of headroom
 * under the top of the canvas.
 *
 * These are not taste. Simulating the previous values against the real hitboxes
 * showed a single Cavalier was unclearable at starting speed and a group of two
 * was unclearable at any speed - the Cavalier had roughly doubled in size while
 * the jump was cut. At these values, with the narrower hitbox above, a single
 * gives an 11-19 frame window to take off in and a pair gives 7-15.
 */
const GRAVITY = 0.40;
const JUMP_V = -7.6;

const BEST_KEY = 'hokie-run-best';

const readBest = (): number => {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

const storeBest = (value: number): void => {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    /* Private mode. A forgotten high score is not worth surfacing. */
  }
};

/** `fall` runs 0 to 1 once the bird has cleared them, tipping them over. */
interface Hurdle { x: number; count: number; fall: number; }

type Phase = 'idle' | 'running' | 'over';

/** The two halves of the "GAME OVER" blink, matching the @keyframes hokieBlink
 *  split used by the prompt: a one second cycle, lit for rather more of it. */
const LIT_MS = 550;
const DARK_MS = 450;

function HokieRun() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const promptRef = useRef<HTMLButtonElement | null>(null);
  /**
   * Whether "GAME OVER" is in the lit half of its blink. A ref rather than
   * state: `draw` closes over this, and a state change would give `draw` a new
   * identity, which the running-loop effect depends on and would restart.
   */
  const gameOverLit = useRef(true);
  /** The cabinet stays folded away until someone asks for it. */
  const [revealed, setRevealed] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  /**
   * The whole simulation lives in a ref, not in state. At sixty frames a second
   * a setState per field would re-render the section constantly; the canvas is
   * the only thing that needs to know, and it is drawn by hand anyway.
   */
  const game = useRef({
    y: 0,
    vy: 0,
    speed: START_SPEED,
    dist: 0,
    frame: 0,
    ground: 0,
    hurdles: [] as Hurdle[],
    gap: 260,
  });

  useEffect(() => setBest(readBest()), []);

  /* Land the keyboard on the play button rather than back at the top of the
     section, since opening the cabinet was a request to play. */
  useEffect(() => {
    if (revealed) promptRef.current?.focus();
  }, [revealed]);

  const reset = () => {
    game.current = {
      y: 0,
      vy: 0,
      speed: START_SPEED,
      dist: 0,
      frame: 0,
      ground: 0,
      hurdles: [],
      gap: 260,
    };
    setScore(0);
  };

  const draw = useCallback((phaseNow: Phase) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const g = game.current;

    // Sky, banded top to horizon.
    const band = Math.ceil((GROUND_Y + 28) / SKY.length);
    SKY.forEach((colour, i) => {
      ctx.fillStyle = colour;
      ctx.fillRect(0, i * band, W, band + 1);
    });

    // Campus, drawn twice so it wraps without a seam. The offset is rounded to
    // a whole pixel: left fractional, every edge in the backdrop lands on a
    // different sub-pixel each frame and the stonework shimmers even once the
    // pattern itself is stable.
    const bgX = -Math.round((g.ground * BG_PARALLAX) % BG_W);
    drawBackdrop(ctx, bgX, GROUND_Y);
    drawBackdrop(ctx, bgX + BG_W, GROUND_Y);

    // Ground: a solid line plus specks that scroll, so speed is visible even
    // when no hurdle is on screen.
    ctx.fillStyle = GROUND;
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.fillStyle = GROUND_LINE;
    ctx.fillRect(0, GROUND_Y, W, 2);
    ctx.fillStyle = SPECK;
    for (let i = 0; i < 26; i++) {
      const x = (i * 37 - (g.ground % 37 * 26) / 26) % W;
      ctx.fillRect(((x % W) + W) % W, GROUND_Y + 6 + (i % 3) * 3, 3, 2);
    }

    // Cavaliers. Each one pivots about its own feet, so a group topples like
    // a row of skittles rather than sliding over as a block.
    g.hurdles.forEach((h) => {
      const tipped = h.fall * h.fall * (3 - 2 * h.fall); // smoothstep
      for (let i = 0; i < h.count; i++) {
        ctx.save();
        ctx.translate(h.x + i * (CAV_W + CAV_GAP), GROUND_Y);
        ctx.rotate((-Math.PI / 2) * tipped);
        paint(ctx, CAV, CAV_INK, 0, -CAV_H);
        ctx.restore();
      }
    });

    // Bird
    const airborne = g.y < -0.5;
    // abs before the modulo: JavaScript's % keeps the sign of the operand, so a
    // negative frame counter would index this array at -1 and hand `paint` an
    // undefined sprite. The counter should never go negative now, but this is
    // one character to make the lookup total rather than nearly total.
    const cycle = Math.abs(Math.floor(g.frame / 6)) % LEGS.length;
    const legs = airborne ? LEGS_JUMP : LEGS[cycle];
    paint(ctx, [...BODY, ...legs], INK, BIRD_X, GROUND_Y - BIRD_H + g.y);

    // Dark type now: the screen is daylight, so the old bone-on-black would be
    // invisible against the sky.
    ctx.font = '12px "Courier Prime", monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#7a6f5c';
    if (best > 0) ctx.fillText(`HI ${String(best).padStart(5, '0')}`, W - 76, 20);
    ctx.fillStyle = '#3f3a30';
    ctx.fillText(String(Math.floor(g.dist)).padStart(5, '0'), W - 12, 20);

    if (phaseNow === 'over' && gameOverLit.current) {
      ctx.textAlign = 'center';
      ctx.fillStyle = MAROON;
      ctx.fillText('G A M E   O V E R', W / 2, 60);
    }
  }, [best]);

  // First paint, and a repaint whenever the game is not running so the screen
  // is never blank behind the prompt.
  //
  // `revealed` belongs in the deps even though the body never reads it: until
  // the cabinet opens there is no canvas in the DOM, so the mount run of this
  // effect paints nothing and returns at `draw`'s own null check. Opening the
  // cabinet changes neither `phase` nor `draw`, so without this the attract
  // screen was never painted at all - it only looked deliberate while a dark
  // scrim sat over the top of it.
  useEffect(() => {
    if (phase !== 'running') draw(phase);
  }, [phase, draw, revealed]);

  /**
   * Blink "GAME OVER" once the run has ended, on the same 1s cadence as the
   * arcade prompt below the canvas - lit a little longer than it is dark, so it
   * reads as a sign flickering rather than a strobe. Held steady for anyone who
   * asked for reduced motion, matching what the stylesheet does to `.hokie-blink`.
   */
  useEffect(() => {
    if (phase !== 'over') return;
    gameOverLit.current = true;

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let timer = window.setTimeout(function flip() {
      gameOverLit.current = !gameOverLit.current;
      draw('over');
      timer = window.setTimeout(flip, gameOverLit.current ? LIT_MS : DARK_MS);
    }, LIT_MS);

    // Leave it lit, so the next thing drawn is not a half-blinked frame.
    return () => {
      window.clearTimeout(timer);
      gameOverLit.current = true;
    };
  }, [phase, draw]);

  useEffect(() => {
    if (phase !== 'running') return;
    let raf = 0;
    /**
     * Seeded from the first animation frame rather than performance.now().
     * requestAnimationFrame is handed the timestamp of the frame's *start*,
     * which can predate a performance.now() taken moments earlier - so mixing
     * the two produced a negative first delta, which ran the frame counter
     * backwards and indexed the leg animation at -1.
     */
    let last = 0;

    const tick = (now: number) => {
      if (last === 0) last = now;
      // Normalised to a 60fps frame. Capped above so a background tab cannot
      // teleport the bird through a Cavalier, and floored at zero so a clock
      // that appears to run backwards cannot rewind the simulation.
      const dt = Math.max(0, Math.min((now - last) / 16.667, 3));
      last = now;
      const g = game.current;

      g.frame += dt;
      g.ground += g.speed * dt;
      g.dist += g.speed * dt * 0.6;
      if (g.speed < MAX_SPEED) g.speed += 0.0016 * dt;

      g.vy += GRAVITY * dt;
      g.y += g.vy * dt;
      if (g.y > 0) { g.y = 0; g.vy = 0; }

      g.hurdles.forEach((h) => {
        h.x -= g.speed * dt;
        // Tip over once the bird is fully past. Purely cosmetic - a cleared
        // Cavalier can no longer be collided with either way.
        if (h.x + groupWidth(h.count) < BIRD_X && h.fall < 1) {
          h.fall = Math.min(1, h.fall + dt / FALL_FRAMES);
        }
      });
      g.hurdles = g.hurdles.filter((h) => h.x + groupWidth(h.count) > -CAV_H - 10);

      g.gap -= g.speed * dt;
      if (g.gap <= 0) {
        // Pairs are held back until the reel is moving quickly enough for the
        // jump to carry across both. At the starting speed a pair leaves a
        // two-frame window to take off in, which is not a challenge, it is a
        // coin toss. Threes are simply not clearable and are not dealt at all.
        const count = g.speed >= 5.5 && Math.random() > 0.65 ? 2 : 1;
        g.hurdles.push({ x: W + 10, count, fall: 0 });
        // Scaled by speed so the reaction time stays fair as it gets quicker.
        g.gap = 150 + Math.random() * 130 + g.speed * 14 + count * 24;
      }

      // Collision, with the box pulled in a few pixels: the sprite has
      // transparent corners and clipping them felt like an unfair hit.
      const bx = BIRD_X + 4;
      const bw = BIRD_W - 10;
      const by = GROUND_Y - BIRD_H + g.y + 4;
      const bh = BIRD_H - 6;
      const hit = g.hurdles.some((h) => {
        if (h.fall > 0) return false;
        if (by + bh <= GROUND_Y - CAV_H + 3) return false;
        // Each Cavalier is tested on his own body box, so the empty space
        // between two of them is genuinely empty.
        for (let i = 0; i < h.count; i++) {
          const hx = h.x + i * (CAV_W + CAV_GAP) + CAV_HIT_X;
          if (bx < hx + CAV_HIT_W && bx + bw > hx) return true;
        }
        return false;
      });

      draw('running');

      if (hit) {
        const final = Math.floor(g.dist);
        setScore(final);
        if (final > best) { setBest(final); storeBest(final); }
        setPhase('over');
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, draw, best]);

  const jump = useCallback(() => {
    const g = game.current;
    if (g.y === 0) g.vy = JUMP_V;
  }, []);

  const start = () => {
    reset();
    setPhase('running');
    canvasRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'Enter') {
      e.preventDefault(); // or the page scrolls out from under the game
      if (phase === 'running') jump();
      else start();
    }
  };

  /* Unmounted rather than hidden. A collapsed-but-present cabinet would leave
     its canvas and buttons in the tab order with nothing visible to explain
     them, and unmounting stops the animation frame loop for free. */
  if (!revealed) {
    return (
      <div className="hokie-run">
        <button
          type="button"
          className="hokie-teaser"
          onClick={() => setRevealed(true)}
        >
          <span className="hokie-teaser-mark" aria-hidden="true">&#9654;</span>
          Wanna see how far a Hokie can run?
        </button>
      </div>
    );
  }

  return (
    <div className="hokie-run">
      <div className="hokie-cabinet">
        <canvas
          ref={canvasRef}
          className="hokie-canvas"
          width={W}
          height={H}
          tabIndex={0}
          role="application"
          aria-label="HokieBird runner game. Press space to jump."
          onPointerDown={() => (phase === 'running' ? jump() : start())}
          onKeyDown={onKeyDown}
        />

        {phase !== 'running' && (
          <button
            type="button"
            ref={promptRef}
            className="hokie-prompt"
            onClick={start}
          >
            {phase === 'idle' ? (
              <>
                <span className="hokie-prompt-title">Hokie Run</span>
                <span className="hokie-prompt-line">
                  <span className="hokie-blink">&#9654;</span> Click here to play
                </span>
              </>
            ) : (
              <span className="hokie-prompt-line">
                Score {score} &middot; Click to retry
              </span>
            )}
          </button>
        )}
      </div>

      <div className="hokie-footer">
        <p className="hokie-hint">Space or click to jump. Yes, it gets faster.</p>
        <button
          type="button"
          className="hokie-hide"
          onClick={() => { setPhase('idle'); setRevealed(false); }}
        >
          Hide game
        </button>
      </div>
    </div>
  );
}

export default HokieRun;
