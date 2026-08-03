import React, { useCallback, useEffect, useRef, useState } from "react";
import DownloadIcon from '@mui/icons-material/Download';
import ReplayIcon from '@mui/icons-material/Replay';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import '../assets/styles/DoodleGame.scss';

/**
 * Each prompt is split into three chunks that read left to right across the
 * reels. The reels spin through every prompt's chunk for their position and
 * land on a shared index, so the three windows always settle into one coherent
 * sentence while showing nonsense on the way past.
 */
const PROMPTS: [string, string, string][] = [
  ["DRAW YOUR", "SPIRIT", "ANIMAL"],
  ["DRAW YOUR", "GO-TO", "KARAOKE SONG"],
  ["DRAW THE", "LAST THING", "YOU GOOGLED"],
  ["DRAW YOUR", "HIDDEN", "TALENT"],
  ["DRAW YOUR", "DREAM", "DINNER GUEST"],
  ["DRAW YOUR", "COMFORT", "MOVIE"],
  ["DRAW WHAT", "YOU WANTED", "TO BE AT SIX"],
  ["DRAW YOUR", "MOST USED", "EMOJI"],
  ["DRAW WHAT", "IS ALWAYS", "IN YOUR BAG"],
  ["DRAW YOUR", "IDEAL", "SUNDAY"],
  ["DRAW YOUR", "SUPERPOWER", "OF CHOICE"],
  ["DRAW YOUR", "CHILDHOOD", "HERO"],
  ["DRAW WHERE", "YOU'D FLY", "TOMORROW"],
  ["DRAW YOUR", "DESERT ISLAND", "SNACK"],
  ["DRAW YOUR", "WALK-UP", "SONG"],
  ["DRAW THE", "PET YOU", "ALWAYS WANTED"],
  ["DRAW YOUR", "PHONE", "WALLPAPER"],
  ["DRAW YOUR", "PERFECT", "PIZZA"],
];

/** Brush sizes in pixels. The eraser scales off whichever is selected. */
const WIDTHS = [2, 5, 10, 18];
const ERASER_SCALE = 5;

/** Index 0 is left blank here: it is the mode-aware ink, filled in at render. */
const COLOUR_NAMES = [
  "Ink", "Red", "Orange", "Yellow", "Green", "Teal",
  "Blue", "Indigo", "Purple", "Pink", "Brown", "Grey",
];

const ITEM_HEIGHT = 56;
const SPIN_MS = [1900, 2400, 2900];
const DRAW_SECONDS = 30;
/** When the counter turns red and starts pulsing. */
const LOW_SECONDS = 7;
const EMAIL = "joseph.nguyen010@gmail.com";

type Phase = "idle" | "spinning" | "countdown" | "drawing" | "done";

/**
 * The pointer becomes an actual brush whose bristles carry the selected colour,
 * built as an inline SVG so it can be recoloured without shipping image assets.
 * The trailing coordinates are the hotspot: the very tip of the bristles.
 */
