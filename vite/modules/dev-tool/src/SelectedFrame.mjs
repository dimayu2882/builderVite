export default class SelectedFrame {
    display;
    devLayer;
    sprite;

    area;
    center;
    cornerA;
    cornerB;
    cornerC;
    cornerD;                

    constructor(devLayer) {
        this.devLayer = devLayer;

        this.initDisplay();        
    }

    initDisplay() {
        this.display = app.pixi.container();

        this.area = app.pixi.sprite('dev/whiteSquare', {name: 'area', tint: 0xffffff, alpha: 0.1, blendMode: 1, eventMode: 'static'});
        this.cornerA = app.pixi.sprite('dev/corner', {anchor: 0.2});
        this.cornerB = app.pixi.sprite('dev/corner', {anchor: 0.2, angle: 90});
        this.cornerC = app.pixi.sprite('dev/corner', {anchor: 0.2, angle: 180});
        this.cornerD = app.pixi.sprite('dev/corner', {anchor: 0.2, angle: 270});
        this.center = app.pixi.sprite('dev/anchor', {name: 'center', anchor: 0.5, eventMode: 'static'});

        this.display.addChild(   
            this.area,
            this.cornerA,
            this.cornerB,
            this.cornerC,
            this.cornerD,
            this.center
        );
    }    

    show(sprite) {
        this.sprite = sprite;
        this.display.visible = true;

        let bounds = sprite.getLocalBounds();

        let scaleX = sprite.scale.x;
        let scaleY = sprite.scale.y;
        let rotation = sprite.rotation;

        let parent = sprite.parent;
        while (parent) {
            scaleX *= parent.scale.x;
            scaleY *= parent.scale.y;
            rotation += parent.rotation;
            parent = parent.parent;
        }       

        let width = bounds.width * scaleX;
        let height = bounds.height * scaleY;

        this.cornerA.x = (bounds.x - sprite.pivot.x) * scaleX;
        this.cornerA.y = (bounds.y - sprite.pivot.y) * scaleX;

        this.cornerB.x = this.cornerA.x + width;
        this.cornerB.y = this.cornerA.y;

        this.cornerC.x = this.cornerB.x;
        this.cornerC.y = this.cornerB.y + height;

        this.cornerD.x = this.cornerA.x;
        this.cornerD.y = this.cornerA.y + height;

        this.area.x = this.cornerA.x;
        this.area.y = this.cornerA.y;

        this.area.scale.set(1);
        this.area.width = width;
        this.area.height = height;

        this.center.x = 0;
        this.center.y = 0;
       
        this.display.rotation = rotation;
        // this.center.rotation = -rotation;

        this.devLayer.toLocal(sprite, sprite.parent, this.display);
    }

    hide() {
        this.display.visible = false;
    }
}
