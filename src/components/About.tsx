import React, { useCallback, useEffect, useRef, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Reveal from './Reveal';
import '../assets/styles/About.scss';

import rsmInternClass from '../assets/images/gallery/rsm-intern-class.webp';
import rsmGameNight from '../assets/images/gallery/rsm-game-night.webp';
import nationalInternDay from '../assets/images/gallery/national-intern-day.webp';
import virginiaTech from '../assets/images/gallery/virginia-tech.webp';
import chicago from '../assets/images/gallery/chicago.webp';
import minneapolis from '../assets/images/gallery/minneapolis.webp';
import vietnam from '../assets/images/gallery/vietnam.webp';
import worldCup from '../assets/images/gallery/world-cup-2026.webp';

interface Photo {
  src: string;
  caption: string;
}

const photos: Photo[] = [
  { src: rsmInternClass, caption: 'RSM 2025 Intern Class' },
  { src: rsmGameNight, caption: 'RSM Innovation Team Game Night' },
  { src: nationalInternDay, caption: 'National Intern Day' },
  { src: virginiaTech, caption: 'Virginia Tech' },
  { src: chicago, caption: 'Chicago' },
  { src: minneapolis, caption: 'Minneapolis' },
  { src: vietnam, caption: 'Vietnam' },
  { src: worldCup, caption: 'World Cup 2026' },
];

/**
 * How long each photo holds before the carousel moves on by itself. The slide
 * itself takes 520ms of this, so the real pause on each photo is a little over
 * two seconds - brisk without being a flicker, and eight photos come round in
 * well under half a minute.
 */
const AUTO_ADVANCE_MS = 3000;

function About() {
  /** Which photo the carousel is showing. */
  const [index, setIndex] = useState(0);
  /** Which photo the lightbox is showing, or null when it is closed. */
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  /** Held while the visitor is reading or tabbing through the carousel. */
  const [paused, setPaused] = useState(false);

  const closeButton = useRef<HTMLButtonElement | null>(null);
  // Remembers what was focused before the lightbox opened, to restore after.
  const lastFocused = useRef<HTMLElement | null>(null);

  const advance = useCallback((delta: number) => {
    setIndex((current) => (current + delta + photos.length) % photos.length);
  }, []);

  const open = (i: number) => {
    lastFocused.current = document.activeElement as HTMLElement;
    setOpenIndex(i);
  };

  const close = useCallback(() => {
    // Leave the carousel on whatever the lightbox was last showing, so closing
    // it does not throw away the browsing the visitor just did.
    if (openIndex !== null) setIndex(openIndex);
    setOpenIndex(null);
    lastFocused.current?.focus();
  }, [openIndex]);

  const step = useCallback((delta: number) => {
    setOpenIndex((current) => {
      if (current === null) return current;
      return (current + delta + photos.length) % photos.length;
    });
  }, []);

  /**
   * Advance on its own, but not while the pointer is over it, not while
   * anything inside it holds focus, not behind an open lightbox, and not at all
   * for anyone who has asked for reduced motion. A carousel that keeps moving
   * under a visitor mid-read is worse than one that never moves.
   */
  useEffect(() => {
    if (paused || openIndex !== null) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => advance(1), AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [paused, openIndex, advance]);

  // Keyboard control while the lightbox is open.
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openIndex, close, step]);

  // Freeze the page behind the lightbox.
  useEffect(() => {
    if (openIndex === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [openIndex]);

  const active = openIndex === null ? null : photos[openIndex];

  return (
    <div className="container" id="about">
      <div className="about-container">
        <Reveal><h1>About Me</h1></Reveal>

        <div className="about-layout">
          <Reveal className="about-copy" delay={90}>
            {/* No greeting here: the hero's typewriter has already said "Hey my
                name is Joseph Nguyen" and "Welcome to my portfolio" a few
                hundred pixels above, and saying hello twice in one scroll reads
                as a mistake. */}
            <p className="about-bio">
              I'm a student at Virginia Tech studying Business Information
              Technology. I'm really passionate about problem solving and creating
              things that solve some sort of problem in my life or creating things
              that I think it would be really cool to share. Check out down below for
              some projects that showcase my passion for building and problem solving.
            </p>
            {/* Second paragraph is also what gives this column enough height to
                sit alongside the carousel rather than trailing off halfway up. */}
            <p className="about-bio">
              Outside of class I play video games with my friends, travel
              whenever I can, and eat a lot of very good Southeast Asian food. I
              keep telling myself I'll read more books and finally pick up
              pickleball or golf{' '}
              {/* Held on one line: split across a line break it reads as two
                  stray fragments rather than an aside. Kept short enough to
                  still fit the narrow mobile column unbroken. */}
              <span className="about-ps">(P.S. send me book recs below)</span>.
            </p>
          </Reveal>

          <Reveal className="about-media" delay={160} distance={30}>
            {/* Pause on hover and on focus-within: the capture phase catches
                focus landing on any of the buttons inside, which bubbling
                focus events would not. */}
            <div
              className="carousel"
              aria-roledescription="carousel"
              aria-label="Photos"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocusCapture={() => setPaused(true)}
              onBlurCapture={() => setPaused(false)}
            >
              <div className="carousel-viewport">
                <div
                  className="carousel-track"
                  style={{ transform: `translateX(-${index * 100}%)` }}
                >
                  {photos.map((photo, i) => (
                    <button
                      type="button"
                      key={photo.caption}
                      className="carousel-slide"
                      onClick={() => open(i)}
                      /* Offscreen slides stay out of the tab order and out of
                         the accessibility tree, rather than being eight
                         invisible stops between the bio and whatever is next. */
                      tabIndex={i === index ? 0 : -1}
                      aria-hidden={i !== index}
                      aria-label={`Open ${photo.caption} full size`}
                    >
                      <img
                        src={photo.src}
                        alt={photo.caption}
                        loading={i === 0 ? undefined : 'lazy'}
                      />
                      {/* Rides on the photo and stays out of the way until
                          asked for. Hovering also stops the carousel, so the
                          same gesture holds the photo still and names it. */}
                      <span className="carousel-caption">{photo.caption}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="carousel-nav is-prev"
                  onClick={() => advance(-1)}
                  aria-label="Previous photo"
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  type="button"
                  className="carousel-nav is-next"
                  onClick={() => advance(1)}
                  aria-label="Next photo"
                >
                  <ChevronRightIcon />
                </button>
              </div>

              {/* No caption line below the frame any more, and no live region:
                  each slide's name is already on its button label, and a
                  carousel that announced itself every five seconds would be
                  hostile to anyone listening to the page. */}
              <div className="carousel-dots">
                {photos.map((photo, i) => (
                  <button
                    type="button"
                    key={photo.caption}
                    className={`carousel-dot${i === index ? ' is-active' : ''}`}
                    onClick={() => setIndex(i)}
                    aria-label={`Show ${photo.caption}`}
                    aria-current={i === index}
                  />
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {active && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={active.caption}
          onClick={close}
        >
          <button
            type="button"
            ref={closeButton}
            className="lightbox-close"
            onClick={close}
            aria-label="Close"
          >
            <CloseIcon />
          </button>

          <button
            type="button"
            className="lightbox-nav lightbox-prev"
            onClick={(e) => { e.stopPropagation(); step(-1); }}
            aria-label="Previous photo"
          >
            <ChevronLeftIcon />
          </button>

          {/* Stops a click on the image itself from closing the dialog. */}
          <figure className="lightbox-figure" onClick={(e) => e.stopPropagation()}>
            <img src={active.src} alt={active.caption} />
            <figcaption>{active.caption}</figcaption>
          </figure>

          <button
            type="button"
            className="lightbox-nav lightbox-next"
            onClick={(e) => { e.stopPropagation(); step(1); }}
            aria-label="Next photo"
          >
            <ChevronRightIcon />
          </button>
        </div>
      )}
    </div>
  );
}

export default About;
