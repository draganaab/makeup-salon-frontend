import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D291BC',      // Soft mauve
        secondary: '#FFE0F0',    // Light blush pink
        accent: '#A044FF',       // Rich purple
        'dark-text': '#3C3C3C',  // Deep charcoal
        'light-text': '#FFFFFF', // White
        background: '#FFF8FA',   // Very light pink
        border: '#E0CFE3',       // Soft lavender-gray
      }
    },
  },
  plugins: [],
}
export default config