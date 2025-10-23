import Konva from 'konva';

/**
 * Screen - Manages rendering and entity spawning (similar to Pygame's screen)
 * 
 * This class provides a simple interface for entities to draw themselves
 * without needing to understand Konva's layer/group hierarchy.
 */
export class Screen {
    private stage: Konva.Stage;
    private backgroundLayer: Konva.Layer;
    private entityLayer: Konva.Layer;
    private uiLayer: Konva.Layer;

    constructor(containerId: string, width: number, height: number) {
        // Create the stage (canvas)
        this.stage = new Konva.Stage({
            container: containerId,
            width: width,
            height: height,
        });

        // Create layers for different rendering contexts
        this.backgroundLayer = new Konva.Layer();
        this.entityLayer = new Konva.Layer();
        this.uiLayer = new Konva.Layer();

        this.stage.add(this.backgroundLayer);
        this.stage.add(this.entityLayer);
        this.stage.add(this.uiLayer);
    }

    /**
     * Add a shape to the entity layer
     */
    addEntity(shape: Konva.Group | Konva.Shape): void {
        this.entityLayer.add(shape);
        this.entityLayer.draw();
    }

    /**
     * Remove a shape from the entity layer
     */
    removeEntity(shape: Konva.Group | Konva.Shape): void {
        shape.destroy();
        this.entityLayer.draw();
    }

    /**
     * Add a shape to the background layer
     */
    addBackground(shape: Konva.Group | Konva.Shape): void {
        this.backgroundLayer.add(shape);
        this.backgroundLayer.draw();
    }

    /**
     * Add a shape to the UI layer
     */
    addUI(shape: Konva.Group | Konva.Shape): void {
        this.uiLayer.add(shape);
        this.uiLayer.draw();
    }

    /**
     * Redraw the entity layer (call after entity movements)
     */
    render(): void {
        this.entityLayer.draw();
    }

    /**
     * Redraw all layers
     */
    renderAll(): void {
        this.backgroundLayer.draw();
        this.entityLayer.draw();
        this.uiLayer.draw();
    }

    /**
     * Clear all entities from the screen
     */
    clear(): void {
        this.entityLayer.destroyChildren();
        this.entityLayer.draw();
    }

    /**
     * Get the entity layer (for advanced operations)
     */
    getEntityLayer(): Konva.Layer {
        return this.entityLayer;
    }

    /**
     * Get the background layer (for advanced operations)
     */
    getBackgroundLayer(): Konva.Layer {
        return this.backgroundLayer;
    }

    /**
     * Get the UI layer (for advanced operations)
     */
    getUILayer(): Konva.Layer {
        return this.uiLayer;
    }

    /**
     * Get the stage (for advanced operations)
     */
    getStage(): Konva.Stage {
        return this.stage;
    }

    /**
     * Get screen dimensions
     */
    getWidth(): number {
        return this.stage.width();
    }

    getHeight(): number {
        return this.stage.height();
    }
}