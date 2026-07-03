import gsap from 'gsap';

export function scaleIn(targets: gsap.TweenTarget, options?: gsap.TweenVars) {
  return gsap.fromTo(
    targets,
    { opacity: 0, scale: 0.96 },
    { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.2)', ...options }
  );
}
