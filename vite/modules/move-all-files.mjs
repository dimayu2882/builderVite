import fs from 'fs';
import path from 'path';

/**
 * Vite-плагин для перемещения всех файлов из одной папки в другую после сборки
 */
export default function MoveAllFiles(options = {}) {
	return {
		name: 'move-all-files',
		closeBundle: async () => {
			const sourceDir = options.from;
			const targetDir = options.to;
			
			if (!sourceDir || !targetDir) {
				console.warn('MoveAllFiles: sourceDir or targetDir not specified');
				return;
			}
			
			try {
				await fs.promises.mkdir(targetDir, { recursive: true });
				const files = await fs.promises.readdir(sourceDir);
				
				await Promise.all(files.map(async (file) => {
					const srcFilePath = path.join(sourceDir, file);
					const destFilePath = path.join(targetDir, file);
					await fs.promises.copyFile(srcFilePath, destFilePath);
				}));
				
				await fs.promises.rm(sourceDir, { recursive: true, force: true });
				console.log(`MoveAllFiles: moved ${files.length} files from ${sourceDir} to ${targetDir}`);
			} catch (err) {
				console.error('MoveAllFiles error:', err);
			}
		}
	};
}
