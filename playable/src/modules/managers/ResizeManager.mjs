export default class ResizeManager {
    #callStack = new Set();

    LANDSCAPE = 'landscape';
    PORTRAIT = 'portrait';
    XLG = 'XLG';
    LG = 'LG';
    MD = 'MD';
    SM = 'SM';
    XSM = 'XSM';
    MN = 'MN';
    EMN = 'EMN';

    screen = {
        get width() { return window.innerWidth },
        get height() { return window.innerHeight }
    }

    constructor() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    add(resizeFunction) {
        resizeFunction({orientation: this.orientation});
        this.#callStack.add(resizeFunction);
    }

    remove(resizeFunction) {
        this.#callStack.delete(resizeFunction);
    }

    onWindowResize() {
        this.#callStack.forEach(resizeFunction => resizeFunction({orientation: this.orientation}));
    }

    pin(sprite, resizes) {
        this.add( new ResizePin(sprite, resizes).onResize );
    }    

    get orientation() {
        return this.screen.width > this.screen.height ? this.LANDSCAPE : this.PORTRAIT;
    }

    get ratio() {
        return this.screen.width / this.screen.height;
    }

    get isPortrait() {        
        return this.screen.width < this.screen.height;
    }

    get landscapeRatio() {        
        return this.ratio < 1 ? 1 / this.ratio : this.ratio;
    }

    get ratioName() {
        for ( let ratioName in RATIO_LIST ) {            
            if ( this.landscapeRatio > RATIO_LIST[ratioName] )
                return ratioName;
        }
    }

    ratioLess(ratioName) {
        return this.landscapeRatio < RATIO_LIST[ratioName.toUpperCase()];
    }
}

const RATIO_LIST = {
    /* X */
    XLG: 19.5/9 - 0.01,
    /* 16/8 */
    LG: 16/8  - 0.01,
    /* 16/9 */
    MD: 16/9 - 0.01,
    /* 5/3 */
    SM: 5/3 - 0.01,
    /* 16/10 */
    XSM: 16/10 - 0.01,
    /* 3/2 */
    MN: 3/2 - 0.01,
    /* 4/3 */
    EMN: 4/3 - 0.01
};


class ResizePin {
    sprite;
    resizes = [];

    constructor(sprite, resizes) {
        this.sprite = sprite;        

        this.parse(resizes);
    }

    parse(resizes) {
        for (let resizeName in resizes) {     
            let conditions = [];
            let ratioNames = this.getRatioNames(resizeName);
            let isPortrait = resizeName.includes(app.resize.PORTRAIT);
            let isLandscape = resizeName.includes(app.resize.LANDSCAPE);
            let isRatio = ratioNames.length > 0;
            let isLess = resizeName.includes('less');

            if ( isPortrait && isLandscape ) {
                conditions.push( ResizePin.getTrueCondition() );
            } else if ( isPortrait ) {
                conditions.push( ResizePin.getOrientationCondition(app.resize.PORTRAIT) );
            } else if ( isLandscape ) {
                conditions.push( ResizePin.getOrientationCondition(app.resize.LANDSCAPE) );
            }            
                        
            if ( isRatio ) {      
                let condition = isLess ? 
                    ResizePin.getLessRatioCondition(ratioNames[0]) :
                    ResizePin.getRatioCondition(ratioNames)

                conditions.push( condition );                
            }

            this.resizes.push({conditions, options: resizes[resizeName]});
        }        
    }

    onResize = () => {        
        for ( let resize of this.resizes ) {
            if ( ResizePin.check(resize.conditions) ) {                
                app.pixi.setSpriteOptions(this.sprite, resize.options); 
            }                
        }
    }

    getRatioNames(resizeName) {
        let ratioNames = [];
        for (let ratioName in RATIO_LIST) {
            if ( resizeName.includes(ratioName) ) 
                ratioNames.push(ratioName);
        }

        return ratioNames;
    }

    static getTrueCondition() {
        return () => true;
    }

    static getOrientationCondition(orientation) {
        return () => app.resize.orientation === orientation;
    }

    static getRatioCondition(ratioNames) {
        return () => {
            for ( let ratioName of ratioNames ) {
                if (app.resize.ratioName === ratioName)
                    return true;
            }  
            
            return false;
        };
    }

    static getLessRatioCondition(ratioName) {
        return () => app.resize.ratioLess(ratioName);
    }

    static check(conditions) {
        if (conditions.length === 0) return false;

        for ( let condition of conditions ) {            
            if ( !condition() ) return false;
        }

        return true;
    }
}