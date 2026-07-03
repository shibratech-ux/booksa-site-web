import anime from 'animejs';

export function cardAnimation(targets: string | Element | Element[]) {
  return anime({
    targets,
    opacity: [0, 1],
    scale: [0.96, 1],
    translateY: [20, 0],
    delay: anime.stagger(80),
    duration: 700,
    easing: 'easeOutCubic'
  });
}
