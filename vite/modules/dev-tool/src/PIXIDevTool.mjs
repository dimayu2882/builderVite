import { ASSETS } from "./DevAssets.mjs";
import SelectedFrame from "./SelectedFrame.mjs";
import EditModeUI from "./EditModeFrame.mjs";
import { Point } from "pixi.js";

// TODO:
// (v) Перемещение стрелочками
// (v) Привязка по 15 шрадусов
// (v) Порядок вывода поменять позиция и привязка
// (v) Целые координаты не только в выводе но и у спрайта
// (v) проблема с pivot

// (x) Кнопку скрытия спрайтов
// (x) Визуальное окошечко с информацией

export default class PIXIDevTool {
    pixiApp;
    cacheResume;
    currentSprite;

    isStart = false;
    
    startTransform = {
        position: new Point(),
        rotation: 0,
        scale: new Point(),
        anchor: new Point(),
        pivot:new Point(),
    };

    parents = [];
    
    mouse = {
        x: 0,
        y: 0,
        isDown: false,
        spriteName: ""
    };

    constructor() {
        this.pixiApp = app.pixi.app;

        app.assets.loadFiles(ASSETS, () => {
            this.initDevLayer();
            this.initUI();
            this.initEvents();
        });
    }

    initDevLayer() {
        this.devLayer = app.pixi.container({name: 'devLayer'});
        this.devLayer.hitArea = this.devLayer.getBounds().clone();
    }

    initUI() {
        this.editModeUI = new EditModeUI();

        this.selectFrame = new SelectedFrame(this.devLayer);
        this.selectFrame.display.visible = false;

        this.devLayer.addChild(
            this.selectFrame.display,
            this.editModeUI.display,
        );
    }

