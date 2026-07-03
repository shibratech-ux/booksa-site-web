export const pageTransition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1]
} as const;

export const hoverTransition = {
  duration: 0.2,
  ease: 'easeOut'
} as const;

export const staggerTransition = {
  staggerChildren: 0.06,
  delayChildren: 0.04
} as const;
