export default class EditButton {
    display;                

    constructor(editFrame, mode) {
        this.editFrame = editFrame;
        this.mode = mode;

        this.display = app.pixi.container();
        this.back = app.pixi.sprite('dev/buttonBack', { anchor: 0.5, scale: 1.1 });
        this.icon = app.pixi.sprite('dev/' + mode, { anchor: 0.5 });

        this.display.addChild(
            this.back,
            this.icon
        );

        this.display.eventMode = 'static';
        this.display.on('pointerdown', this.#onTap);

        this.unactive();
    }

    active() {
        this.display.scale.set(1);
        this.back.alpha = 1;
    }

    unactive() {
        this.display.scale.set(0.9);
        this.back.alpha = 0.2;
    }

    #onTap = (event) => {
        this.editFrame.setMode(this.mode);
        event.stopPropagation();
    }
}