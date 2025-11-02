import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Meno.i brand colors - soft, elegant minimalism with warm feminine energy
        // Inspired by Tailors Mobile App aesthetic
        primary: {
          50: '#faf7f5',
          100: '#f2e9e4',   // Soft blush background
          200: '#ead9d0',
          300: '#e1c8ba',
          400: '#d8a588',   // Muted peach - main brand color
          500: '#d09875',
          600: '#c7896e',   // Highlight tone for hover/CTA
          700: '#b37658',
          800: '#8f5e46',
          900: '#6f4936',
        },
        secondary: {
          50: '#faf7f5',
          100: '#f2e9e4',   // Soft blush - for cards, panels, section dividers
          200: '#ead9d0',
          300: '#e1c8ba',
          400: '#d8c4b5',
          500: '#cfb5a5',
          600: '#b89d8d',
          700: '#a18675',
          800: '#7d6a5c',
          900: '#5f524a',
        },
        neutral: {
          50: '#f9f6f4',    // Light sections
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#2c2c2c',   // Primary text
          900: '#000000',   // Contrast headings
        },
        dark: {
          DEFAULT: '#0a0a0a',
          50: '#1a1a1a',
          100: '#141414',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Libre Baskerville', 'Georgia', 'serif'],
        sans: ['Inter', 'Lato', 'Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        'pill': '9999px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.06)',
        'elegant': '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
export default config
