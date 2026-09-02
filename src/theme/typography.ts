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
    large: { fontSize: '2.370816rem', fontWeight: 700, lineHeight: 1.17 },
    medium: { fontSize: '1.97568rem', fontWeight: 700, lineHeight: 1.15 },
    small: { fontSize: '1.580544rem', fontWeight: 700, lineHeight: 1.125 }
  },
  headings: {
    h1: '2.370816rem',
    h2: '1.97568rem',
    h3: '1.580544rem',
    h4: '1.382976rem',
    h5: '1.086624rem',
    h6: '0.98784rem'
  },
  body: {
    caption: '0.592704rem',
    small: '0.642096rem',
    secondary: '0.691488rem',
    medium: '0.790272rem',
    large: '0.98784rem'
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