    initEvents() {
        // document.addEventListener('keypress', this.#onKeyPress);
        document.addEventListener('keydown', this.#onKeyPress);
    }

    #start() {
        if (this.isStart) return;
        this.isStart = true;

        app.pause();
        this.cacheResume = app.resume;
        app.resume = ()=>{};
        
        this.devLayer.eventMode = 'static';
        this.devLayer.on('pointerdown', this.#onLayerTap);
        this.devLayer.on('pointermove', this.#onLayerMove);
        this.devLayer.on('pointerup', this.#onLayerUp);
        this.devLayer.on('pointerupoutside', this.#onLayerUp);

        app.stage.addChild(this.devLayer);
        
        window.addEventListener("resize", this.#onResize);
        this.#onResize();
    }

    #stop() {
        if (!this.isStart) return;
        this.isStart = false;

        app.resume = this.cacheResume;
        app.resume();

        this.currentSprite = null;
        this.selectFrame.hide();

        this.devLayer.eventMode = 'none';
        this.devLayer.off('pointerdown', this.#onLayerTap);
        this.devLayer.off('pointermove', this.#onLayerMove);
        this.devLayer.off('pointerup', this.#onLayerUp);
        this.devLayer.off('pointerupoutside', this.#onLayerUp);

        app.stage.removeChild(this.devLayer);
        
        window.removeEventListener("resize", this.#onResize);
    }

    #onKeyPress = (event) => {
        // console.log(event.code);
        
        switch(event.code) {
            case 'Space':
                this.isStart ? this.#stop() : this.#start();
                break;
            
            case 'KeyD':
                this.editModeUI.setMode('move');
                break;

            case 'KeyR':
                this.editModeUI.setMode('rotate');
                break;

            case 'KeyS':
                this.editModeUI.setMode('scale');
                break;

            case 'KeyA':
                if (this.editModeUI.anchorBtn.display.visible)
                        this.editModeUI.setMode('anchor');
                break;
        }

        if (!this.currentSprite) return;
        let editMode = this.editModeUI.currentBtn.mode;
        
        switch(event.code) {
            case 'Minus':
            case 'NumpadSubtract':
                if (this.currentSprite.parent && this.currentSprite.parent !== app.stage) {
                    this.parents.push(this.currentSprite);
                    this.setCurrentSprite(this.currentSprite.parent);
                }
                break;

            case 'Equal':
            case 'NumpadAdd':
                if (this.parents.length > 0) {
                    this.setCurrentSprite(this.parents.pop());
                }
                break;

            case 'Numpad0':
            case 'Digit0':
                switch (editMode) {
                    case 'move': this.currentSprite.position.copyFrom( this.startTransform.position ); break;
                    case 'rotate': this.currentSprite.rotation = this.startTransform.rotation; break;
                    case 'scale': this.currentSprite.scale.copyFrom( this.startTransform.scale ); break;
                    case 'anchor':
                        if (this.currentSprite.anchor) this.currentSprite.anchor.copyFrom( this.startTransform.anchor );
                        this.currentSprite.pivot.copyFrom( this.startTransform.pivot );
                        break;
                }

                this.selectFrame.show(this.currentSprite);
                this.editModeUI.updateInfo(this.currentSprite);
                break;

            case 'ArrowLeft':
                switch (editMode) {
                    case 'move': this.currentSprite.x -= 1; break;
                    case 'rotate': this.currentSprite.angle -= 1; break;
                    case 'scale': this.currentSprite.scale.x -= 0.05; this.currentSprite.scale.y -= 0.05; break;
                    case 'anchor': this.currentSprite.anchor.x -= 0.05; break;
                }

                this.selectFrame.show(this.currentSprite);
                this.editModeUI.updateInfo(this.currentSprite);
                this.currentSprite.angle = this.currentSprite.angle % 360;
                break;

            case 'ArrowRight':
                switch (editMode) {
                    case 'move': this.currentSprite.x += 1; break;
                    case 'rotate': this.currentSprite.angle += 1; break;
                    case 'scale': this.currentSprite.scale.x += 0.05; this.currentSprite.scale.y += 0.05; break;
                    case 'anchor': this.currentSprite.anchor.x += 0.05; break;
                }

                this.selectFrame.show(this.currentSprite);
                this.editModeUI.updateInfo(this.currentSprite);
                this.currentSprite.angle = this.currentSprite.angle % 360;
                break;

            case 'ArrowUp':
                switch (editMode) {
                    case 'move': this.currentSprite.y -= 1; break;
                    case 'rotate': this.currentSprite.angle -= 1; break;
                    case 'scale': this.currentSprite.scale.x += 0.05; this.currentSprite.scale.y += 0.05; break;
                    case 'anchor': this.currentSprite.anchor.y -= 0.05; break;
                }

                this.selectFrame.show(this.currentSprite);
                this.editModeUI.updateInfo(this.currentSprite);
                this.currentSprite.angle = this.currentSprite.angle % 360;
                break;

            case 'ArrowDown':
                switch (editMode) {
                    case 'move': this.currentSprite.y += 1; break;
                    case 'rotate': this.currentSprite.angle += 1; break;
                    case 'scale': this.currentSprite.scale.x -= 0.05; this.currentSprite.scale.y -= 0.05; break;
                    case 'anchor': this.currentSprite.anchor.y += 0.05; break;
                }

                this.selectFrame.show(this.currentSprite);
                this.editModeUI.updateInfo(this.currentSprite);
                this.currentSprite.angle = this.currentSprite.angle % 360;
                break;

            case 'KeyH':
                this.currentSprite.visible = !this.currentSprite.visible;
                break;

            case 'Enter':
            case 'NumpadEnter':
                this.logParameters(this.currentSprite);
                break;
        }
    }

    #onLayerTap = (event) => {
        if (!event.isPrimary || event.button === 1) return;

        if (event.button === 2) {
            this.resetSelection();
            return;
        }
        
        this.mouse.spriteName = event.target.name;
        console.log(event.target.name);

        if (event.target.name === 'area' || event.target.name === 'center' || event.target.name === 'editPanel') {
            this.mouse.isDown = true;
            this.mouse.x = event.global.x;
            this.mouse.y = event.global.y;
            return;
        }

        let sprite = this.getSprite(event.global.x, event.global.y);
        if (sprite) {
            this.mouse.isDown = true;
            this.mouse.x = event.global.x;
            this.mouse.y = event.global.y;

            this.setCurrentSprite(sprite);
        }
    }

    #onLayerMove = (event) => {
        if (!event.isPrimary) return;

        if (this.mouse.isDown) {
            let editMode = this.editModeUI.currentBtn.mode;
            let newX = event.global.x;
            let newY = event.global.y;

            if (this.mouse.spriteName === 'editPanel') {
                this.editModeUI.editPanel.x += newX - this.mouse.x;
                this.editModeUI.editPanel.y += newY - this.mouse.y;

                this.mouse.x = newX;
                this.mouse.y = newY;
                return;
            }

            switch (editMode) {
                case 'move':
                    this.selectFrame.display.x += newX - this.mouse.x;
                    this.selectFrame.display.y += newY - this.mouse.y;

                    if (event.shiftKey) {
                        let stepX = app.width / 4;
                        let stepDeltaX = 5;

                        let divideX = Math.round( this.selectFrame.display.x / stepX );
                        let deltaX = this.selectFrame.display.x - divideX * stepX;

                        if (Math.abs(deltaX) < stepDeltaX) {
                            this.selectFrame.display.x -= deltaX;
                        }

                        let stepY = app.height / 4;
                        let stepDeltaY = 5;

                        let divideY = Math.round( this.selectFrame.display.y / stepY );
                        let deltaY = this.selectFrame.display.y - divideY * stepY;

                        if (Math.abs(deltaY) < stepDeltaY) {
                            this.selectFrame.display.y -= deltaY;
                        }
                    }

                    this.currentSprite.parent.toLocal(this.selectFrame.display, this.devLayer, this.currentSprite);
                    this.editModeUI.updatePositionInfo(this.currentSprite);
                    
                    break;

                case 'rotate':
                    let prevRotation = Math.atan2(this.mouse.y - this.selectFrame.display.y, this.mouse.x - this.selectFrame.display.x);
                    let newRotation = Math.atan2(newY - this.selectFrame.display.y, newX - this.selectFrame.display.x);
                    let deltaRotation = newRotation - prevRotation;

                    this.selectFrame.display.rotation += deltaRotation;
                    this.currentSprite.rotation += deltaRotation;

                    if (event.shiftKey) {
                        let step = 15;
                        let stepDelta = 3;

                        let divide = Math.round( this.currentSprite.angle / step );
                        let delta = this.currentSprite.angle - divide * step;

                        if (Math.abs(delta) < stepDelta) {
                            this.selectFrame.display.angle -= delta;
                            this.currentSprite.angle -= delta;
                        }
                    }

                    this.currentSprite.angle = this.currentSprite.angle % 360;
                    // this.selectFrame.show(this.currentSprite);

                    this.editModeUI.updateAngleInfo(this.currentSprite);

                    break;

                case 'scale':
                    let prevDeltaX = this.mouse.x - this.selectFrame.display.x;
                    let prevDeltaY = this.mouse.y - this.selectFrame.display.y;
                    let prevDistance = Math.sqrt(prevDeltaX**2 + prevDeltaY**2);

                    let newDeltaX = newX - this.selectFrame.display.x;
                    let newDeltaY = newY - this.selectFrame.display.y;
                    let newDistance = Math.sqrt(newDeltaX**2 + newDeltaY**2);

                    let deltaDistance = (newDistance - prevDistance) / 50;
                    
                    this.currentSprite.scale.x += deltaDistance;
                    this.currentSprite.scale.y += deltaDistance;

                    if (event.shiftKey) {
                        let step = 0.5;
                        let stepDelta = 0.05;

                        let divide = Math.round( this.currentSprite.scale.x / step );
                        let delta = this.currentSprite.scale.x - divide * step;

                        if (Math.abs(delta) < stepDelta) {
                            this.currentSprite.scale.x -= delta;
                            this.currentSprite.scale.y -= delta;
                        }
                    }

                    this.selectFrame.show(this.currentSprite);

                    this.editModeUI.updateScaleInfo(this.currentSprite);

                    break;

                case 'anchor':
                    if (this.mouse.spriteName === 'center') {
                        this.selectFrame.display.toLocal(event.global, this.devLayer, this.selectFrame.center);

                        if (event.shiftKey) {
                            let stepDelta = 10;
                            let center = this.selectFrame.center;
                            let stepX = this.selectFrame.area.width / 2;
                            let stepY = this.selectFrame.area.height / 2;

                            let centerX = center.x - this.selectFrame.cornerA.x;
                            let centerY = center.y - this.selectFrame.cornerA.y;

                            let divideX = Math.round( centerX / stepX );
                            let deltaX = centerX - divideX * stepX;

                            if (Math.abs(deltaX) < stepDelta) {
                                center.x -= deltaX;
                            }

                            let divideY = Math.round( centerY / stepY );
                            let deltaY = centerY - divideY * stepY;

                            if (Math.abs(deltaY) < stepDelta) {
                                center.y -= deltaY;
                            }
                        }

                        let deltaX = this.selectFrame.center.x - this.selectFrame.cornerA.x;
                        let deltaY = this.selectFrame.center.y - this.selectFrame.cornerA.y;
                        let anchorX = deltaX / this.selectFrame.area.width;
                        let anchorY = deltaY / this.selectFrame.area.height;
                        this.currentSprite.anchor.set(anchorX, anchorY);

                        this.currentSprite.parent.toLocal(this.selectFrame.center, this.selectFrame.display, this.currentSprite);
                        this.selectFrame.show(this.currentSprite);

                        this.editModeUI.updateAnchorInfo(this.currentSprite);
                    }
                    
                    break;
            }

            this.mouse.x = newX;
            this.mouse.y = newY;
        }
    }


    #onLayerUp = (event) => {
        if (!event.isPrimary) return;

        this.mouse.isDown = false;

        if (this.currentSprite) {
            this.currentSprite.x = Math.round(this.currentSprite.x);
            this.currentSprite.y = Math.round(this.currentSprite.y);
        }

        this.mouse.spriteName = '';
    }
    
    #onResize = () => {
        this.devLayer.hitArea.width = app.width;
        this.devLayer.hitArea.height = app.height;

        if (this.currentSprite) {
            this.selectFrame.show(this.currentSprite);
        }
    }

    setCurrentSprite(sprite) {
        this.currentSprite = sprite;
        this.startTransform.position.copyFrom(sprite.position);
        this.startTransform.rotation = sprite.rotation;
        this.startTransform.scale.copyFrom(sprite.scale);
        this.startTransform.pivot.copyFrom(sprite.pivot);
        if (sprite.anchor) this.startTransform.anchor.copyFrom(sprite.anchor);

        this.editModeUI.anchorBtn.display.visible = Boolean(sprite.anchor);

        this.editModeUI.updateInfo(sprite);

        this.selectFrame.show(sprite);
    }

    resetSelection() {
        this.selectFrame.hide();
        this.currentSprite = null;
        this.parents.length = 0;
        this.editModeUI.resetInfo();
    }

    logParameters(sprite) {
        let info = '';

        if (sprite.position.x !== 0 || sprite.position.y !== 0) {
            info += `position: {x: ${sprite.x}, y: ${sprite.y}},`;
        }

        if (sprite.anchor && (sprite.anchor.x !== 0 || sprite.anchor.y !== 0) ) {
            let anchorX = parseFloat( sprite.anchor.x.toFixed(2) );
            let anchorY = parseFloat( sprite.anchor.y.toFixed(2) );
            info += anchorX === anchorY ? `\nanchor: ${anchorX},` : `\nanchor: {x: ${anchorX}, y: ${anchorY}},`;
        }

        if (sprite.pivot && (sprite.pivot.x !== 0 || sprite.pivot.y !== 0)) {
            let pivotX = parseFloat( sprite.pivot.x.toFixed(2) );
            let pivotY = parseFloat( sprite.pivot.y.toFixed(2) );
            info += `\npivot: {x: ${pivotX}, y: ${pivotY}},`;
        }

        if (sprite.angle !== 0) info += `\nangle: ${ parseFloat(sprite.angle.toFixed(2)) },`

        if (sprite.scale.x !== 1 || sprite.scale.y !== 1) {
            let scaleX = parseFloat( sprite.scale.x.toFixed(2) );
            let scaleY = parseFloat( sprite.scale.y.toFixed(2) );
            info += scaleX === scaleY ? `\nscale: ${scaleX},` : `\nscale: {x: ${scaleX}, y: ${scaleY}},`;
        }

        console.log(info);

    }

    getSprite(x, y, parent = app.stage) {
        for (let index = parent.children.length - 1; index >= 0; index--) {
            let child = parent.children[index];
            if (child === this.devLayer || !child.visible || child.alpha === 0) continue;

            if (child.children?.length > 0) {
                let sprite = this.getSprite(x, y, child);
                if (sprite) return sprite;
            } else {
                let bounds = child.getBounds();

                if (child.visible && bounds.contains(x, y)) {
                    return child;
                }
            }
        }
    }
}
