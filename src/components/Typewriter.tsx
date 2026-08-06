import React, { useEffect, useRef, useState } from "react";

interface Props {
  /** Cycled in order. Each is typed, held, wiped, then the next begins. */
  phrases: string[];
  /** Typing only begins once this is true, so it can wait for the splash. */
  start?: boolean;
  /** Milliseconds per character while typing. */
  typeSpeed?: number;
  /** Milliseconds per character while wiping. Deleting reads better faster. */
  deleteSpeed?: number;
  /** Pause once a phrase is fully typed. */
  holdAfterType?: number;
  /** Pause after wiping, before the next phrase starts. */
  holdAfterDelete?: number;
  /** When false, stops on the final phrase instead of cycling back. */
  loop?: boolean;
  /**
   * What anyone with reduced motion sees instead of the animation. Defaults to
   * the first phrase, which is right when the phrases are interchangeable. When
   * they are beats of one sentence, the first is a fragment on its own - pass
   * the whole thought here instead.
   */
  staticText?: string;
  /**
   * Scale each phrase down until it fits on a single line, never above the size
   * the stylesheet asks for. Without it the box has to reserve room for however
   * many lines the longest phrase needs, which leaves every shorter phrase
   * sitting above an empty reserved line.
   */
  fitToWidth?: boolean;
}

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Reused across measurements; making one per call is needless garbage. */
let scratchCtx: CanvasRenderingContext2D | null = null;
const measuringContext = (): CanvasRenderingContext2D | null => {
  if (!scratchCtx) scratchCtx = document.createElement("canvas").getContext("2d");
  return scratchCtx;
};

/**
 * Canvas metrics and the real text layout agree closely but not exactly, and a
 * phrase measured a hair too narrow wraps - which is the whole thing we are
 * avoiding. Give back a little of the width rather than land on the boundary.
 */
const FIT_SAFETY = 0.985;

export default function Typewriter({
  phrases,
  start = true,
  typeSpeed = 80,
  deleteSpeed = 38,
  holdAfterType = 3800,
  holdAfterDelete = 700,
  loop = true,
  staticText,
  fitToWidth = false,
}: Props) {
  const reduced = useRef(prefersReducedMotion()).current;
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const hostRef = useRef<HTMLSpanElement | null>(null);
  /** The size this phrase fits at, and the one line of room it is given. */
  const [fit, setFit] = useState<{ font: number; line: number } | null>(null);

  useEffect(() => {
    if (reduced || !start) return;
    const phrase = phrases[index] ?? "";
    let timer = 0;

    if (!deleting) {
      if (count < phrase.length) {
        timer = window.setTimeout(() => setCount(count + 1), typeSpeed);
      } else if (loop || index < phrases.length - 1) {
        timer = window.setTimeout(() => setDeleting(true), holdAfterType);
      }
      // Otherwise this is the last phrase and it simply stays put.
    } else {
      if (count > 0) {
        timer = window.setTimeout(() => setCount(count - 1), deleteSpeed);
      } else {
        timer = window.setTimeout(() => {
          setDeleting(false);
          setIndex((index + 1) % phrases.length);
        }, holdAfterDelete);
      }
    }

    return () => window.clearTimeout(timer);
  }, [
    reduced, start, phrases, index, count, deleting,
    typeSpeed, deleteSpeed, holdAfterType, holdAfterDelete, loop,
  ]);

  const resting = staticText ?? phrases[0] ?? "";
  /** The phrase being sized: the whole one, not the part typed so far, so the
   *  size holds still while it types instead of growing letter by letter. */
  const sizing = reduced ? resting : (phrases[index] ?? "");

  /**
   * Measure the full phrase against the room the heading has, and scale it down
   * if it would not fit on one line. Capped at the stylesheet's own size, so
   * short phrases are never blown up past their intended scale.
   */
  useEffect(() => {
    if (!fitToWidth) {
      setFit(null);
      return;
    }
    const parent = hostRef.current?.parentElement;
    if (!parent) return;

    let frame = 0;
    const measure = () => {
      const styles = window.getComputedStyle(parent);
      const maxFont = parseFloat(styles.fontSize);
      const available = parent.clientWidth;
      const ctx = measuringContext();
      if (!ctx || !available || !maxFont || !sizing) return;

      // Measured at a fixed reference size, then scaled - one measurement
      // serves any target size.
      const REF = 100;
      ctx.font = `${styles.fontStyle} ${styles.fontWeight} ${REF}px ${styles.fontFamily}`;
      // Tracking is set in em, so it scales with the font and has to be
      // converted out of the px the computed style reports it in.
      const trackingEm = (parseFloat(styles.letterSpacing) || 0) / maxFont;
      const natural =
        ctx.measureText(sizing).width + trackingEm * REF * sizing.length;
      if (!natural) return;

      setFit({
        font: Math.min(maxFont, (available / natural) * REF * FIT_SAFETY),
        // One line at the heading's own size, whatever this phrase shrinks to,
        // so nothing below the heading moves between phrases.
        line: maxFont,
      });
    };

    measure();
    // Coalesced into a frame: a drag-resize fires this continuously.
    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    });
    observer.observe(parent);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [fitToWidth, sizing]);

  // Reserve the box using the longest thing that can appear, so the surrounding
  // layout never reflows as text is typed or wiped. Only one mode's text is
  // ever reachable, so reserving for both would leave whichever mode has the
  // shorter text sitting under an empty reserved line.
  const longest = reduced
    ? resting
    : phrases.reduce((a, b) => (b.length > a.length ? b : a), "");
  const shown = reduced ? resting : (phrases[index] ?? "").slice(0, count);

  return (
    <span
      ref={hostRef}
      className={`typewriter${fitToWidth ? " is-fitted" : ""}`}
      aria-hidden="true"
      // Fitted mode needs no ghost - every phrase is one line by construction,
      // so one line of the heading's own size is the whole reservation.
      style={fit ? { height: `${fit.line}px` } : undefined}
    >
      {/* Text only - no caret. Including one here pushed the longest phrase
          onto an extra line and reserved a blank row beneath the heading. The
          caret costs no width (see the negative margin in Main.scss), so it
          needs no space reserved for it. */}
      {!fitToWidth && <span className="typewriter-ghost">{longest}</span>}
      <span
        className="typewriter-text"
        // line-height matches the reserved box, which centres a shrunk phrase
        // in it without any flex or transform.
        style={fit ? { fontSize: `${fit.font}px`, lineHeight: `${fit.line}px` } : undefined}
      >
        {shown}
        {!reduced && <i className="typewriter-caret" />}
      </span>
    </span>
  );
}
