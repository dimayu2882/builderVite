import fs from 'fs/promises';
import path from 'path';

const ASSETS_FILE_NAME = 'Assets.mjs';
const LANGUAGES_FOLDER = 'langs';

export default class AssetsPacker {
	base64Prefix = {
		'.jpg': 'data:image/jpeg;base64,',
		'.png': 'data:image/png;base64,',
		'.webp': 'data:image/webp;base64,',
		'.mp3': 'data:audio/mpeg;base64,',
		'.glb': 'data:application/octet-stream;base64,',
		'.json': 'data:application/json;base64,',
		'.zip': ''
	};
	
	constructor(inputAssetsFolderPath, outputAssetsFolderPath, defaultLanguage = 'en') {
		this.inputAssetsFolderPath = inputAssetsFolderPath;
		this.outputFilePath = path.resolve(outputAssetsFolderPath, ASSETS_FILE_NAME);
		this.defaultLanguage = defaultLanguage;
	}
	
	async pack(onComplete = () => {}, language = this.defaultLanguage) {
		try {
			const fileList = await this.getFiles(this.inputAssetsFolderPath);
			if (!fileList.length) console.warn('⚠️ Файлы не найдены в папке:', this.inputAssetsFolderPath);
			
			let content = `const assets = [`;
			let addedCount = 0;
			const assetNames = [];
			
			for (let filePath of fileList) {
				const extension = path.extname(filePath);
				const loaderPrefix = this.base64Prefix[extension];
				if (!loaderPrefix) {
					console.log(`Пропущен файл с неподдерживаемым расширением: ${filePath}`);
					continue;
				}
				
				let fileName = path.basename(filePath);
				
				// Если файл находится в папке fonts, добавляем префикс "font/"
				const isFontFile = filePath.includes(path.sep + 'fonts' + path.sep) ||
							  filePath.endsWith(path.sep + 'fonts');
				if (isFontFile) fileName = 'fonts/' + fileName;
				
				if (fileName.startsWith('#')) {
					console.log(`Пропущен файл, имя которого начинается с #: ${fileName}`);
					continue;
				}
				
				// Фильтрация языковых папок
				if (fileName.includes(LANGUAGES_FOLDER)) {
					const pattern = `${LANGUAGES_FOLDER}/${language}/`;
					if (!fileName.includes(pattern)) {
						continue;
					}
					fileName = fileName.replace(pattern, '');
				}
				
				const base64Str = await this.convertToBase64(filePath);
				if (!base64Str) {
					console.log(`Файл пустой или не удалось конвертировать в Base64: ${fileName}`);
					continue;
				}
				
				content += `\n\t{ name: "${fileName}", src: "${loaderPrefix}${base64Str}" },`;
				assetNames.push(fileName);
				addedCount++;
			}
			
			content += `\n];\n\nexport { assets };`;
			
			await this.save(content);
			
			// Обновляем файл enums.mjs
			await this.updateEnumsFile(assetNames);
			
			onComplete();
		} catch (err) {
			console.error('Ошибка при упаковке ассетов:', err);
		}
	}
	
	async getFiles(dir, files = []) {
		const fileList = await fs.readdir(dir);
		for (const file of fileList) {
			const fullPath = path.join(dir, file);
			const stat = await fs.stat(fullPath);
			if (stat.isDirectory()) await this.getFiles(fullPath, files);
			else files.push(fullPath);
		}
		return files;
	}
	
	async convertToBase64(filePath) {
		try {
			const data = await fs.readFile(filePath);
			if (!data || data.length === 0) return '';
			return data.toString('base64');
		} catch (err) {
			console.error('Не удалось конвертировать файл в Base64:', filePath, err);
			return '';
		}
	}
	
	async save(content) {
		try {
			await fs.writeFile(this.outputFilePath, content);
		} catch (err) {
			console.error('Не удалось сохранить файл Assets.mjs:', err);
		}
	}
	
	async getLanguages() {
		const languagesFolderPath = path.resolve(this.inputAssetsFolderPath, 'images', LANGUAGES_FOLDER);
		try {
			const exists = await fs.stat(languagesFolderPath).then(s => s.isDirectory()).catch(() => false);
			if (!exists) return ['en'];
			
			const items = await fs.readdir(languagesFolderPath);
			const dirs = [];
			for (const item of items) {
				if (item.includes('DS_Store')) continue;
				const stat = await fs.stat(path.join(languagesFolderPath, item));
				if (stat.isDirectory()) dirs.push(item);
			}
			return dirs.length ? dirs : ['en'];
		} catch {
			return ['en'];
		}
	}
	
	async updateEnumsFile(assetNames) {
		try {
			const enumsPath = path.resolve(this.inputAssetsFolderPath, '..', 'src', 'modules', 'utils', 'enums.mjs');
			let content = await fs.readFile(enumsPath, 'utf-8');
			
			// Генерируем объект assetsNames
			let assetsNamesContent = '\n\nexport const assetsNames = {\n';
			
			// Добавляем каждый ассет в объект
			assetNames.forEach(fullName => {
				// Удаляем расширение файла
				const nameWithoutExt = fullName.replace(/\.[^/.]+$/, '');
				const extension = path.extname(fullName).toLowerCase();
				
				// Проверяем, является ли файл звуковым
				const isSound = ['.mp3', '.wav', '.ogg', '.m4a'].includes(extension);
				
				// Преобразуем имя в верблюжью нотацию
				let camelCaseName = nameWithoutExt
					.split(/[-_\s]+/)
					.map((word, index) => 
						index === 0 
							? word.toLowerCase() 
							: word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
					)
					.join('')
					.replace(/[^a-zA-Z0-9]/g, '');
				
				// Добавляем префикс Sound для звуковых файлов
				if (isSound) {
					camelCaseName = 'sound' + camelCaseName.charAt(0).toUpperCase() + camelCaseName.slice(1);
				}
				
				assetsNamesContent += `\t${camelCaseName}: '${nameWithoutExt}',\n`;
			});
			
			assetsNamesContent += '};\n';
			
			// Удаляем старый объект assetsNames, если он существует
			content = content.replace(/export const assetsNames = \{[^}]*\};?\n*/g, '');
			
			// Добавляем новый объект в конец файла
			content = content.trim() + '\n' + assetsNamesContent;
			
			// Сохраняем обновленный файл
			await fs.writeFile(enumsPath, content, 'utf-8');
			console.log('✅ Файл enums.mjs успешно обновлен с объектом assetsNames');
		} catch (err) {
			console.error('Ошибка при обновлении файла enums.mjs:', err);
		}
	}
	
	watch() {
		let isDelayStart = false;
		fs.watch(this.inputAssetsFolderPath, { recursive: true }, (event, filename) => {
			if (filename === ASSETS_FILE_NAME) return;
			if (!isDelayStart) {
				isDelayStart = true;
				setTimeout(() => {
					isDelayStart = false;
					this.pack();
				}, 500);
			}
		});
		this.pack();
	}
}
