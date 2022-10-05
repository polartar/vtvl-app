/** @type {import('tailwindcss').Config} */

/**
 * Map all color extension based on their color name
 */
 const colorNames = ['neutral', 'primary', 'secondary', 'success', 'warning', 'danger'];
 let colors = {}
 colorNames.map(color => {
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
     900: `var(--${color}-900)`,
   }
 })
 
 module.exports = {
   content: [
     "./{pages,components}/**/*.{js,jsx,ts,tsx}",
   ],
   theme: {
     extend: {
       colors,
       fontSize: {
         h1: '2rem',
         h2: '1.75rem',
         h3: '1.625rem',
         h4: '1.5rem',
         h5: '1.25rem',
         h6: '1rem'
       },
       spacing: {
         '13': '3.25rem'
       }
     },
   },
   plugins: [],
 }
 