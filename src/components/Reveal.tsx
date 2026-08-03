import React, {
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

interface Props {
  /** Milliseconds to wait after entering the viewport. Use to stagger siblings. */
  delay?: number;
  /** Length of the transition in milliseconds. */
  duration?: number;
  /** Which way the element travels as it appears. */
  direction?: Direction;
  /** How far it travels, in pixels. */
  distance?: number;
  /**
   * Fraction of the element that must be visible before it fires. Left at 0 by
   * default: a non-zero threshold is a share of the element's own area, so a
   * section taller than the viewport can never reach it. The rootMargin below
   * is what actually controls when things trigger.
   */
  threshold?: number;
  /** Animate every time it scrolls into view, rather than only the first time. */
  repeat?: boolean;
  className?: string;
}

const offset = (direction: Direction, distance: number): string => {
  switch (direction) {
    case "up":
      return `translateY(${distance}px)`;
    case "down":
      return `translateY(-${distance}px)`;
    case "left":
      return `translateX(${distance}px)`;
    case "right":
      return `translateX(-${distance}px)`;
    default:
      return "none";
  }
};

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Reveal(props: PropsWithChildren<Props>) {
  const {
    delay = 0,
    duration = 700,
    direction = "up",
    distance = 40,
    threshold = 0,
    repeat = false,
    className,
    children,
  } = props;

  const ref = useRef<HTMLDivElement | null>(null);
  // Anyone who asked for reduced motion starts visible and never animates.
  const [reduced] = useState(prefersReducedMotion);
  const [visible, setVisible] = useState(reduced);

  useEffect(() => {
    if (reduced) return;

    const node = ref.current;
    if (!node) return;

    // Fall back to always-visible where IntersectionObserver is unavailable,
    // so content can never be stranded at opacity 0.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (!repeat) observer.unobserve(entry.target);
          } else if (repeat) {
            setVisible(false);
          }
        });
      },
      // Shrinking the root's bottom edge means an element fires once its top
      // has risen into the lower fifth of the screen - late enough that you are
      // looking at it, early enough that it is not already half read. Works the
      // same whether the element is 100px or 4000px tall.
      { threshold, rootMargin: "0px 0px -18% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced, repeat, threshold]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : offset(direction, distance),
        transition: reduced
          ? undefined
          : `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: visible ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
