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
  display: {
    large: { fontSize: '3rem', fontWeight: 700, lineHeight: 1.17 },
    medium: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.15 },
    small: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.125 }
  },
  headings: {
    h1: '3rem',
    h2: '2.5rem',
    h3: '2rem',
    h4: '1.5rem',
    h5: '1.25rem',
    h6: '1.125rem'
  },
  body: {
    caption: '0.75rem',
    small: '0.8125rem',
    secondary: '0.875rem',
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
  display: Record<'large' | 'medium' | 'small', { fontSize: string; fontWeight: number; lineHeight: number }>;
  body: { caption: string; small: string; secondary: string; medium: string; large: string };
  weights: { regular: number; medium: number; semibold: number; bold: number };
};
