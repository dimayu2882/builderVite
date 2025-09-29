export default class SpriteUtils {
    /**
     * Resets the sprite settings to the initial state.
     * @param {PIXI.Sprite} sprite - Sprite to reset
     */
    static resetSprite(sprite) {
        sprite.angle = 0;
        sprite.rotation = 0;
        sprite.scale.set(1);
        sprite.pivot.set(0, 0);
        sprite.anchor.set(0, 0);
        sprite.position.set(0, 0);
        sprite.alpha = 0;
        sprite.visible = true;
        sprite.skew.set(0, 0);

        gsap.killTweensOf(sprite);
    }

    static setSpriteOptions(sprite, options = {}) {
        if (options.anchor !== undefined) {
            if (typeof options.anchor === "object") {
                sprite.anchor.set(options.anchor.x || 0, options.anchor.y || 0);
            } else {
                sprite.anchor.set(options.anchor);
            }
        }
        if (options.scale) {
            sprite.scale.set(options.scale.x || 1, options.scale.y || 1);
        }
        if (options.alpha !== undefined) {
            sprite.alpha = options.alpha;
        }
        if (options.angle !== undefined) {
            sprite.angle = options.angle;
        }
        if (options.visible !== undefined) {
            sprite.visible = options.visible;
        }
        if (options.position) {
            sprite.position.set(
                options.position.x || 0,
                options.position.y || 0
            );
        }
        if (options.pivot) {
            sprite.pivot.set(
                options.pivot.x || 0,
                options.pivot.y || 0
            );
        }
    }
}
