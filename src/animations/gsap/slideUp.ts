import gsap from 'gsap';

export function slideUp(targets: gsap.TweenTarget, options?: gsap.TweenVars) {
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 28 },
    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', ...options }
  );
}
