import { Text } from "pixi.js";
import EditButton from "./EditButton.mjs";

export default class EditModeUI {
    display;
    top;
    bottom;
    left;
    right;
    currentBtn;

    color = 0xffff99;

    constructor() {
        this.display = app.pixi.container();

        this.initFrame();
        this.initEditPanel();
        this.initInfoPanel();

        window.addEventListener("resize", this.#onResize);
        this.#onResize();
    }

    initFrame() {
        this.top = app.pixi.sprite('dev/whiteSquare', { tint: this.color });
        this.bottom = app.pixi.sprite('dev/whiteSquare', { tint: this.color });
        this.left = app.pixi.sprite('dev/whiteSquare', { tint: this.color });
        this.right = app.pixi.sprite('dev/whiteSquare', { tint: this.color });

        this.display.addChild(
            this.top,
            this.bottom,
            this.left,
            this.right
        );
    }

    initEditPanel() {
        this.editPanel = app.pixi.container({
            name: 'editPanel',
            eventMode: 'static'
        });

        this.back = app.pixi.sprite('dev/whiteSquare', {
            x: 8,
            y: 8,
            tint: 0x000000,
            width: 210,
            height: 210,
            alpha: 0.25
        });

        this.text = app.pixi.sprite('dev/editMode', { x: 16, y: 16 });

        this.moveBtn = new EditButton(this, 'move');
        this.moveBtn.display.position.set(30, 63);

        this.rotateBtn = new EditButton(this, 'rotate');
        this.rotateBtn.display.position.set(60, 63);

        this.scaleBtn = new EditButton(this, 'scale');
        this.scaleBtn.display.position.set(90, 63);

        this.anchorBtn = new EditButton(this, 'anchor');
        this.anchorBtn.display.position.set(120, 63);

        this.currentBtn = this.moveBtn;
        this.currentBtn.active();

        this.editPanel.addChild(
            this.back,
            this.text,
            this.moveBtn.display,
            this.rotateBtn.display,
            this.scaleBtn.display,
            this.anchorBtn.display,
        );

        this.display.addChild(this.editPanel);
    }

    initInfoPanel() {
        let textStyle = {
            fontSize: 18,
            fontWeight: 'bold',
            fill: 0xffffff,
            strokeThickness: 4,
            stroke: 0x000000
        };

        this.nameText = new Text('name: -', textStyle);
        this.nameText.position.set(16, 80);

        this.positionText = new Text('x: -  y: -', textStyle);
        this.positionText.position.set(16, 105);

        this.angleText = new Text('angle: -', textStyle);
        this.angleText.position.set(16, 130);

        this.scaleText = new Text('scale: -', textStyle);
        this.scaleText.position.set(16, 155);

        this.anchorText = new Text('anchor: -', textStyle);
        this.anchorText.position.set(16, 180);

        this.editPanel.addChild(
            this.nameText,
            this.positionText,
            this.angleText,
            this.scaleText,
            this.anchorText
        );
    }

    resetInfo() {
        this.nameText.text = 'name: -';
        this.positionText.text = 'x: -  y: -';
        this.angleText.text = 'angle: -';
        this.scaleText.text = 'scale: -';
        this.anchorText.text = 'anchor: -';
    }

    updateInfo(sprite) {
        this.nameText.text = `name: "${sprite.name}"`;
        this.updatePositionInfo(sprite);
        this.updateAngleInfo(sprite);
        this.updateScaleInfo(sprite);
        if (sprite.anchor) this.updateAnchorInfo(sprite);
    }

    updatePositionInfo(sprite) {
        let posX = Math.round( sprite.x );
        let posY = Math.round( sprite.y );
        this.positionText.text = `x: ${posX}  y: ${posY}`;
    }

    updateAngleInfo(sprite) {
        let angle = parseFloat(sprite.angle.toFixed(2));
        this.angleText.text = `angle: ${angle}`;
    }

    updateScaleInfo(sprite) {
        let scaleX = parseFloat( sprite.scale.x.toFixed(2) );
        let scaleY = parseFloat( sprite.scale.y.toFixed(2) );
        this.scaleText.text = scaleX === scaleY ? `scale: ${scaleX}` : `scale: x: ${scaleX}, y: ${scaleY}`;
    }

    updateAnchorInfo(sprite) {
        let anchorX = parseFloat( sprite.anchor.x.toFixed(2) );
        let anchorY = parseFloat( sprite.anchor.y.toFixed(2) );
        this.anchorText.text = anchorX === anchorY ? `anchor: ${anchorX}` : `anchor: x: ${anchorX}, y: ${anchorY}`;
    }

    setMode(mode) {
        if (this.currentBtn.mode === mode ) return;

        this.currentBtn.unactive();

        switch (mode) {
            case 'move': this.currentBtn = this.moveBtn; break;
            case 'rotate': this.currentBtn = this.rotateBtn; break;
            case 'scale': this.currentBtn = this.scaleBtn; break;
            case 'anchor': this.currentBtn = this.anchorBtn; break;
        }

        this.currentBtn.active();
    }

    #onResize = () => {
        this.top.width = app.width;
        this.top.y = -6;

        this.bottom.width = app.width;
        this.bottom.y = app.height - 2;

        this.left.height = app.height;
        this.left.x = -6;

        this.right.height = app.height;
        this.right.x = app.width - 2;
    }
}
