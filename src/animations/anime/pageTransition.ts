import anime from 'animejs';

export function pageTransition(targets: string | Element | Element[]) {
  return anime({
    targets,
    opacity: [0, 1],
    translateX: [16, 0],
    duration: 500,
    easing: 'easeOutQuad'
  });
}
