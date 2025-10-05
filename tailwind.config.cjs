/** @type {import('tailwindcss').Config} */
const baseFontSize = 10;

const convert = value => {
  return (16 * value) / baseFontSize + 'rem';
};

module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
        },
        'primary-light': {
          DEFAULT: 'var(--color-primary-light)',
        },
        'icon-dark': {
          DEFAULT: 'var(--icon-dark)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
        },
        error: {
          lighter: 'var(--color-error-lighter)',
          DEFAULT: 'var(--color-error)',
        },
      },
      spacing: () =>
        Object.fromEntries(
          Array.from({ length: 100 / 0.5 + 1 }, (_, index) => [
            (index * 0.5).toString(),
            `${(index * 0.2).toFixed(1)}rem`,
          ])
        ),
      width: () =>
        Object.fromEntries(
          Array.from({ length: 100 / 0.5 + 1 }, (_, index) => [
            (index * 0.5).toString(),
            `${(index * 0.2).toFixed(1)}rem`,
          ])
        ),
      fontSize: {
        xs: [
          `${convert(0.75)}` /* 12px */,
          {
            lineHeight: `${convert(1)}` /* 16px */,
          },
        ],
        sm: [
          `${convert(0.875)}` /* 14px */,
          {
            lineHeight: `${convert(1.25)}` /* 20px */,
          },
        ],
        base: [
          `${convert(1)}` /* 16px */,
          {
            lineHeight: `${convert(1.5)}` /* 24px */,
          },
        ],
        lg: [
          `${convert(1.125)}` /* 18px */,
          {
            lineHeight: `${convert(1.75)}` /* 28px */,
          },
        ],
        xl: [
          `${convert(1.25)}` /* 20px */,
          {
            lineHeight: `${convert(1.75)}` /* 28px */,
          },
        ],
        '2xl': [
          `${convert(1.5)}` /* 24px */,
          {
            lineHeight: `${convert(2)}` /* 32px */,
          },
        ],
        '3xl': [
          `${convert(1.875)}` /* 30px */,
          {
            lineHeight: `${convert(2.25)}` /* 36px */,
          },
        ],
        '4xl': [
          `${convert(2.25)}` /* 36px */,
          {
            lineHeight: `${convert(2.5)}` /* 40px */,
          },
        ],
        '5xl': [
          `${convert(3)}` /* 48px */,
          {
            lineHeight: 4 / 3,
          },
        ],
        '6xl': [
          `${convert(3.75)}` /* 60px */,
          {
            lineHeight: `${convert(1)}`,
          },
        ],
        '7xl': [
          `${convert(4.5)}` /* 72px */,
          {
            lineHeight: `${convert(1)}`,
          },
        ],
        '8xl': [
          `${convert(6)}` /* 96px */,
          {
            lineHeight: `${convert(1)}`,
          },
        ],
        '9xl': [
          `${convert(8)}` /* 128px */,
          {
            lineHeight: `${convert(1)}`,
          },
        ],
      },
      lineHeight: {
        3: `${convert(0.75)}` /* 12px */,
        4: `${convert(1)}` /* 16px */,
        5: `${convert(1.25)}` /* 20px */,
        6: `${convert(1.5)}` /* 24px */,
        7: `${convert(1.75)}` /* 28px */,
        8: `${convert(2)}` /* 32px */,
        9: `${convert(2.25)}` /* 36px */,
        10: `${convert(2.5)}` /* 40px */,
      },
      borderRadius: {
        sm: `${convert(0.125)}` /* 2px */,
        DEFAULT: `${convert(0.25)}` /* 4px */,
        md: `${convert(0.375)}` /* 6px */,
        lg: `${convert(0.5)}` /* 8px */,
        xl: `${convert(0.75)}` /* 12px */,
        '2xl': `${convert(1)}` /* 16px */,
        '3xl': `${convert(1.5)}` /* 24px */,
      },
      minWidth: theme => ({
        ...theme('spacing'),
        0: '0rem',
        xs: `${convert(20)}` /* 320px */,
        sm: `${convert(24)}` /* 384px */,
        md: `${convert(28)}` /* 448px */,
        lg: `${convert(32)}` /* 512px */,
        xl: `${convert(36)}` /* 576px */,
        '2xl': `${convert(42)}` /* 672px */,
        '3xl': `${convert(48)}` /* 768px */,
        '4xl': `${convert(56)}` /* 896px */,
        '5xl': `${convert(64)}` /* 1024px */,
        '6xl': `${convert(72)}` /* 1152px */,
        '7xl': `${convert(80)}` /* 1280px */,
      }),
      maxWidth: theme => ({
        ...theme('spacing'),
        0: '0rem',
        xs: `${convert(20)}` /* 320px */,
        sm: `${convert(24)}` /* 384px */,
        md: `${convert(28)}` /* 448px */,
        lg: `${convert(32)}` /* 512px */,
        xl: `${convert(36)}` /* 576px */,
        '2xl': `${convert(42)}` /* 672px */,
        '3xl': `${convert(48)}` /* 768px */,
        '4xl': `${convert(56)}` /* 896px */,
        '5xl': `${convert(64)}` /* 1024px */,
        '6xl': `${convert(72)}` /* 1152px */,
        '7xl': `${convert(80)}` /* 1280px */,
      }),
      screens: {
        /** Min width */
        'min-1025': {
          min: '1025px',
        },
        'min-769': {
          min: '769px',
        },
        'min-641': {
          min: '641px',
        },
        'min-481': {
          min: '481px',
        },
        /** Max width */
        'max-1024': {
          max: '1024px',
        },
        'max-768': {
          max: '768px',
        },
        'max-640': {
          max: '640px',
        },
        'max-480': {
          max: '480px',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
    require('tailwind-capitalize-first-letter'),
  ],
  corePlugins: {
    preflight: false,
  },
};
