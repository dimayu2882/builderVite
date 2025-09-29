import fs from 'fs/promises';
import path from 'path';

const ASSETS_FILE_NAME = 'Assets.mjs';
const LANGUAGES_FOLDER = 'langs';

export default class AssetsPacker {
	base64Prefix = {
		'.jpg': 'data:image/jpeg;base64,',
		'.png': 'data:image/png;base64,',
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
			console.log(`\n=== Начинаем упаковку ассетов для языка: ${language} ===`);
			const fileList = await this.getFiles(this.inputAssetsFolderPath);
			if (!fileList.length) console.warn('⚠️ Файлы не найдены в папке:', this.inputAssetsFolderPath);
			
			let content = `const assets = [`;
			let addedCount = 0;
			
			for (let filePath of fileList) {
				const extension = path.extname(filePath);
				const loaderPrefix = this.base64Prefix[extension];
				if (!loaderPrefix) {
					console.log(`Пропущен файл с неподдерживаемым расширением: ${filePath}`);
					continue;
				}
				console.log("Проверяем файл:", filePath);
				
				const relativePathArr = path.relative(this.inputAssetsFolderPath, filePath).split(path.sep);
				let fileName = relativePathArr.join('/');
				
				if (fileName.startsWith('#')) {
					console.log(`Пропущен файл, имя которого начинается с #: ${fileName}`);
					continue;
				}
				
				// Фильтрация языковых папок
				if (fileName.includes(LANGUAGES_FOLDER)) {
					const pattern = `${LANGUAGES_FOLDER}/${language}/`;
					if (!fileName.includes(pattern)) {
						console.log(`Файл не для текущего языка и пропущен: ${fileName}`);
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
				addedCount++;
				console.log(`Добавлен ассет: ${fileName}`);
			}
			
			content += `\n];\n\nexport { assets };`;
			
			await this.save(content);
			console.log(`✅ Упаковано ${addedCount} ассетов. Файл создан: ${this.outputFilePath}`);
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
