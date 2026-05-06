import { animate, inView, scroll, stagger } from "motion";

export function initAnimations(): void {
  // Respect prefers-reduced-motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll<HTMLElement>("[data-reveal],[data-reveal-item]").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  // ─── Scroll progress bar ────────────────────────────────────────────────
  const bar = document.getElementById("scroll-progress");
  if (bar) {
    scroll(({ y }) => {
      bar.style.transform = `scaleX(${y.progress})`;
    });
  }

  // ─── Hero parallax (grid + glow move at 0.25× scroll speed) ────────────
  const hero = document.querySelector<HTMLElement>("#hero");
  const heroGrid = document.querySelector<HTMLElement>(".hero-grid");
  const heroGlow = document.querySelector<HTMLElement>(".hero-glow");
  if (hero && heroGrid) {
    scroll(
      ({ y }) => {
        const offset = y.progress * 40;
        heroGrid.style.transform = `translateY(${offset}px)`;
        if (heroGlow) heroGlow.style.transform = `translateY(${offset * 0.6}px)`;
      },
      { target: hero }
    );
  }

  // ─── Single-element reveals [data-reveal] ───────────────────────────────
  document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
    inView(
      el,
      () => {
        animate(el, { opacity: [0, 1], y: [24, 0] }, {
          duration: 0.85,
          ease: [0.22, 1, 0.36, 1],
        });
      },
      { amount: 0.15 }
    );
  });

  // ─── Staggered group reveals [data-reveal-group] → [data-reveal-item] ──
  document.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach((group) => {
    const items = Array.from(group.querySelectorAll<HTMLElement>("[data-reveal-item]"));
    if (!items.length) return;

    inView(
      group,
      () => {
        animate(
          items,
          { opacity: [0, 1], y: [28, 0] },
          { duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: stagger(0.1) }
        );
      },
      { amount: 0.1 }
    );
  });

  // ─── Processus: timeline connecting line grows on entry ─────────────────
  const procLine = document.querySelector<HTMLElement>(".proc-line");
  const processusSection = document.querySelector<HTMLElement>("#processus");
  if (procLine && processusSection) {
    inView(
      processusSection,
      () => {
        animate(procLine, { width: ["0%", "75%"] }, {
          duration: 1.5,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.35,
        });
      },
      { amount: 0.25 }
    );
  }

  // ─── Nav: subtle entrance on first load ─────────────────────────────────
  const nav = document.querySelector<HTMLElement>("#nav");
  if (nav) {
    animate(nav, { opacity: [0, 1], y: [-8, 0] }, {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.1,
    });
  }
}
