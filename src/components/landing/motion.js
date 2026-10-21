/**
 * Konstanta timing animasi landing page.
 *
 * Semua nilai dalam milidetik. Dipusatkan agar mudah disetel
 * tanpa menyentuh banyak file, dan agar ritme animasi konsisten
 * antar section (mis. stagger kartu selalu 90ms).
 */

/** Delay awal animasi entrance hero. */
export const HERO_DELAY = {
  eyebrow: 60,
  titleLine1: 140,
  titleLine2: 330,
  titleLine3: 520,
  subcopy: 640,
  cta: 740,
  trust: 840,
};

/** Delay pop-in node ilustrasi orbit. */
export const ORBIT_DELAY = {
  logo: 200,
  node: 360,
  step: 60,
};

/** Jeda antar kata pada headline. */
export const SPLIT_STEP = 55;

/** Stagger antar kartu / item dalam satu section. */
export const STAGGER = {
  card: 90,
  step: 100,
  integration: 60,
  integrationBase: 120,
};

/** Durasi animasi. */
export const DURATION = {
  fast: 400,
  base: 500,
  slow: 600,
};
