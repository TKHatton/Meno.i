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
        // Meno.i brand colors - elegant, warm, sophisticated
        // Based on logo: peachy/sand tones on dark background
        primary: {
          50: '#faf6f4',
          100: '#f5ede8',
          200: '#ecdcd1',
          300: '#e2c5b5',
          400: '#d5a894',
          500: '#c48a70',
          600: '#b27157',
          700: '#955b47',
          800: '#7a4c3d',
          900: '#654036',
        },
        neutral: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
        dark: {
          DEFAULT: '#0a0a0a',
          50: '#1a1a1a',
          100: '#141414',
        },
      },
    },
  },
  plugins: [],
}
export default config
