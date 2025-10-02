// vite/config/prod.inline.config.js
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

const __dirname = new URL('.', import.meta.url).pathname;
const rootPath = path.resolve(__dirname, '../../');
const distPath = path.join(rootPath, 'dist');

// Функция для безопасного чтения файлов
function safeReadFile(filePath) {
  if (!existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return '';
  }
  try {
    return readFileSync(filePath, 'utf-8');
  } catch (e) {
    console.error(`Error reading file ${filePath}:`, e);
    return '';
  }
}

export default defineConfig({
  root: path.join(rootPath, 'playable'),
  publicDir: path.join(rootPath, 'playable/assets'),
  build: {
    chunkSizeWarningLimit: 5000,
    outDir: distPath,
    emptyOutDir: true,
    rollupOptions: {
      input: path.join(rootPath, 'playable/index.html'),
      output: {
        entryFileNames: 'main.js',
        assetFileNames: '[name][extname]',
        // Минимизируем вывод
        compact: true,
        // Избегаем проблем с экранированием
        generatedCode: {
          reservedNamesAsProps: false,
          constBindings: true
        },
        // Отключаем sourcemaps для чистоты кода
        sourcemap: false
      }
    },
    // Минимизируем вывод
    minify: 'terser',
    terserOptions: {
      format: {
        comments: false,
      },
      compress: {
        drop_console: true,
      },
    },
  },
  plugins: [
    createHtmlPlugin({
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: {
          compress: true,
          mangle: true,
          output: {
            comments: false,
          },
        },
      },
      template: 'index.html',
      inject: {
        data: {
          storeIOS: 'your_ios_store',
          storeAndroid: 'your_android_store',
          titleKey: 'playable_game',
          language: 'en'
        }
      }
    }),
    {
      name: 'inline-assets',
      enforce: 'post',
      closeBundle() {
        try {
          const htmlPath = path.join(distPath, 'index.html');
          if (!existsSync(htmlPath)) {
            throw new Error(`HTML file not found at ${htmlPath}`);
          }
          
          let html = readFileSync(htmlPath, 'utf-8');
          
          // Inline CSS
          const cssMatch = html.match(/<link[^>]*href=["']([^"']+\.css)["'][^>]*>/i);
          if (cssMatch) {
            const cssRelativePath = cssMatch[1];
            const cssPath = path.join(distPath, cssRelativePath);
            const cssContent = safeReadFile(cssPath);
            
            if (cssContent) {
              // Экранируем специальные символы в CSS
              const safeCss = cssContent
                .replace(/\\/g, '\\\\')
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/'/g, "\\'");
              
              // Создаем безопасный тег стиля
              const styleTag = `<style>${safeCss}</style>`;
              html = html.replace(cssMatch[0], styleTag);
              console.log(` Inlined CSS: ${cssPath}`);
            }
          }
          
          // Inline JS
          const jsMatch = html.match(/<script[^>]*src=["']([^"']+\.m?js)["'][^>]*>/i);
          if (jsMatch) {
            const jsRelativePath = jsMatch[1];
            const jsPath = path.join(distPath, jsRelativePath);
            const jsContent = safeReadFile(jsPath);
            
            if (jsContent) {
              // Экранируем специальные символы в JS
              const safeJs = jsContent
                .replace(/\\/g, '\\\\')
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/<\/script>/g, '<\\/script>');
              
              // Создаем безопасный тег скрипта
              const scriptTag = `<script type="module">${safeJs}</script>`;
              html = html.replace(jsMatch[0], scriptTag);
              console.log(` Inlined JS: ${jsPath}`);
            }
          }
          
          // Сохраняем обновленный HTML
          writeFileSync(htmlPath, html);
          console.log(' Inlining completed successfully!');
          
        } catch (error) {
          console.error(' Error during inlining:', error);
          throw error;
        }
      }
    }
  ]
});
