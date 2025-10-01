import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

ffmpeg.setFfmpegPath(ffmpegPath);

const ASSETS_FILE_NAME = 'Assets.mjs';
const LANGUAGES_FOLDER = 'langs';

// Поддерживаемые расширения
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const AUDIO_EXTS = ['.mp3', '.wav', '.ogg', '.m4a'];

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
		
		// debounce для watch
		this._watchTimeout = null;
	}
	
	/**
	 * Основной метод упаковки
	 * @param {Function} onComplete
	 * @param {string} language
	 */
	async pack(onComplete = () => {}, language = this.defaultLanguage) {
		try {
			const fileList = await this._collectFiles(this.inputAssetsFolderPath);
			if (!fileList.length) console.warn('⚠️ Файлы не найдены в папке:', this.inputAssetsFolderPath);
			
			let content = `const assets = [`;
			const assetNames = [];
			let addedCount = 0;
			
			for (const filePath of fileList) {
				const extension = path.extname(filePath).toLowerCase();
				const loaderPrefix = this.base64Prefix[extension];
				
				// сохраняем прежнюю семантику: если loaderPrefix falsy — пропускаем
				if (!loaderPrefix) {
					console.log(`Пропущен файл с неподдерживаемым расширением: ${filePath}`);
					continue;
				}
				
				let fileName = path.basename(filePath);
				
				// корректное определение, находится ли файл в папке fonts
				if (this._isInFolder(filePath, 'fonts')) {
					fileName = `fonts/${fileName}`;
				}
				
				// пропуск файлов, начинающихся с #
				if (fileName.startsWith('#')) {
					console.log(`Пропущен файл, имя которого начинается с #: ${fileName}`);
					continue;
				}
				
				// Фильтрация языковых папок. (Исправлено: использую полный путь, а не basename)
				if (filePath.includes(`${path.sep}${LANGUAGES_FOLDER}${path.sep}`)) {
					const pattern = `${path.sep}${LANGUAGES_FOLDER}${path.sep}${language}${path.sep}`;
					if (!filePath.includes(pattern)) {
						// не для текущего языка
						continue;
					}
					// Убираем префикс folder/langs/{lang}/images/... -> оставляем относительный путь после этой папки
					// Найдём индекс после pattern
					const idx = filePath.indexOf(pattern);
					fileName = filePath.slice(idx + pattern.length).replace(/\\/g, '/');
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
			await this.updateEnumsFile(assetNames);
			
			onComplete();
			return { addedCount, assets: assetNames };
		} catch (err) {
			console.error('Ошибка при упаковке ассетов:', err);
			throw err;
		}
	}
	
	// Рекурсивный сбор файлов из папки
	async _collectFiles(dir) {
		const results = [];
		await this._walkDir(dir, results);
		return results;
	}
	
	async _walkDir(dir, accumulator) {
		const items = await fs.readdir(dir);
		for (const name of items) {
			const full = path.join(dir, name);
			const stat = await fs.stat(full);
			if (stat.isDirectory()) {
				await this._walkDir(full, accumulator);
			} else {
				accumulator.push(full);
			}
		}
	}
	
	// Проверка, находится ли путь в указанной подпапке (по сегментам)
	_isInFolder(filePath, folderName) {
		const segments = path.normalize(filePath).split(path.sep).map(s => s.toLowerCase());
		return segments.includes(folderName.toLowerCase());
	}
	
	/**
	 * Конвертирует файл в Base64, используя обработку изображений и сжатие аудио
	 * @param {string} filePath
	 * @returns {Promise<string>} base64 строка (без префикса)
	 */
	async convertToBase64(filePath) {
		try {
			const extension = path.extname(filePath).toLowerCase();
			let data;
			
			if (IMAGE_EXTS.includes(extension)) {
				data = await this._processImage(filePath);
			} else if (AUDIO_EXTS.includes(extension)) {
				try {
					data = await this.compressAudio(filePath);
				} catch (err) {
					console.error(`Ошибка при сжатии аудио ${filePath}:`, err);
					data = await fs.readFile(filePath);
				}
			} else {
				data = await fs.readFile(filePath);
			}
			
			if (!data || data.length === 0) return '';
			return data.toString('base64');
		} catch (err) {
			console.error('Ошибка при конвертации файла в Base64:', filePath, err);
			return '';
		}
	}
	
	// Обработка изображений через sharp (с конфигом по умолчанию)
	async _processImage(filePath) {
		try {
			const image = sharp(filePath);
			const buffer = await image
				.webp({
					quality: 70,
					alphaQuality: 70,
					effort: 6,
					nearLossless: true,
				})
				.toBuffer();
			return buffer;
		} catch (err) {
			console.error(`Ошибка при обработке изображения ${filePath}:`, err);
			// fallback: вернуть оригинальный файл
			return fs.readFile(filePath);
		}
	}
	
	/**
	 * Сжимает аудиофайл с помощью ffmpeg (возвращает Buffer)
	 * NOTE: сохраняет временный файл рядом с исходником: {file}.compressed.mp3
	 * @param {string} filePath
	 * @returns {Promise<Buffer>}
	 */
	compressAudio(filePath) {
		return new Promise((resolve, reject) => {
			const tempFile = `${filePath}.compressed.mp3`;
			
			ffmpeg(filePath)
				.audioBitrate('96k')
				.audioChannels(2)
				.audioCodec('libmp3lame')
				.on('error', (err) => {
					console.error('Ошибка при сжатии аудио:', err);
					reject(err);
				})
				.on('end', async () => {
					try {
						const data = await fs.readFile(tempFile);
						await fs.unlink(tempFile).catch(console.error);
						resolve(data);
					} catch (err) {
						reject(err);
					}
				})
				.save(tempFile);
		});
	}
	
	// Сохранение итогового файла
	async save(content) {
		try {
			await fs.writeFile(this.outputFilePath, content);
		} catch (err) {
			console.error('Не удалось сохранить файл Assets.mjs:', err);
			throw err;
		}
	}
	
	// Возвращает список языков в папке images/langs (если есть)
	async getLanguages() {
		const languagesFolderPath = path.resolve(this.inputAssetsFolderPath, 'images', LANGUAGES_FOLDER);
		try {
			const stat = await fs.stat(languagesFolderPath).catch(() => null);
			if (!stat || !stat.isDirectory()) return ['en'];
			
			const items = await fs.readdir(languagesFolderPath);
			const dirs = [];
			for (const item of items) {
				if (item.includes('DS_Store')) continue;
				const statItem = await fs.stat(path.join(languagesFolderPath, item));
				if (statItem.isDirectory()) dirs.push(item);
			}
			return dirs.length ? dirs : ['en'];
		} catch {
			return ['en'];
		}
	}
	
	/**
	 * Обновляет enums.mjs — генерирует объект assetsNames { camelCaseKey: 'fileName' }
	 * @param {string[]} assetNames - список относительных имён файлов (с расширением)
	 */
	async updateEnumsFile(assetNames) {
		try {
			const enumsPath = path.resolve(this.inputAssetsFolderPath, '..', 'src', 'modules', 'utils', 'enums.mjs');
			let content = await fs.readFile(enumsPath, 'utf-8');
			
			let assetsNamesContent = '\n\nexport const assetsNames = {\n';
			
			assetNames.forEach(fullName => {
				const nameWithoutExt = fullName.replace(/\.[^/.]+$/, '');
				const extension = path.extname(fullName).toLowerCase();
				const isSound = AUDIO_EXTS.includes(extension);
				
				// camelCase преобразование
				let camelCaseName = nameWithoutExt
					.split(/[-_\s\/\\]+/)
					.map((word, index) =>
						index === 0
							? word.toLowerCase()
							: word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
					)
					.join('')
					.replace(/[^a-zA-Z0-9]/g, '');
				
				if (isSound) {
					camelCaseName = 'sound' + camelCaseName.charAt(0).toUpperCase() + camelCaseName.slice(1);
				}
				
				assetsNamesContent += `\t${camelCaseName}: '${nameWithoutExt}',\n`;
			});
			
			assetsNamesContent += '};\n';
			
			// удаляем старый объект assetsNames (нежно — поддерживаем многострочный вариант)
			content = content.replace(/export const assetsNames\s*=\s*\{[\s\S]*?\};?\s*/g, '');
			
			content = content.trim() + '\n' + assetsNamesContent;
			await fs.writeFile(enumsPath, content, 'utf-8');
		} catch (err) {
			console.error('Ошибка при обновлении файла enums.mjs:', err);
		}
	}
	
	// Наблюдение за папкой ассетов с debounce
	watch() {
		try {
			fs.watch(this.inputAssetsFolderPath, { recursive: true }, (event, filename) => {
				if (!filename) return;
				if (filename === ASSETS_FILE_NAME) return;
				
				if (this._watchTimeout) clearTimeout(this._watchTimeout);
				this._watchTimeout = setTimeout(() => {
					this.pack().catch(console.error);
				}, 500);
			});
			// Запуск первой упаковки
			this.pack().catch(console.error);
		} catch (err) {
			console.error('Ошибка при запуске watch:', err);
		}
	}
}
