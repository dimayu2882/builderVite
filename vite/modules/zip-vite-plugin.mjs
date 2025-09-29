import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

/**
 * Vite-плагин для zip-компрессии папок после сборки
 * @param {Array} folders - массив объектов с опциями:
 *   from: папка для архивации
 *   to: куда переместить архив
 *   name: имя архива
 *   deleteOriginalAssets: удалить исходные файлы
 */
export default function ZipVitePlugin(folders = []) {
	return {
		name: 'zip-vite-plugin',
		closeBundle: async () => {
			if (!Array.isArray(folders) || folders.length === 0) return;
			
			await Promise.all(folders.map(async (folder) => {
				const stats = fs.statSync(folder.from);
				if (!stats.isDirectory()) {
					console.warn(`ZipVitePlugin: ${folder.from} is not a directory`);
					return;
				}
				
				const output = fs.createWriteStream(folder.name);
				const archive = archiver('zip', { zlib: { level: 9 } });
				
				await new Promise((resolve, reject) => {
					output.on('close', resolve);
					archive.on('error', reject);
					archive.pipe(output);
					archive.directory(folder.from, false);
					archive.finalize();
				});
				
				if (folder.deleteOriginalAssets) {
					fs.rmSync(folder.from, { recursive: true, force: true });
				}
				
				const directory = path.resolve(folder.to);
				const previous = path.resolve(folder.name);
				const next = path.resolve(path.join(folder.to, path.basename(folder.name)));
				
				if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
				
				fs.renameSync(previous, next);
				console.log(`ZipVitePlugin: ${folder.name} created at ${folder.to}`);
			}));
		}
	};
}