const brushCursor = (colour: string): string => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">` +
      `<path d="M4 28 L11.5 10.5 L21.5 20.5 Z" fill="${colour}" stroke="#101216" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<path d="M13 9 L23 19 L27.5 14.5 L17.5 4.5 Z" fill="#d9d9de" stroke="#101216" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<path d="M17.5 4.5 L27.5 14.5" stroke="#101216" stroke-width="1.2" opacity="0.45"/>` +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 4 28, crosshair`;
};

const eraserCursor = (): string => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">` +
      `<path d="M5 25 L15 11 L27 19 L19 27 Z" fill="#ffd6e0" stroke="#101216" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<path d="M15 11 L27 19" stroke="#101216" stroke-width="1.4" opacity="0.5"/>` +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 6 26, crosshair`;
};

interface Point { x: number; y: number; }
/** Colours are stored by index, not value, so a mode switch can re-resolve
 *  them and the drawing stays visible on the new board. */
interface Stroke { colourIndex: number; width: number; erase: boolean; points: Point[]; }

interface Props { mode?: string; }

function DoodleGame({ mode = 'dark' }: Props) {
  const dark = mode !== 'light';
  const board = dark ? '#16181d' : '#ffffff';
  const ink = dark ? '#f5f5f5' : '#16181d';
  // Ink first so there is always a swatch guaranteed to show on the current
  // board, then a conventional paint box.
  const palette = [
    ink,
    '#e53935', '#fb8c00', '#fdd835', '#43a047', '#00acc1',
    '#1e88e5', '#3949ab', '#8e24aa', '#ec407a', '#6d4c41', '#9e9e9e',
  ];

  const [phase, setPhase] = useState<Phase>("idle");
  const [pick, setPick] = useState(0);
  const [offsets, setOffsets] = useState<number[]>([0, 0, 0]);
  const [animating, setAnimating] = useState(false);
  const [pulled, setPulled] = useState(false);
  const [count, setCount] = useState(3);
  const [secondsLeft, setSecondsLeft] = useState(DRAW_SECONDS);

  const [colourIndex, setColourIndex] = useState(0);
  const [widthIndex, setWidthIndex] = useState(1);
  const [erasing, setErasing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokes = useRef<Stroke[]>([]);
  const current = useRef<Stroke | null>(null);
  const timers = useRef<number[]>([]);

  /**
   * Shuffle bag rather than plain random. Every prompt is dealt once before any
   * repeats, so consecutive pulls always differ. Raw Math.random() with 18
   * prompts repeats often enough to feel broken.
   */
  const bag = useRef<number[]>([]);
  const lastPick = useRef<number>(-1);

  const dealPrompt = (): number => {
    if (bag.current.length === 0) {
      const deck = PROMPTS.map((_, i) => i);
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      // Stop a refilled bag from opening on the prompt just shown.
      if (deck.length > 1 && deck[0] === lastPick.current) {
        [deck[0], deck[1]] = [deck[1], deck[0]];
      }
      bag.current = deck;
    }
    const picked = bag.current.shift() as number;
    lastPick.current = picked;
    return picked;
  };

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const prompt = PROMPTS[pick].join(" ");

  // ---- Canvas ------------------------------------------------------------

  /** Repaints the board and every stored stroke. Called on mount, on resize,
   *  and whenever the colour mode changes. */
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (canvas.width !== Math.round(rect.width * dpr)) {
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = board;
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    strokes.current.forEach((s) => {
      ctx.strokeStyle = s.erase ? board : palette[s.colourIndex];
      ctx.lineWidth = s.width;
      ctx.beginPath();
      s.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      if (s.points.length === 1) ctx.lineTo(s.points[0].x + 0.1, s.points[0].y);
      ctx.stroke();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, ink]);

  useEffect(() => {
    redraw();
    window.addEventListener("resize", redraw);
    return () => window.removeEventListener("resize", redraw);
  }, [redraw]);

  const pointFrom = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (phase !== "drawing") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const stroke: Stroke = {
      colourIndex,
      width: erasing ? WIDTHS[widthIndex] * ERASER_SCALE : WIDTHS[widthIndex],
      erase: erasing,
      points: [pointFrom(e)],
    };
    strokes.current.push(stroke);
    current.current = stroke;
    redraw();
  };

  const continueStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const stroke = current.current;
    if (!stroke) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const prev = stroke.points[stroke.points.length - 1];
    const next = pointFrom(e);
    stroke.points.push(next);
    // Draw just the new segment; a full redraw every move would be wasteful.
    ctx.strokeStyle = stroke.erase ? board : palette[stroke.colourIndex];
    ctx.lineWidth = stroke.width;
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
  };

  const endStroke = () => { current.current = null; };

  const clearCanvas = () => {
    strokes.current = [];
    redraw();
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `doodle-${prompt.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // ---- Slots -------------------------------------------------------------

  const spin = () => {
    if (phase === "spinning" || phase === "countdown" || phase === "drawing") return;
    clearTimers();
    strokes.current = [];
    redraw();

    const next = dealPrompt();
    // Vary how far the reels travel so no two pulls feel identical.
    const extraLoops = 1 + Math.floor(Math.random() * 3);

    setPulled(true);
    timers.current.push(window.setTimeout(() => setPulled(false), 420));

    setAnimating(false);
    setOffsets([pick, pick, pick].map((p) => p * ITEM_HEIGHT));
    setPhase("spinning");

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setAnimating(true);
        setOffsets(SPIN_MS.map((_, i) => ((i + extraLoops + 2) * PROMPTS.length + next) * ITEM_HEIGHT));
      });
    });

    timers.current.push(
      window.setTimeout(() => {
        setAnimating(false);
        setPick(next);
        setOffsets([next, next, next].map((t) => t * ITEM_HEIGHT));
        setPhase("countdown");
        setCount(3);
      }, Math.max(...SPIN_MS) + 250)
    );
  };

  // ---- Countdown and timer ----------------------------------------------

  useEffect(() => {
    if (phase !== "countdown") return;
    if (count <= 0) {
      setSecondsLeft(DRAW_SECONDS);
      setPhase("drawing");
      return;
    }
    const t = window.setTimeout(() => setCount((c) => c - 1), 850);
    return () => window.clearTimeout(t);
  }, [phase, count]);

  useEffect(() => {
    if (phase !== "drawing") return;
    if (secondsLeft <= 0) {
      setPhase("done");
      return;
    }
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, secondsLeft]);

  const reset = () => {
    clearTimers();
    setPhase("idle");
    setSecondsLeft(DRAW_SECONDS);
    setErasing(false);
  };

  const busy = phase === "spinning" || phase === "countdown" || phase === "drawing";

  return (
    <div className="container" id="doodle">
      <div className="doodle-container">
        <h1>Doodle Machine</h1>
        <p className="doodle-intro">
          Pull the lever for an icebreaker, then you get {DRAW_SECONDS} seconds to
          draw your answer. Send me the result if it turns out good. Or especially
          if it doesn't.
        </p>

        {/* ---- Machine ---- */}
        <div className="machine">
          <div className={`slots${phase === "spinning" ? " is-spinning" : ""}`}>
            {[0, 1, 2].map((i) => (
              <div className="reel" key={i}>
                <div
                  className="reel-strip"
                  style={{
                    transform: `translateY(-${offsets[i]}px)`,
                    transition: animating
                      ? `transform ${SPIN_MS[i]}ms cubic-bezier(0.16, 1, 0.3, 1)`
                      : "none",
                  }}
                >
                  {/* Enough repeats that the longest possible spin still has
                      strip left to travel through. */}
                  {Array.from({ length: 10 }).flatMap((_, loop) =>
                    PROMPTS.map((p, j) => (
                      <div className="reel-item" key={`${loop}-${j}`}>{p[i]}</div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className={`lever${pulled ? " is-pulled" : ""}`}
            onClick={spin}
            disabled={busy}
            aria-label="Pull the lever for a new prompt"
          >
            <span className="lever-slot" aria-hidden="true" />
            <span className="lever-arm" aria-hidden="true">
              <span className="lever-knob" />
            </span>
          </button>
        </div>

        <p className="doodle-hint">
          {phase === "idle" && "Pull the lever"}
          {phase === "spinning" && "Spinning..."}
          {(phase === "drawing" || phase === "countdown") && prompt}
          {phase === "done" && "Pencils down."}
        </p>

        {/* ---- Board: always present ---- */}
        <div className="doodle-board">
          <div className="doodle-tools" aria-hidden={phase !== "drawing"}>
            <div className="tool-group swatches">
              {palette.map((c, i) => (
                <button
                  type="button"
                  key={i}
                  className={`swatch${!erasing && colourIndex === i ? " is-active" : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => { setColourIndex(i); setErasing(false); }}
                  disabled={phase !== "drawing"}
                  aria-label={COLOUR_NAMES[i]}
                  aria-pressed={!erasing && colourIndex === i}
                />
              ))}
            </div>

            <span className="tool-divider" aria-hidden="true" />

            <div className="tool-group">
              {WIDTHS.map((w, i) => (
                <button
                  type="button"
                  key={w}
                  className={`size${widthIndex === i ? " is-active" : ""}`}
                  onClick={() => setWidthIndex(i)}
                  disabled={phase !== "drawing"}
                  aria-label={`Brush size ${i + 1}`}
                  aria-pressed={widthIndex === i}
                >
                  {/* Dot scaled to the actual stroke width it produces. */}
                  <span
                    style={{
                      width: `${Math.max(4, w)}px`,
                      height: `${Math.max(4, w)}px`,
                      backgroundColor: erasing ? undefined : palette[colourIndex],
                    }}
                  />
                </button>
              ))}
            </div>

            <span className="tool-divider" aria-hidden="true" />

            <div className="tool-group">
              <button
                type="button"
                className={`tool${erasing ? " is-active" : ""}`}
                onClick={() => setErasing((v) => !v)}
                disabled={phase !== "drawing"}
                aria-pressed={erasing}
              >
                Eraser
              </button>
              <button
                type="button"
                className="tool"
                onClick={clearCanvas}
                disabled={phase !== "drawing"}
              >
                <DeleteOutlineIcon aria-hidden="true"/> Clear
              </button>
            </div>
          </div>

          <div className="doodle-canvas-wrap">
            <canvas
              ref={canvasRef}
              className={`doodle-canvas${phase === "drawing" ? " is-live" : ""}`}
              style={
                phase === "drawing"
                  ? { cursor: erasing ? eraserCursor() : brushCursor(palette[colourIndex]) }
                  : undefined
              }
              onPointerDown={startStroke}
              onPointerMove={continueStroke}
              onPointerUp={endStroke}
              onPointerCancel={endStroke}
            />

            {phase === "countdown" && (
              <div className="canvas-overlay" aria-live="assertive">
                <span className="canvas-count" key={count}>
                  {count > 0 ? count : "DRAW!"}
                </span>
              </div>
            )}

            {phase === "idle" && (
              <div className="canvas-overlay is-quiet">
                <span className="canvas-idle">Your canvas is ready</span>
              </div>
            )}

            {phase === "drawing" && (
              <div className="canvas-timer">
                <span className={secondsLeft <= LOW_SECONDS ? "is-low" : ""}>{secondsLeft}s</span>
              </div>
            )}
          </div>

          <div className="doodle-timer-bar" aria-hidden="true">
            <div
              style={{
                width: phase === "drawing" || phase === "done"
                  ? `${(secondsLeft / DRAW_SECONDS) * 100}%`
                  : "100%",
              }}
            />
          </div>

          {phase === "done" && (
            <div className="doodle-done">
              <div className="doodle-actions">
                <button type="button" className="doodle-button" onClick={download}>
                  <DownloadIcon aria-hidden="true"/> Download
                </button>
                <button type="button" className="doodle-button is-ghost" onClick={reset}>
                  <ReplayIcon aria-hidden="true"/> Go again
                </button>
              </div>
              <p className="doodle-send">
                Send it to <a href={`mailto:${EMAIL}?subject=A doodle for you`}>{EMAIL}</a>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoodleGame;
