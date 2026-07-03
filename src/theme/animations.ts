export const animations = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 }
  },
  slideUp: {
    from: { opacity: 0, y: 24 },
    to: { opacity: 1, y: 0 }
  },
  slideLeft: {
    from: { opacity: 0, x: 24 },
    to: { opacity: 1, x: 0 }
  },
  slideRight: {
    from: { opacity: 0, x: -24 },
    to: { opacity: 1, x: 0 }
  },
  scaleIn: {
    from: { opacity: 0, scale: 0.96 },
    to: { opacity: 1, scale: 1 }
  },
  dashboardCounter: {
    duration: 900,
    easing: 'ease-out'
  },
  cardHover: {
    lift: -4,
    scale: 1.01
  },
  sidebarExpand: {
    width: '18rem',
    collapsedWidth: '5.25rem'
  },
  modal: {
    backdrop: { opacity: 1 },
    panel: { opacity: 1, scale: 1, y: 0 }
  }
} as const;
