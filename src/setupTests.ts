// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

/**
 * jsdom implements neither of these, and several components reach for them while
 * rendering — LoadingScreen, Reveal and Typewriter all read matchMedia to check
 * prefers-reduced-motion, and Reveal observes its own visibility. Without the
 * shims, rendering App throws before any assertion runs.
 *
 * matchMedia reports no match, so tests see the full-motion path. The observer
 * never fires, which is the honest default: nothing is on screen in jsdom.
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
  root = null;
  rootMargin = '';
  thresholds = [];
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

/** Typewriter watches the heading's width to size each phrase to one line. */
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

/**
 * jsdom has no canvas backend and logs a long "not implemented" error the first
 * time anything asks for a 2D context. Typewriter measures text against one to
 * decide how large a phrase can be, and already treats a missing context as
 * "cannot measure, leave the CSS size alone" - so return null quietly rather
 * than let that path print a stack trace on every run.
 */
Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
  writable: true,
  value: () => null,
});
