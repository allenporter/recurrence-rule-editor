import html from '@web/rollup-plugin-html';
import merge from 'deepmerge';
import { createBasicConfig } from '@open-wc/building-rollup';

const baseConfig = createBasicConfig();

export default merge(baseConfig, {
  input: './demo/index.html',
  plugins: [html()],
});
