import gsap from 'gsap';

export function fadeIn(targets: gsap.TweenTarget, options?: gsap.TweenVars) {
  return gsap.fromTo(
    targets,
    { opacity: 0 },
    { opacity: 1, duration: 0.6, ease: 'power2.out', ...options }
  );
}
