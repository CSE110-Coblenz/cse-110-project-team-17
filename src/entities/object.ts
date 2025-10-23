import { BaseEntity } from './base';
import { Screen } from '../screen';
import Konva from 'konva';

/**
 * GameObject - Represents static or interactive objects in the game
 * Examples: doors, keys, chests, obstacles, collectibles, etc.
 */
export class GameObject extends BaseEntity {
    private screen: Screen;
    private group: Konva.Group;
    private sprite: Konva.Image | Konva.Rect | null = null;
    private interactable: boolean;
    private collected: boolean = false;

    constructor(
        name: string, 
        screen: Screen, 
        x: number = 0, 
        y: number = 0,
        interactable: boolean = false
    ) {
        super(name);
        this.screen = screen;
        this.interactable = interactable;
        
        this.group = new Konva.Group({ x, y });
        this.createSprite();
        
        // Spawn the object on the screen
        this.screen.addEntity(this.group);
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
     * Load object image from URL
     */
    loadImage(imageUrl: string): void {
        Konva.Image.fromURL(imageUrl, (image) => {
            if (this.sprite) {
                this.sprite.destroy();
            }
            this.sprite = image;
            this.group.add(image);
            this.screen.render();
        });
    }

    /**
     * Render the GameObject (update the screen)
     */
    render(): void {
        this.screen.render();
    }

    /**
     * Move the object to a specific position
     */
    moveTo(x: number, y: number): void {
        this.group.position({ x, y });
        this.screen.render();
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
        this.screen.render();
    }

    /**
     * Hide the object
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

    /**
     * Get the object's group (for advanced operations like collision detection)
     */
    getGroup(): Konva.Group {
        return this.group;
    }
}