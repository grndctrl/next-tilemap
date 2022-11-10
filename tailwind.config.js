/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'blue-1': '#79D6CC',
        'blue-2': '#4593AF',
        'green-0': '#DEEED6',
        'green-1': '#6DAA2C',
        'green-2': '#346524',
        'yellow-1': '#DAD45E',
        'yellow-2': '#7A663C',
        'yellow-3': '#584E49',
        'navy-1': '#6A8284',
        'navy-2': '#353D51',
        'navy-3': '#26262F',
        'purple-1': '#847089',
        'purple-2': '#3D2736',
        'red-0': '#D2AA99',
        'red-1': '#D04648',
        'red-2': '#87344D',
      },
    },
  },
  plugins: [],
};
