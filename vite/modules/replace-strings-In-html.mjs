import fs from 'fs';
import path from 'path';

/**
 * Vite-плагин для замены строк в HTML файлах после сборки
 * @param {object} options
 * @param {string} options.fileNameKey — часть имени файла, по которой фильтруем HTML
 * @param {RegExp|string} options.string — что искать
 * @param {string} options.replace — на что заменить
 */
export default function ReplaceStringsInHtml({ fileNameKey, string, replace }) {
	return {
		name: 'replace-strings-in-html',
		closeBundle: async () => {
			if (!fileNameKey || !string) {
				console.warn('ReplaceStringsInHtml: fileNameKey or string not specified');
				return;
			}
			
			// Берём все HTML-файлы в папке dist
			const distPath = path.resolve(process.cwd(), 'dist');
			
			const walk = async (dir) => {
				const entries = await fs.promises.readdir(dir, { withFileTypes: true });
				for (let entry of entries) {
					const fullPath = path.join(dir, entry.name);
					if (entry.isDirectory()) {
						await walk(fullPath);
					} else if (entry.isFile() && entry.name.endsWith('.html') && entry.name.includes(fileNameKey)) {
						let content = await fs.promises.readFile(fullPath, 'utf-8');
						content = content.replace(string, replace);
						await fs.promises.writeFile(fullPath, content, 'utf-8');
						console.log(`ReplaceStringsInHTML: updated ${fullPath}`);
					}
				}
			};
			
			await walk(distPath);
		}
	};
}
