/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './renderer/**/*.{html,js,ts,tsx}',
    './pages/**/*.{html,js,ts,tsx}',
    './src/**/*.{html,js,ts,tsx}'
  ],
  theme: {
    screens: {
      xs: '375px', // iPhone XS
      sm: '430px', // iPhone 14 Pro Max
      md: '768px', // iPad Mini (vertical orientation)
      lg: '1024px', // iPad Mini (horizontal orientation)
      xl: '1440px', // MacBook 13"
      xxl: '1920px'
    },
    extend: {
      spacing: {
        18: '4.5rem',
      },
      colors: {
        overlay: 'rgba(42, 46, 50, 0.5)'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

