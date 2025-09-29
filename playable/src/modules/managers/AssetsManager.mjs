export default class AssetsManager {
    images = {};
    audios = {};
	sheets = {};

	#loaders = {
		'png': { storage: this.images, load: this.#loadImage },
		'jpg': { storage: this.images, load: this.#loadImage },
		'mp3': { storage: this.audios, load: this.#loadSound },
		'json': { storage: this.sheets, load: this.#loadJSON },
	}

    async loadFiles( files, onLoadComplete ) {
		for ( let file of files ) {
			let fileName = file.name;
			let assetName = fileName.split(".")[0];
			let assetExtension = fileName.split(".")[1];

			let loader = this.#loaders[ assetExtension ];
			if ( !loader ) continue;
			loader.storage[ assetName ] = await loader.load( file.src );
		}

		onLoadComplete();
    }

	#loadImage( path ) {
		return new Promise((resolve, reject) => {
			let image = new Image();
			image.addEventListener('load', () => resolve(image));
			image.addEventListener('error', (err) => reject(err));
			image.src = path;
		});
	}

	#loadSound( path ) {
		return new Promise((resolve, reject) => {
			let audio = new Audio(path);
			resolve(audio);
		});
	}

	#loadJSON( path ) {
		return new Promise((resolve, reject) => {
			fetch(path)
			.then((response) => response.json())
			.then((json) => resolve(json));
		});
	}
}
