import gsap from 'gsap';

export function scrollReveal(targets: gsap.TweenTarget) {
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 32 },
    {
      opacity: 1,
      y: 0,
      duration: 0.75,
      ease: 'power2.out'
    }
  );
}
