/** @type {import('tailwindcss').Config} */

/**
 * Map all color extension based on their color name
 */
const colorNames = ['neutral', 'primary', 'secondary', 'success', 'warning', 'danger'];

let colors = {};
colorNames.map((color) => {
  colors[color] = {
    50: `var(--${color}-50)`,
    100: `var(--${color}-100)`,
    200: `var(--${color}-200)`,
    300: `var(--${color}-300)`,
    400: `var(--${color}-400)`,
    500: `var(--${color}-500)`,
    600: `var(--${color}-600)`,
    700: `var(--${color}-700)`,
    800: `var(--${color}-800)`,
    900: `var(--${color}-900)`
  };
});

const sizes = {
  100: '100px',
  150: '150px',
  250: '250px',
  323: '323px',
  368: '368px'
};

// eslint-disable-next-line no-undef
module.exports = {
  content: ['./{pages,components}/**/*.{js,jsx,ts,tsx}', './stories/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ...colors,
        label: '#667085',
        info: '#101828',
        metamask: 'var(--metamask)',
        walletconnect: 'var(--walletconnect)'
      },
      borderColor: {
        info: '#e8ebf5'
      },
      fontSize: {
        h1: '2rem',
        h2: '1.75rem',
        h3: '1.625rem',
        h4: '1.5rem',
        h5: '1.25rem',
        h6: '1rem',
        xxs: '0.625rem',
        tiny: '0.5625rem',
        title: '32px',
        subtitle: '22px',
        paragraph: '20px',
        base: '16px',
        body: '14px',
        caption: '12px',
        small: '10px'
      },
      spacing: {
        13: '3.25rem'
      },
      lineHeight: {
        title: '1.68',
        subtitle: '1.73',
        paragraph: '1.5',
        base: '1.5',
        body: '1.43',
        caption: '1.67',
        small: '2.4'
      },
      borderRadius: {
        8: '8px',
        10: '10px'
      },
      width: sizes,
      height: sizes,
      maxWidth: sizes,
      maxHeight: sizes,
      minWidth: sizes,
      minHeight: sizes
    }
  },
  plugins: [],
  variants: {
    extend: {
      textColor: ['group-hover', 'group-focus'],
      backgroundColor: ['group-hover', 'group-focus'],
      borderColor: ['group-hover', 'group-focus'],
      translate: ['group-hover', 'group-focus'],
      border: ['group-last']
    }
  },
  mode: 'jit',
  purge: ['./{pages,components}/**/*.{js,jsx,ts,tsx}', './stories/**/*.{ts,tsx}']
};
