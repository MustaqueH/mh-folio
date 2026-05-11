/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js}', './src/**/*.css'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    screens: {
      /** Mobile-first: default ≤640px — next breakpoint begins tablet */
      sm: '641px',
      md: '768px',
      lg: '1025px',
      xl: '1441px',
      short: { raw: '(min-width: 768px) and (max-height: 720px)' },
    },
    spacing: {
      px: '1px',
      0: '0',
      xs: 'var(--space-xs)',
      sm: 'var(--space-sm)',
      md: 'var(--space-md)',
      base: 'var(--space-base)',
      lg: 'var(--space-lg)',
      xl: 'var(--space-xl)',
      '2xl': 'var(--space-2xl)',
      '3xl': 'var(--space-3xl)',
      /** Numeric keys map to the same scale for legacy utilities (p-4 = base, etc.) */
      1: 'var(--space-xs)',
      2: 'var(--space-sm)',
      3: 'var(--space-md)',
      4: 'var(--space-base)',
      5: 'var(--space-lg)',
      6: 'var(--space-lg)',
      7: 'var(--space-xl)',
      8: 'var(--space-xl)',
      9: 'var(--space-2xl)',
      10: 'var(--space-2xl)',
      11: 'var(--space-2xl)',
      12: 'var(--space-2xl)',
      14: 'var(--space-3xl)',
      16: 'var(--space-3xl)',
      20: 'var(--space-3xl)',
      24: 'var(--space-3xl)',
      28: 'var(--space-3xl)',
      32: 'var(--space-3xl)',
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-family-body)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-family-heading)', 'system-ui', 'sans-serif'],
        ui: ['var(--font-family-ui)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        page: 'var(--layout-max-lg)',
        readable: 'var(--layout-max-xs)',
        content: 'var(--layout-max-md)',
        wide: 'var(--layout-max-xl)',
      },
      fontSize: {
        display: [
          'var(--fs-display)',
          { lineHeight: 'var(--lh-display)', letterSpacing: 'var(--ls-display)' },
        ],
        headline: [
          'var(--fs-headline)',
          { lineHeight: 'var(--lh-headline)', letterSpacing: 'var(--ls-headline)' },
        ],
        subhead: [
          'var(--fs-subhead)',
          { lineHeight: 'var(--lh-subhead)', letterSpacing: 'var(--ls-subhead)' },
        ],
        body: ['var(--fs-body)', { lineHeight: 'var(--lh-body)' }],
        small: ['var(--fs-small)', { lineHeight: 'var(--lh-small)' }],
        lede: ['var(--fs-lede)', { lineHeight: 'var(--lh-lede)' }],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        'elev-0': 'var(--shadow-elev-0)',
        'elev-1': 'var(--shadow-elev-1)',
        'elev-2': 'var(--shadow-elev-2)',
        'elev-3': 'var(--shadow-elev-3)',
      },
    },
  },
  plugins: [],
};
