/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        github: {
          bg: '#0a0d14',
          card: '#121722',
          border: '#1e293b',
          text: '#e2e8f0',
          muted: '#94a3b8',
          accent: '#10b981',
          blue: '#38bdf8',
          purple: '#818cf8',
        },
        flicko: {
          bg: '#0a0d14',
          card: '#121722',
          border: '#1e293b',
          text: '#e2e8f0',
          muted: '#94a3b8',
          primary: '#6366f1',
          accent: '#10b981',
          cyan: '#38bdf8',
        },
      },
    },
  },
  plugins: [],
};
