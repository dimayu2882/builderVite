import { Application, Container, Texture, Sprite, Spritesheet, AnimatedSprite, ObservablePoint, DisplayObject } from 'pixi.js';

export default class PIXIManager {
    app;
    stage;
    element;

    #textures = {};
    #sheets = {};
    #width = 0;
    #height = 0;

    constructor() {
        this.app = new Application({
            backgroundAlpha: 0,
            antialias: true,
            backgroundColor: 0xffffff,
            autoDensity: true
        })

        this.stage = this.app.stage;

        this.element = document.getElementById('canvas2d');
        this.element.append(this.app.view);
        this.app.view.style.touchAction = 'none';
        this.app.view.style.userInteractionEnabled = false;

        app.resize.add(this.#onResize.bind(this));
    }

    parseSheets() {
        for (let sheetName in app.assets.sheets) {
            this.sheet(sheetName);
        }
    }

    #onResize() {
        let screenWidth = app.resize.screen.width,
            screenHeight = app.resize.screen.height;

        let screenRatio = screenWidth / screenHeight,
            maxScreenRatio = this.maxWidth / this.maxHeight,
            minScreenRatio = app.settings.screen.minWidth / app.settings.screen.height;

        let canvasWidth = this.maxWidth;
        let canvasHeight = this.maxHeight;
        
        // Адаптация размеров в зависимости от ориентации и соотношения сторон устройства
        if (app.isPortrait) {
            if (screenRatio > maxScreenRatio) {
                let ratio = Math.min(screenRatio, 1 / minScreenRatio);
                canvasHeight = Math.floor(this.maxWidth / ratio);
            }
        } else {
            if (screenRatio < maxScreenRatio) {
                let ratio = Math.max(screenRatio, minScreenRatio);
                canvasWidth = Math.floor(this.maxHeight * ratio);
            }
        }
        
        this.app.renderer.resize(canvasWidth, canvasHeight);
        
        // Задаем размеры для canvas
        let canvasRatio = canvasWidth / canvasHeight;
        let canvasWidthStyle, canvasHeightStyle;
        
        if (canvasRatio > screenRatio) {
            canvasHeightStyle = Math.round(screenWidth / canvasRatio);
            canvasWidthStyle = screenWidth;
        } else {
            canvasWidthStyle = Math.round(screenHeight * canvasRatio);
            canvasHeightStyle = screenHeight;
        }

        this.app.view.style.height = `${canvasHeightStyle}px`;
        this.app.view.style.width = `${canvasWidthStyle}px`;
        this.app.view.style.left = `${Math.max((screenWidth - canvasWidthStyle) / 2, 0)}px`;
        this.app.view.style.top = `${Math.max((screenHeight - canvasHeightStyle) / 2, 0)}px`;
        
        this.#width = canvasWidth;
        this.#height = canvasHeight;
    }

    /**
     * @returns {number}
     */
    get width() {
        return this.#width;
    }

    /**
     * @returns {number}
     */
    get height() {
        return this.#height;
    }

    /**
     * @returns {number}
     */
    get maxWidth() {
        let settingsScreen = app.settings.screen;

        if (app.isPortrait) {
            return Math.min(settingsScreen.width, settingsScreen.height);
        } else {
            return Math.max(settingsScreen.width, settingsScreen.height);
        }
    }

    /**
     * @returns {number}
     */
    get maxHeight() {
        let settingsScreen = app.settings.screen;

        if (app.isPortrait) {
            return Math.max(settingsScreen.width, settingsScreen.height);
        } else {
            return Math.min(settingsScreen.width, settingsScreen.height);
        }
    }

    /**
     * Создает экземпляр PIXI.Texture по имени картинки
     * @param {string} imageName
     * @returns {Texture};
     */
    texture(imageName) {
        let texture = this.#textures[imageName];
        if (texture) return texture;

        for (let sheetName in this.#sheets) {
            let sheet = this.#sheets[sheetName];
            let texture = sheet.textures[imageName];

            if (texture) {
                this.#textures[imageName] = texture;
                return texture;
            }
        }

        let image = app.assets.images[imageName];
        if (image) {
            let texture = Texture.from(image);
            this.#textures[imageName] = texture;

            return texture;
        }
    }

    /**
     * Создает экземпляр PIXI.Spritesheet по имени спрайтшита
     * @param {string} sheetName
     * @returns {Spritesheet}
     */
    sheet(sheetName) {
        let sheet = this.#sheets[sheetName];
        if (sheet) return sheet;

        let texture = this.texture(sheetName);
        if (texture) {
            let sheetData = app.assets.sheets[sheetName];
            let sheet = new Spritesheet(texture, sheetData);
            sheet.parse(()=>{});
            this.#sheets[sheetName] = sheet;

            return sheet;
        }
    }

    /**
     * Создает экземпляр PIXI.Sprite по имени картинки с задаными опциями
     * @param {string} imageName
     * @param {object} options
     * @returns {Sprite}
     */
    sprite(imageName, options) {
        let sprite = new Sprite( this.texture(imageName) );
        
        this.setSpriteOptions(sprite, options);

        return sprite;
    }

    /**
     * Создает экземпляр PIXI.Container с задаными опциями
     * @param {object} options
     * @returns {Container}
     */
    container(options) {
        let container = new Container();
        
        this.setSpriteOptions(container, options);

        return container;
    }

    /**
     * Создает экземпляр PIXI.AnimatedSprite по имени спрайтшита с задаными опциями
     * @param {string} sheetName
     * @param {object} options
     * @returns {AnimatedSprite}
     */
    animation(sheetName, options={}) {
        let sheet = this.sheet(sheetName);

        if ('default' in sheet.animations === false) {
            sheet.animations.default = [];
            
            let textureKeys = Object.keys( sheet.textures ).sort();
            for ( let textureKey of textureKeys ) {
                let texture = sheet.textures[textureKey];
                sheet.animations.default.push(texture);
            }
        }
        
        let animatedSprite = new AnimatedSprite(sheet.animations['default']);

        this.setSpriteOptions(animatedSprite, options);

        if (options.autoPlay) animatedSprite.play();

        return animatedSprite;
    }

    /**
     * Установка опций для визуальных обьектов PIXI
     * @param {DisplayObject} sprite
     * @param {object} options
     */
    setSpriteOptions(sprite, options) {
        if (options === undefined) return;

        for (let optionName in options) {
            let option = options[optionName];

            if (optionName === 'childs') {
                option.forEach(child => {
                    sprite.addChild(child);
                });
            }

            if ( !(optionName in sprite) ) continue;

            if (sprite[optionName] instanceof ObservablePoint) {
                if (typeof option === 'number' ) {
                    sprite[optionName].set(option);
                } else {
                    sprite[optionName].set(option.x, option.y);
                }
            } else {
                sprite[optionName] = option;
            }
        }

        if (options.resizes) {
            app.resize.pin(sprite, options.resizes);
        }
    }
}
