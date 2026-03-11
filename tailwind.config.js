/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,vue}',
    './content/**/*.{md,yml,yaml,json}',
    './shared/**/*.{js,ts}',
    './nuxt.config.{js,ts,mjs}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: 'var(--color-accent)',
      },
    },
  },
  plugins: [],
}
