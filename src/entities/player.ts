import { BaseEntity } from './base';
import { Screen } from '../screen';
import Konva from 'konva';

export class Player extends BaseEntity {
    private screen: Screen;
    private group: Konva.Group;
    private inventory: string[] = [];
    private imageFrames: CanvasImageSource[] = [];
    private currentImage: Konva.Image | null = null;
    private currentFrameIndex: number = 0;

    constructor(name: string, screen: Screen, x: number = 0, y: number = 0) {
        super(name);
        this.screen = screen;
        
        // Create a group to hold all player visuals
        this.group = new Konva.Group({ x, y });
        
        // Spawn the player on the screen
        this.screen.addEntity(this.group);
    }

    /**
     * Set image frames and initialize the visual representation
     */
    setImageFrames(frames: CanvasImageSource[]): void {
        this.imageFrames = frames;
        if (frames.length > 0) {
            this.loadImage(frames[0]);
        }
    }

    /**
     * Load an image onto the player
     */
    private loadImage(imageSource: CanvasImageSource): void {
        if (this.currentImage) {
            this.currentImage.destroy();
        }

        const image = new Konva.Image({
            image: imageSource,
            x: 0,
            y: 0,
        });
        
        this.currentImage = image;
        this.group.add(image);
        this.screen.render();
    }

    /**
     * Switch to a specific frame
     */
    setFrame(frameIndex: number): void {
        if (frameIndex >= 0 && frameIndex < this.imageFrames.length) {
            this.currentFrameIndex = frameIndex;
            this.loadImage(this.imageFrames[frameIndex]);
        }
    }

    /**
     * Switch to the next frame (useful for animation)
     */
    nextFrame(): void {
        if (this.imageFrames.length > 0) {
            this.currentFrameIndex = (this.currentFrameIndex + 1) % this.imageFrames.length;
            this.loadImage(this.imageFrames[this.currentFrameIndex]);
        }
    }

    /**
     * Get total number of frames
     */
    getFrameCount(): number {
        return this.imageFrames.length;
    }

    /**
     * Render the Player (update the screen)
     */
    render(): void {
        this.screen.render();
    }

    /**
     * Move the player to a specific position
     */
    moveTo(x: number, y: number): void {
        this.group.position({ x, y });
        this.screen.render();
    }

    /**
     * Add item to inventory
     */
    addToInventory(item: string): void {
        this.inventory.push(item);
    }

    /**
     * Get inventory
     */
    getInventory(): string[] {
        return [...this.inventory];
    }

    /**
     * Show the player
     */
    show(): void {
        this.group.visible(true);
        this.screen.render();
    }

    /**
     * Hide the player
     */
    hide(): void {
        this.group.visible(false);
        this.screen.render();
    }

    /**
     * Clean up resources
     */
    destroy(): void {
        this.screen.removeEntity(this.group);
    }
}