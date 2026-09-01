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
    large: { fontSize: '2.52rem', fontWeight: 700, lineHeight: 1.17 },
    medium: { fontSize: '2.1rem', fontWeight: 700, lineHeight: 1.15 },
    small: { fontSize: '1.68rem', fontWeight: 700, lineHeight: 1.125 }
  },
  headings: {
    h1: '2.52rem',
    h2: '2.1rem',
    h3: '1.68rem',
    h4: '1.47rem',
    h5: '1.155rem',
    h6: '1.05rem'
  },
  body: {
    caption: '0.63rem',
    small: '0.6825rem',
    secondary: '0.735rem',
    medium: '0.84rem',
    large: '1.05rem'
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
