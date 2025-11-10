import { BaseEntity } from './base';
import Konva from 'konva';

/**
 * GameObject - Represents static or interactive objects in the game
 * Examples: doors, keys, chests, obstacles, collectibles, etc.
 */
export class GameObject extends BaseEntity {
    private group: Konva.Group;
    private sprite: Konva.Image | Konva.Rect | null = null;
    private interactable: boolean;
    private collected: boolean = false;
    private currentImage: Konva.Image | null = null;

    constructor(
        name: string, 
        x: number = 0, 
        y: number = 0,
        interactable: boolean = false
    ) {
        super(name);
        this.interactable = interactable;
        
        this.group = new Konva.Group({ x, y });
        this.createSprite();
    }

    /**
     * Create the visual representation of the object
     */
    private createSprite(): void {
        // Placeholder - replace with actual image loading
        this.sprite = new Konva.Rect({
            x: 0,
            y: 0,
            width: 40,
            height: 40,
            fill: this.interactable ? 'gold' : 'gray',
            stroke: this.interactable ? 'orange' : 'darkgray',
            strokeWidth: 2,
        });
        this.group.add(this.sprite);
    }

    /**
     * Load object image from URL or HTMLImageElement
     */
    async loadImage(imageSource: string | HTMLImageElement): Promise<void> {
        if (typeof imageSource === 'string') {
            // Load from URL
            return new Promise((resolve) => {
                Konva.Image.fromURL(imageSource, (image) => {
                    if (this.sprite) {
                        this.sprite.destroy();
                    }
                    this.sprite = image;
                    this.currentImage = image;
                    this.group.add(image);
                    resolve();
                });
            });
        } else {
            // Load from HTMLImageElement
            if (this.sprite) {
                this.sprite.destroy();
            }
            this.currentImage = new Konva.Image({
                x: 0,
                y: 0,
                width: 40,
                height: 40,
                image: imageSource,
            });
            this.sprite = this.currentImage;
            this.group.add(this.currentImage);
        }
    }

    /**
     * Get the current image (for rendering)
     */
    getCurrentImage(): Konva.Image | Konva.Rect | null {
        return this.sprite;
    }

    /**
     * Move the object to a specific position
     */
    moveTo(x: number, y: number): void {
        this.group.position({ x, y });
    }

    /**
     * Check if the object is interactable
     */
    isInteractable(): boolean {
        return this.interactable;
    }

    /**
     * Set interactable status
     */
    setInteractable(interactable: boolean): void {
        this.interactable = interactable;
    }

    /**
     * Mark object as collected
     */
    collect(): void {
        this.collected = true;
        this.hide();
    }

    /**
     * Check if object has been collected
     */
    isCollected(): boolean {
        return this.collected;
    }

    /**
     * Interact with the object
     * Override this method in subclasses for specific behavior
     */
    interact(): void {
        if (this.interactable && !this.collected) {
            // Default interaction behavior
            console.log(`Interacting with ${this.getName()}`);
        }
    }

    /**
     * Show the object
     */
    show(): void {
        this.group.visible(true);
    }

    /**
     * Hide the object
     */
    hide(): void {
        this.group.visible(false);
    }

    /**
     * Clean up resources
     */
    destroy(): void {
        this.group.destroy();
    }

    /**
     * Get the object's group (for advanced operations like collision detection)
     */
    getGroup(): Konva.Group {
        return this.group;
    }

    /**
     * Get position
     */
    getPosition(): { x: number; y: number } {
        return this.group.position();
    }
}