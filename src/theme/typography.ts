export interface HeadingScale {
  h1: string;
  h2: string;
  h3: string;
  h4: string;
  h5: string;
  h6: string;
}

export const typography = {
  fontFamily: {
    plusJakartaSans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif']
  },
  headings: {
    h1: '3rem',
    h2: '2.25rem',
    h3: '1.875rem',
    h4: '1.5rem',
    h5: '1.25rem',
    h6: '1rem'
  },
  body: {
    small: '0.875rem',
    medium: '1rem',
    large: '1.125rem'
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
} as const satisfies {
  fontFamily: { plusJakartaSans: string[] };
  headings: HeadingScale;
  body: { small: string; medium: string; large: string };
  weights: { regular: number; medium: number; semibold: number; bold: number };
};
