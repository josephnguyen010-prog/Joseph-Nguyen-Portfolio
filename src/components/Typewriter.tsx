import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

interface Props {
  /**
   * Each stanza is a group of lines that share the screen. Its lines are typed
   * one under the next, the whole stanza is held, then it is wiped upward
   * before the following stanza begins.
   */
  stanzas: string[][];
  /** Typing only begins once this is true, so it can wait for the splash. */
  start?: boolean;
  /** Milliseconds per character while typing. */
  typeSpeed?: number;
  /** Milliseconds per character while wiping. Deleting reads better faster. */
  deleteSpeed?: number;
  /** Pause between finishing one line and starting the next below it. */
  holdBetweenLines?: number;
  /** Pause once every line of the stanza is typed. */
  holdAfterType?: number;
  /** Pause after wiping, before the next stanza starts. */
  holdAfterDelete?: number;
  /** When false, stops on the final stanza instead of cycling back. */
  loop?: boolean;
  /**
   * What anyone with reduced motion sees instead of the animation. Defaults to
   * the first stanza, which is right when the stanzas are interchangeable. When
   * they are beats of one thought, the first is a fragment on its own - pass
   * the whole thing here instead.
   */
  staticLines?: string[];
  /**
   * Scale the whole heading down until no line that shares a stanza has to
   * wrap, never above the size the stylesheet asks for. Without it a stanza
   * whose line wraps grows by a row, and since the box is as tall as the
   * tallest stanza, every other stanza then sits above an empty row.
   *
   * One size for all stanzas, not one per stanza, so the type never changes
   * size mid-animation. A stanza of a single line is left free to wrap - it has
   * the whole box to fill either way.
   */
  fitLines?: boolean;
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
 * line measured a hair too narrow wraps - which is the whole thing we are
 * avoiding. Give back a little of the width rather than land on the boundary.
 */
const FIT_SAFETY = 0.985;

export default function Typewriter({
  stanzas,
  start = true,
  typeSpeed = 80,
  deleteSpeed = 38,
  holdBetweenLines = 1400,
  holdAfterType = 3800,
  holdAfterDelete = 700,
  loop = true,
  staticLines,
  fitLines = false,
}: Props) {
  const reduced = useRef(prefersReducedMotion()).current;
  const hostRef = useRef<HTMLSpanElement | null>(null);
  /** One size for the whole heading, or null to leave the stylesheet's alone. */
  const [fontPx, setFontPx] = useState<number | null>(null);
  /** Which stanza is on screen. */
  const [stanza, setStanza] = useState(0);
  /** Which line of it is being typed or wiped. Lines above are complete. */
  const [line, setLine] = useState(0);
  const [count, setCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduced || !start) return;
    const lines = stanzas[stanza] ?? [];
    const current = lines[line] ?? "";
    let timer = 0;

    if (!deleting) {
      if (count < current.length) {
        timer = window.setTimeout(() => setCount(count + 1), typeSpeed);
      } else if (line < lines.length - 1) {
        // Line finished, and there is another below it. The pause here is what
        // makes the second line read as a reply to the first.
        timer = window.setTimeout(() => {
          setLine(line + 1);
          setCount(0);
        }, holdBetweenLines);
      } else if (loop || stanza < stanzas.length - 1) {
        timer = window.setTimeout(() => setDeleting(true), holdAfterType);
      }
      // Otherwise this is the last stanza and it simply stays put.
    } else {
      if (count > 0) {
        timer = window.setTimeout(() => setCount(count - 1), deleteSpeed);
      } else if (line > 0) {
        // Wipes upward: this line is empty, so carry on with the one above
        // rather than clearing the whole stanza at once.
        timer = window.setTimeout(() => {
          setLine(line - 1);
          setCount((lines[line - 1] ?? "").length);
        }, deleteSpeed);
      } else {
        timer = window.setTimeout(() => {
          setDeleting(false);
          setStanza((stanza + 1) % stanzas.length);
          setLine(0);
          setCount(0);
        }, holdAfterDelete);
      }
    }

    return () => window.clearTimeout(timer);
  }, [
    reduced, start, stanzas, stanza, line, count, deleting,
    typeSpeed, deleteSpeed, holdBetweenLines, holdAfterType, holdAfterDelete, loop,
  ]);

  const resting = staticLines ?? stanzas[0] ?? [];

  /**
   * Every stanza is rendered invisibly, all stacked in the same grid cell, so
   * the box is as tall as the tallest one and nothing below the heading moves
   * between stanzas. Stacking them means the browser does the measuring: a
   * stanza that wraps to an extra line at some width is accounted for without
   * anything here knowing the width. Only one mode's text is ever reachable, so
   * reduced motion reserves for its own line set alone.
   */
  const reserved = reduced ? [resting] : stanzas;

  /**
   * Size the heading so that no line sharing a stanza has to wrap. Measured
   * before paint, so the first frame is already at the right size rather than
   * flashing a wrapped one. The column it measures against is `flex: 1`, so its
   * width does not depend on this text - otherwise shrinking the type would
   * shrink the column, which would shrink the type again.
   */
  useLayoutEffect(() => {
    if (!fitLines) {
      setFontPx(null);
      return;
    }
    const parent = hostRef.current?.parentElement;
    if (!parent) return;

    // Only lines that share a stanza have to fit; a lone line may wrap freely.
    const mustFit = reserved.filter((set) => set.length > 1).flat();
    if (!mustFit.length) return;

    let frame = 0;
    const measure = () => {
      const styles = window.getComputedStyle(parent);
      const maxFont = parseFloat(styles.fontSize);
      const available = parent.clientWidth;
      const ctx = measuringContext();
      if (!ctx || !available || !maxFont) return;

      // Measured once at a reference size, then scaled to any target size.
      const REF = 100;
      ctx.font = `${styles.fontStyle} ${styles.fontWeight} ${REF}px ${styles.fontFamily}`;
      // Tracking is set in em, so it scales with the font and has to be
      // converted out of the px the computed style reports it in.
      const trackingEm = (parseFloat(styles.letterSpacing) || 0) / maxFont;
      const widest = mustFit.reduce(
        (w, text) =>
          Math.max(w, ctx.measureText(text).width + trackingEm * REF * text.length),
        0,
      );
      if (!widest) return;

      setFontPx(Math.min(maxFont, (available / widest) * REF * FIT_SAFETY));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitLines, stanzas, staticLines, reduced]);

  const shown = reduced
    ? resting
    : (stanzas[stanza] ?? [])
        .slice(0, line + 1)
        .map((text, i) => (i === line ? text.slice(0, count) : text));

  return (
    <span
      ref={hostRef}
      className="typewriter"
      aria-hidden="true"
      // Set here rather than on the heading, so the heading's own computed size
      // stays available as the cap this is measured against.
      style={fontPx ? { fontSize: `${fontPx}px` } : undefined}
    >
      {reserved.map((set, i) => (
        // Text only - no caret. The caret costs no width (see the negative
        // margin in Main.scss), so it needs no space reserved for it.
        <span className="typewriter-ghost" key={i}>
          {set.map((text, j) => (
            <span className="typewriter-line" key={j}>{text}</span>
          ))}
        </span>
      ))}

      <span className="typewriter-text">
        {shown.map((text, i) => (
          <span className="typewriter-line" key={i}>
            {text}
            {!reduced && i === shown.length - 1 && <i className="typewriter-caret" />}
          </span>
        ))}
      </span>
    </span>
  );
}
