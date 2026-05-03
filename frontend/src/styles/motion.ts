/* ════════════════════════════════════════════════════════════
   MOTION PRESETS — framer-motion design system
   Import these instead of redefining initial/animate/transition.
════════════════════════════════════════════════════════════ */

import type { Variants, Transition } from 'framer-motion';

/* ── Easings ── */
export const easeOut = [0.25, 0.1, 0.25, 1] as const;
export const easeInOut = [0.4, 0, 0.2, 1] as const;

/* ── Durations (seconds) ── */
export const DURATION = {
    fast: 0.2,
    base: 0.3,
    slow: 0.55,
    hero: 0.6,
    image: 1.2,
} as const;

/* ── Stagger interval (used by container variants) ── */
export const STAGGER = 0.09;

/* ────────────────────────────────────────────────────────────
   FADE-UP — most common entrance (whileInView)
   Usage: <motion.div {...fadeUp(0.1)} />
──────────────────────────────────────────────────────────── */
export const fadeUp = (delay = 0) => ({
    initial:     { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    transition:  { duration: DURATION.slow, ease: easeOut, delay } as Transition,
    viewport:    { once: true, amount: 0.05 },
});

/* ────────────────────────────────────────────────────────────
   STAGGER — container + item variants
   Usage:
     <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
       <motion.div variants={staggerItem} />
     </motion.div>
──────────────────────────────────────────────────────────── */
export const staggerContainer: Variants = {
    hidden:  {},
    visible: { transition: { staggerChildren: STAGGER } },
};

export const staggerItem: Variants = {
    hidden:  { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: easeOut } },
};

/* ────────────────────────────────────────────────────────────
   HERO presets (animate on mount, not whileInView)
──────────────────────────────────────────────────────────── */

/* Background image — subtle scale-down + fade-in */
export const heroImage = {
    initial:    { scale: 1.08, opacity: 0 },
    animate:    { scale: 1, opacity: 1 },
    transition: { duration: DURATION.image, ease: easeOut } as Transition,
};

/* Hero title — delayed fade-up */
export const heroTitle = (delay = 0.3) => ({
    initial:    { opacity: 0, y: 28 },
    animate:    { opacity: 1, y: 0 },
    transition: { delay, duration: DURATION.hero, ease: easeOut } as Transition,
});

/* Hero badge cluster — quick fade-down */
export const heroBadges = (delay = 0.2) => ({
    initial:    { opacity: 0, y: -10 },
    animate:    { opacity: 1, y: 0 },
    transition: { delay, duration: 0.4, ease: easeOut } as Transition,
});

/* Hero rule (horizontal accent line) — scale-x in */
export const heroRule = (delay = 0.56) => ({
    initial:    { scaleX: 0, opacity: 0 },
    animate:    { scaleX: 1, opacity: 1 },
    transition: { delay, duration: 0.44, ease: easeOut } as Transition,
});

/* Hero subtitle — late fade-up */
export const heroSubtitle = (delay = 0.72) => ({
    initial:    { opacity: 0, y: 16 },
    animate:    { opacity: 1, y: 0 },
    transition: { delay, duration: DURATION.slow, ease: easeOut } as Transition,
});

/* Generic in-view fade-up with custom y-offset */
export const inViewFadeUp = (y = 20, delay = 0) => ({
    initial:     { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport:    { once: true, amount: 0.05 },
    transition:  { duration: DURATION.hero, ease: easeOut, delay } as Transition,
});
