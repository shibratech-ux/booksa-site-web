import anime from 'animejs';

export function textReveal(targets: string | Element | Element[]) {
  return anime({
    targets,
    opacity: [0, 1],
    translateY: [18, 0],
    easing: 'easeOutExpo',
    duration: 900,
    delay: anime.stagger(50)
  });
}
