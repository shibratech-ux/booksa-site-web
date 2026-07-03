export const pageVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, filter: 'blur(4px)' }
};

export const slideVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0 }
};

export const cardVariants = {
  initial: { opacity: 0, y: 18, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 }
};
