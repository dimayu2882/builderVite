/**
 * fileName {String} - имя собранного html
 * zip {Boolean} - нужно ли архивировать собранные файлы
 * placeJSFile {Boolean} - нужно ли класть собранный js файл рядом
 * copiedFiles {Array} - список имён копируемых файлов из папки с шаблонами для площадок
 */
const platformsConfig = {
	mraid: {
		fileName: 'index.html',
		zip: false
	},
	
	unity: {
		folder: 'mraid',
		fileName: 'index.html',
		zip: false
	},
	
	applovin: {
		folder: 'mraid',
		fileName: 'index.html',
		zip: false
	},
	
	smadex: {
		fileName: 'index.html',
		zip: false
	},
	
	mraidbtn: {
		fileName: 'index.html',
		zip: false
	},
	
	ironsource: {
		fileName: 'index.html',
		zip: false
	},
	
	facebook: {
		fileName: 'index.html',
		zip: true,
		placeJSFile: true
	},
	
	vungle: {
		fileName: 'index.html',
		zip: true
		// copiedFiles: [
		//     'index.html'
		// ]
	},
	
	mintegral: {
		// fileName: 'index.html',
		zip: true
	},
	
	google: {
		fileName: 'index.html',
		zip: true
	},
	
	liftoff: {
		fileName: 'index.html',
		zip: true,
		placeJSFile: true
	},
	
	moloco: {
		fileName: 'index.html',
		zip: false
	},
	
	tiktok: {
		fileName: 'index.html',
		zip: true,
		copiedFiles: [
			'config.json'
		]
	}
};

export default platformsConfig;
