import { defineConfig } from 'rollup';

import typescript from '@rollup/plugin-typescript';

import dts from 'rollup-plugin-dts';

import terser from '@rollup/plugin-terser';

export default defineConfig([
    {
        external: ['bun'],

        input: './src/index.ts',

        output: {
            file: './dist/index.ts',

            format: 'esm',
        },
        plugins: [typescript(), terser()],
    },
    {
        input: './src/index.ts',
        output: {
            file: './dist/index.d.ts',
            format: 'module',
        },
        plugins: [dts()],
    },
]);
