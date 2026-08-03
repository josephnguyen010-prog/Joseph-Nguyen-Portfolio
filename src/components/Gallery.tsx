import React, { useCallback, useEffect, useRef, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Reveal from './Reveal';
import '../assets/styles/Gallery.scss';

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

function Gallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeButton = useRef<HTMLButtonElement | null>(null);
  // Remembers what was focused before the lightbox opened, to restore after.
  const lastFocused = useRef<HTMLElement | null>(null);

  const open = (index: number) => {
    lastFocused.current = document.activeElement as HTMLElement;
    setOpenIndex(index);
  };

  const close = useCallback(() => {
    setOpenIndex(null);
    lastFocused.current?.focus();
  }, []);

  const step = useCallback((delta: number) => {
    setOpenIndex((current) => {
      if (current === null) return current;
      return (current + delta + photos.length) % photos.length;
    });
  }, []);

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
    <div className="container" id="gallery">
      <div className="gallery-container">
        <Reveal><h1>Gallery</h1></Reveal>
        <div className="gallery-grid">
          {photos.map((photo, index) => (
            <Reveal
              key={photo.caption}
              className="gallery-item"
              delay={(index % 4) * 90}
              distance={30}
            >
              <button
                type="button"
                className="gallery-button"
                onClick={() => open(index)}
                aria-label={`Open ${photo.caption} full size`}
              >
                <img src={photo.src} alt={photo.caption} loading="lazy" />
                <span className="gallery-caption">{photo.caption}</span>
              </button>
            </Reveal>
          ))}
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

export default Gallery;
