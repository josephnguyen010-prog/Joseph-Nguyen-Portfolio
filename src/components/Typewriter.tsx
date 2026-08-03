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
}

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Typewriter({
  phrases,
  start = true,
  typeSpeed = 80,
  deleteSpeed = 38,
  holdAfterType = 3800,
  holdAfterDelete = 700,
  loop = true,
}: Props) {
  const reduced = useRef(prefersReducedMotion()).current;
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

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

  // Reserve the box using the longest phrase so the surrounding layout never
  // reflows as text is typed or wiped.
  const longest = phrases.reduce((a, b) => (b.length > a.length ? b : a), "");
  const shown = reduced ? phrases[0] ?? "" : (phrases[index] ?? "").slice(0, count);

  return (
    <span className="typewriter" aria-hidden="true">
      {/* Text only — no caret. Including one here pushed the longest phrase
          onto an extra line and reserved a blank row beneath the heading. The
          caret costs no width (see the negative margin in Main.scss), so it
          needs no space reserved for it. */}
      <span className="typewriter-ghost">{longest}</span>
      <span className="typewriter-text">
        {shown}
        {!reduced && <i className="typewriter-caret" />}
      </span>
    </span>
  );
}
