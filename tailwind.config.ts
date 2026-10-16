import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rosa:      '#e8a09a',
        'rosa-deep': '#c96b63',
        dorado:    '#b8915a',
        bg:        '#f9e9e7',
        bg2:       '#f2dbd8',
        fg:        '#2c1a18',
        'fg-soft': '#8a6260',
      },
      fontFamily: {
        display: ['DM Serif Display', 'Georgia', 'serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config