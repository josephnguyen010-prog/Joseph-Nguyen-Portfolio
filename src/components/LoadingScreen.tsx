import React, { useCallback, useEffect, useRef, useState } from "react";
import '../assets/styles/LoadingScreen.scss';

interface Props {
  /** Called once the screen has finished fading out and can be unmounted. */
  onFinish: () => void;
  /**
   * Total time the bar takes to fill before it waits for input. The segments
   * below are scaled to match, so this stays a single dial.
   */
  duration?: number;
}

const FADE_MS = 450;

/**
 * The bar advances in chunks with deliberate stalls between them. A perfectly
 * smooth sweep reads as an animation; stalling reads as loading.
 */
const SEGMENTS = [
  { to: 34, run: 620, hold: 520 },
  { to: 71, run: 560, hold: 640 },
  { to: 92, run: 430, hold: 380 },
  { to: 100, run: 300, hold: 0 },
];

const BASE_TOTAL = SEGMENTS.reduce((sum, s) => sum + s.run + s.hold, 0);

/** Progress at a given moment, following the segment timeline. */
function progressAt(elapsed: number): number {
  let t = elapsed;
  let from = 0;

  for (const seg of SEGMENTS) {
    if (t < seg.run) {
      const k = t / seg.run;
      const eased = 1 - Math.pow(1 - k, 2);
      return from + (seg.to - from) * eased;
    }
    t -= seg.run;
    if (t < seg.hold) return seg.to;
    t -= seg.hold;
    from = seg.to;
  }
  return 100;
}

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function LoadingScreen({ onFinish, duration = BASE_TOTAL }: Props) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const reduced = useRef(prefersReducedMotion()).current;
  const startButton = useRef<HTMLButtonElement | null>(null);
  // Guards against a click and a keypress both firing the exit.
  const entered = useRef(false);

  const enter = useCallback(() => {
    if (entered.current) return;
    entered.current = true;
    setProgress(100);
    setLeaving(true);
    window.setTimeout(onFinish, reduced ? 0 : FADE_MS);
  }, [onFinish, reduced]);

  // Anyone who asked for less motion goes straight through.
  useEffect(() => {
    if (reduced) enter();
  }, [reduced, enter]);

  // Fill the bar, then stop and wait. Nothing dismisses this on a timer.
  useEffect(() => {
    if (reduced) return;
    const start = performance.now();
    const scale = duration / BASE_TOTAL;
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = (now - start) / scale;
      setProgress(progressAt(elapsed));

      if (elapsed < BASE_TOTAL) {
        frame = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        setReady(true);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, reduced]);

  // Input is only accepted once the bar has finished. Before that there is no
  // way past the screen - the loading sequence cannot be skipped.
  useEffect(() => {
    if (reduced || !ready) return;
    const go = () => enter();
    window.addEventListener("keydown", go);
    window.addEventListener("mousedown", go);
    window.addEventListener("touchstart", go);
    return () => {
      window.removeEventListener("keydown", go);
      window.removeEventListener("mousedown", go);
      window.removeEventListener("touchstart", go);
    };
  }, [reduced, ready, enter]);

  // Move focus to the button once it appears, so keyboard and screen reader
  // users land on the control rather than having to hunt for it.
  useEffect(() => {
    if (ready) startButton.current?.focus();
  }, [ready]);

  // Hold the page still underneath so the splash can't be scrolled away from.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  if (reduced) return null;

  const shown = Math.round(progress);

  return (
    <div className={`loading-screen${leaving ? " is-leaving" : ""}`}>
      <div className="loading-inner">
        <h1 className="loading-name">JOSEPH NGUYEN’S PORTFOLIO</h1>

        <div className="loading-track">
          {/* The bar doubles as the ground the runner travels along. */}
          <div className="loading-fill" style={{ width: `${progress}%` }} />
          <span className="obstacle" style={{ left: "38%" }} />
          <span className="obstacle" style={{ left: "67%" }} />
          <span className="obstacle" style={{ left: "88%" }} />
          <span
            className={`runner${ready ? " is-resting" : ""}`}
            style={{ left: `${progress}%` }}
          />
        </div>

        <p className="loading-status" role="status" aria-live="polite">
          <span className="loading-label">{ready ? "READY" : "LOADING"}</span>
          <span className="loading-percent">{shown}%</span>
        </p>

        <div className="loading-action">
          {ready && (
            <>
              <button
                type="button"
                ref={startButton}
                className="loading-start"
                onClick={enter}
              >
                ▸ PRESS START ◂
              </button>
              <p className="loading-hint">click anywhere or press any key</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
