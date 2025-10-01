import fs from 'fs';
import path from 'path';
import clc from 'cli-color';
import texturePacker from 'free-tex-packer-core';

// =================== Setup ===================

checkFolderNameArgument();

const packedFolderName = process.argv[2].replaceAll('#', '');
const workFolderPath = 'playable';
let inputSheetFolderPath = path.resolve(workFolderPath, 'assets', 'images', packedFolderName);
const outputSheetFolderPath = path.resolve(workFolderPath, 'assets', 'sheets');

const imageExtensions = ['.jpg', '.png']; // для спрайтшита
const fontExtensions = ['.fnt', '.png'];  // для BitmapFont

const packOptions = {
	textureName: packedFolderName,
	padding: 2,
	width: 2048,
	height: 2048,
	powerOfTwo: true,
	allowRotation: true,
	detectIdentical: true,
	allowTrim: true,
	exporter: 'Pixi',
	packer: 'OptimalPacker',
	removeFileExtension: true,
	prependFolderName: true
};

// =================== Run ===================

checkPackedFolderExist();
packImagesToSheet();

// =================== Functions ===================

function checkFolderNameArgument() {
	if (process.argv.length === 2) {
		errorLog('Error: Expected packed folder name argument!');
		process.exit(1);
	}
}

function checkPackedFolderExist() {
	if (!fs.existsSync(inputSheetFolderPath)) {
		inputSheetFolderPath = getInputFolderPathWithSharp();
		if (!fs.existsSync(inputSheetFolderPath)) {
			errorLog('Error: Input folder not exist!');
			process.exit(1);
		}
	}
}

function generateImagesList() {
	const fileList = fs.readdirSync(inputSheetFolderPath);
	return fileList
		.filter(fileName => imageExtensions.includes(path.extname(fileName)))
		.map(fileName => ({
			path: `${packedFolderName}/${fileName}`,
			contents: fs.readFileSync(path.resolve(inputSheetFolderPath, fileName))
		}));
}

function packImagesToSheet() {
	const images = generateImagesList();
	
	texturePacker(images, packOptions, (files, error) => {
		if (error) {
			errorLog(`Packaging failed: ${error}`);
			return;
		}
		
		if (!fs.existsSync(outputSheetFolderPath)) {
			fs.mkdirSync(outputSheetFolderPath, { recursive: true });
		}
		
		for (const item of files) {
			const outputFilePath = path.resolve(outputSheetFolderPath, item.name);
			fs.writeFileSync(outputFilePath, item.buffer);
		}
		
		// порядок важен!
		copyFontFiles();
		renameInputSheetFolderPath();
		
		succesLog('Spritesheet successfully generated!');
	});
}

function copyFontFiles() {
	const folderPath = fs.existsSync(getInputFolderPathWithSharp())
		? getInputFolderPathWithSharp()
		: inputSheetFolderPath;
	
	if (!fs.existsSync(folderPath)) return;
	
	const fileList = fs.readdirSync(folderPath);
	
	for (const fileName of fileList) {
		const ext = path.extname(fileName);
		if (!fontExtensions.includes(ext)) continue;
		
		const src = path.resolve(folderPath, fileName);
		const dest = path.resolve(outputSheetFolderPath, fileName);
		fs.copyFileSync(src, dest);
	}
	
	succesLog('Bitmap fonts copied!');
}

function renameInputSheetFolderPath() {
	if (!inputSheetFolderPath.includes('#')) {
		const newInputSheetFolderPath = getInputFolderPathWithSharp();
		fs.renameSync(inputSheetFolderPath, newInputSheetFolderPath);
	}
}

function getInputFolderPathWithSharp() {
	return path.resolve(workFolderPath, 'assets', 'images', `#${packedFolderName}`);
}

// =================== Logs ===================

function succesLog(text) {
	const line = '-'.repeat(text.length);
	console.log(clc.green(line));
	console.log(clc.green(text));
	console.log(clc.green(line));
}

function errorLog(text) {
	const line = '-'.repeat(text.length);
	console.log(clc.red(line));
	console.log(clc.red(text));
	console.log(clc.red(line));
}
