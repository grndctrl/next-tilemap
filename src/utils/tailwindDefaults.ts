import resolveConfig from 'tailwindcss/resolveConfig';
import { DefaultColors } from 'tailwindcss/types/generated/colors';

const defaultConfig = {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
};

const fullConfig = resolveConfig(defaultConfig);
const colors = fullConfig?.theme?.colors as unknown as DefaultColors;

export { colors };
