/**
 * Whether the visitor has asked the OS for reduced motion. Guarded both ways:
 * there is no window during a server render, and jsdom has no matchMedia.
 */
export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
