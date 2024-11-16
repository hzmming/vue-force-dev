import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const pkg = require('./package.json');

const DIST_PATH = 'dist';

export default [
  {
    input: 'src/detector.ts',
    output: {
      dir: DIST_PATH,
    },
    plugins: [typescript(), nodeResolve()],
  },
  {
    input: 'src/detectorExec.ts',
    output: {
      dir: DIST_PATH,
      format: 'iife',
    },
    plugins: [
      typescript(),
      nodeResolve(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true,
      }),
    ],
  },
  {
    input: ['src/background.ts'],
    output: {
      dir: DIST_PATH,
    },
    plugins: [
      typescript(),
      nodeResolve(),
      copy({
        targets: [
          {
            src: 'src/popups',
            dest: DIST_PATH,
          },
          {
            src: 'src/icons',
            dest: DIST_PATH,
          },
          {
            src: 'src/manifest.json',
            dest: DIST_PATH,
            transform: (contents) =>
              contents
                .toString()
                .replace('__PACKAGE_JSON_VERSION__', pkg.version),
          },
        ],
      }),
    ],
  },
];
