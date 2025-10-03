// vite/config/prod.inline.config.js
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

// Чтение файла
function readFileSync(filePath) {
	return fs.readFileSync(filePath, 'utf8');
}

// Запись файла
function writeFileSync(filePath, content) {
	return fs.writeFileSync(filePath, content, 'utf8');
}

// Инлайнинг
function inlineAssets(htmlPath, baseDir) {
	try {
		console.log('\n=== Начало инлайнинга ===');
		let html = readFileSync(htmlPath);
		
		// Обработка CSS
		const cssRegex = /<link[^>]*?href="([^"]+\.css)"[^>]*?>/gi;
		let cssMatch;
		while ((cssMatch = cssRegex.exec(html)) !== null) {
			const fullCssPath = path.join(baseDir, cssMatch[1].replace(/^\//, ''));
			if (fs.existsSync(fullCssPath)) {
				const cssContent = readFileSync(fullCssPath);
				html = html.replace(cssMatch[0], '<style>' + cssContent + '</style>');
			}
		}
		
		// Обработка JS
		const jsRegex = /<script[^>]*?src="([^"]+\.js)"[^>]*?><\/script>/gi;
		let jsMatch;
		const jsFiles = new Map();
		
		// Собираем все JS файлы
		while ((jsMatch = jsRegex.exec(html)) !== null) {
			const jsUrl = jsMatch[1];
			if (!jsFiles.has(jsUrl)) {
				jsFiles.set(jsUrl, jsMatch[0]);
			}
		}
		
		// Обрабатываем JS
		for (const [url, tag] of jsFiles) {
			const fullJsPath = path.join(baseDir, url.replace(/^\//, ''));
			if (fs.existsSync(fullJsPath)) {
				const jsContent = readFileSync(fullJsPath).replace(/<\/script>/g, '<\\/script>');
				html = html.split(tag).join('<script type="module">' + jsContent + '</script>');
			}
		}
		
		// Сохраняем изменения
		writeFileSync(htmlPath, html);
		console.log('\n=== Завершение инлайнинга ===');
		console.log('✅ Готово: активы встроены в ' + htmlPath);
		
	} catch (error) {
		console.error('❌ Ошибка при инлайнинге:', error);
		throw error;
	}
}

// Экспорт конфига (ESM)
export default defineConfig({
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		rollupOptions: {
			input: 'playable/index.html',
			output: {
				entryFileNames: 'main.js',
				assetFileNames: '[name][extname]',
			},
		},
	},
	plugins: [
		{
			name: 'inline-assets-plugin',
			closeBundle() {
				const htmlPath = path.join(process.cwd(), 'dist', 'playable', 'index.html');
				const distPath = path.join(process.cwd(), 'dist');
				console.log('HTML path:', htmlPath);
				console.log('File exists:', fs.existsSync(htmlPath));
				inlineAssets(htmlPath, distPath);
			},
		},
	],
});
