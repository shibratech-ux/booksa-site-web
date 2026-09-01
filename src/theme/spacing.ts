export const spacing = {
  0: '0px',
  0.5: '0.125rem',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem'
} as const;

export const semanticSpacing = {
  iconText: spacing[2],
  relatedControls: spacing[3],
  fieldGap: spacing[4],
  cardPadding: spacing[5],
  cardGap: spacing[6],
  sectionMobile: spacing[8],
  sectionTablet: spacing[12],
  sectionDesktop: spacing[16]
} as const;
