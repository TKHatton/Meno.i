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
        // MenoAI color palette - warm, calming, feminine but not stereotypical
        primary: {
          50: '#fdf4f3',
          100: '#fce8e6',
          200: '#fad5d1',
          300: '#f5b5ad',
          400: '#ed8b7e',
          500: '#e06655',
          600: '#cc4a3a',
          700: '#ab3b2e',
          800: '#8e342a',
          900: '#763128',
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
      },
    },
  },
  plugins: [],
}
export default config
