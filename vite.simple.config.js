import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import titlesConfig from './vite/config/titles.config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, 'playable');

export default defineConfig({
  root: rootDir,
  base: './',
  publicDir: path.resolve(rootDir, 'public'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    assetsDir: '',
    rollupOptions: {
      input: {
        main: path.resolve(rootDir, 'index.mjs')
      },
      output: {
        entryFileNames: 'main.js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  plugins: [
    createHtmlPlugin({
      inject: false,
      minify: true,
      template: path.resolve(rootDir, 'index.html'),
      templateParameters: {
        storeIOS: titlesConfig.playable.store.ios,
        storeAndroid: titlesConfig.playable.store.android,
        titleKey: titlesConfig.playable.titleKey,
        language: 'en'
      }
    })
  ]
});
