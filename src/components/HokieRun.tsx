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
const BIRD_X = 56;

/** One sprite pixel, in canvas units. */
const PIXEL = 2;

const MAROON = '#861F41';
const ORANGE = '#E5751F';
const BONE = '#f0f0f2';
const DIM = '#5a6070';
const SCREEN = '#101319';

const INK: Record<string, string> = { M: MAROON, O: ORANGE, W: '#ffffff' };

/** Everything above the legs, shared by both run frames. */
const BODY = [
  '................',
  '..........MMM...',
  '.........MMMMM..',
  '.........MMWMM..',
  '.........MMMMMOO',
  'M........MMMMM..',
  'MM.......MMMMM..',
  'MMM.....MMMMMM..',
  '.MMM..MMMMMMMM..',
  '..MMMMMMMMMMMM..',
  '..MMMMMMMMMMMM..',
  '...MMMMMMMMMMM..',
  '....MMMMMMMMM...',
];

const LEGS = [
  [
    '.....OO...OO....',
    '.....O.....O....',
    '....OO.....OO...',
  ],
  [
    '.....OO...OO....',
    '......O...O.....',
    '.....OO...OO....',
  ],
];

/** Legs tucked while airborne, so a jump reads as a jump. */
const LEGS_JUMP = [
  '.....OO...OO....',
  '....OO.....OO...',
  '................',
];

const BIRD_W = 16 * PIXEL;
const BIRD_H = 16 * PIXEL;

/** Obstacle shapes, picked at random. Heights stay jumpable at every speed. */
const HURDLES = [
  { w: 10, h: 22 },
  { w: 12, h: 30 },
  { w: 22, h: 20 },
];

const START_SPEED = 4.2;
const MAX_SPEED = 9;
const GRAVITY = 0.52;
const JUMP_V = -9.4;

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

interface Hurdle { x: number; w: number; h: number; }

type Phase = 'idle' | 'running' | 'over';

function HokieRun() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const promptRef = useRef<HTMLButtonElement | null>(null);
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

    ctx.fillStyle = SCREEN;
    ctx.fillRect(0, 0, W, H);

    // Ground: a solid line plus specks that scroll, so speed is visible even
    // when no hurdle is on screen.
    ctx.fillStyle = DIM;
    ctx.fillRect(0, GROUND_Y, W, 2);
    for (let i = 0; i < 26; i++) {
      const x = (i * 37 - (g.ground % 37 * 26) / 26) % W;
      ctx.fillRect(((x % W) + W) % W, GROUND_Y + 6 + (i % 3) * 3, 3, 2);
    }

    ctx.fillStyle = BONE;
    g.hurdles.forEach((h) => {
      ctx.fillRect(h.x, GROUND_Y - h.h, h.w, h.h);
      // A nub near the top, so they read as objects rather than bars.
      ctx.fillRect(h.x - 3, GROUND_Y - h.h + 5, 3, 4);
      ctx.fillRect(h.x + h.w, GROUND_Y - h.h + 8, 3, 4);
    });

    // Bird
    const airborne = g.y < -0.5;
    const legs = airborne ? LEGS_JUMP : LEGS[Math.floor(g.frame / 6) % 2];
    const rows = [...BODY, ...legs];
    const top = GROUND_Y - BIRD_H + g.y;
    rows.forEach((row, ry) => {
      for (let cx = 0; cx < row.length; cx++) {
        const key = row[cx];
        if (key === '.') continue;
        ctx.fillStyle = INK[key];
        ctx.fillRect(BIRD_X + cx * PIXEL, top + ry * PIXEL, PIXEL, PIXEL);
      }
    });

    ctx.font = '12px "Courier Prime", monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = DIM;
    if (best > 0) ctx.fillText(`HI ${String(best).padStart(5, '0')}`, W - 76, 20);
    ctx.fillStyle = BONE;
    ctx.fillText(String(Math.floor(g.dist)).padStart(5, '0'), W - 12, 20);

    if (phaseNow === 'over') {
      ctx.textAlign = 'center';
      ctx.fillStyle = ORANGE;
      ctx.fillText('G A M E   O V E R', W / 2, 60);
    }
  }, [best]);

  // First paint, and a repaint whenever the game is not running so the screen
  // is never blank behind the prompt.
  useEffect(() => {
    if (phase !== 'running') draw(phase);
  }, [phase, draw]);

  useEffect(() => {
    if (phase !== 'running') return;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      // Normalised to a 60fps frame and capped, so a background tab or a slow
      // frame cannot teleport the bird through a hurdle.
      const dt = Math.min((now - last) / 16.667, 3);
      last = now;
      const g = game.current;

      g.frame += dt;
      g.ground += g.speed * dt;
      g.dist += g.speed * dt * 0.6;
      if (g.speed < MAX_SPEED) g.speed += 0.0016 * dt;

      g.vy += GRAVITY * dt;
      g.y += g.vy * dt;
      if (g.y > 0) { g.y = 0; g.vy = 0; }

      g.hurdles.forEach((h) => { h.x -= g.speed * dt; });
      g.hurdles = g.hurdles.filter((h) => h.x + h.w > -10);

      g.gap -= g.speed * dt;
      if (g.gap <= 0) {
        const shape = HURDLES[Math.floor(Math.random() * HURDLES.length)];
        g.hurdles.push({ x: W + 10, ...shape });
        // Scaled by speed so the reaction time stays fair as it gets quicker.
        g.gap = 150 + Math.random() * 130 + g.speed * 14;
      }

      // Collision, with the box pulled in a few pixels: the sprite has
      // transparent corners and clipping them felt like an unfair hit.
      const bx = BIRD_X + 4;
      const bw = BIRD_W - 10;
      const by = GROUND_Y - BIRD_H + g.y + 4;
      const bh = BIRD_H - 6;
      const hit = g.hurdles.some((h) =>
        bx < h.x + h.w && bx + bw > h.x && by + bh > GROUND_Y - h.h
      );

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
                <span className="hokie-blink">&#9654;</span> Click here to play
              </>
            ) : (
              <>Score {score} &middot; Click to retry</>
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
