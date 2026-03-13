/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', '../common/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Claude AI light theme palette
        cl: {
          bg:           '#F9F8F5', // page background (warm off-white)
          surface:      '#FFFFFF', // card / modal surface
          'surface-2':  '#F5F2ED', // input / secondary surface
          'surface-3':  '#EDE9E2', // hover on secondary
          border:       '#E8E4DC', // subtle border
          'border-md':  '#D8D4CC', // medium border
          text:         '#1A1918', // primary text
          'text-2':     '#3B3935', // secondary text
          muted:        '#6B6860', // muted text
          subtle:       '#9B9890', // very muted
          dim:          '#C8C4BB', // icon/placeholder
          accent:       '#D97757', // Claude orange
          'accent-h':   '#C26440', // accent hover
          'accent-bg':  '#FBF0EB', // accent tinted bg
          'accent-mid': '#F0C4B0', // accent spinner ring
        },
      },
    },
  },
  plugins: [],
};
