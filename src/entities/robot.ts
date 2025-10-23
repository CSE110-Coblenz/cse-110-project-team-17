import { BaseEntity } from './base';
import { Screen } from '../screen';
import Konva from 'konva';

export class Robot extends BaseEntity {
    private screen: Screen;
    private group: Konva.Group;
    private health: number;
    private maxAttack: number;
    private sprite: Konva.Image | Konva.Rect | null = null;

    constructor(name: string, screen: Screen, health: number, maxAttack: number, x: number = 0, y: number = 0) {
        super(name);
        this.screen = screen;
        this.health = health;
        this.maxAttack = maxAttack;
        
        this.group = new Konva.Group({ x, y });
        this.createSprite();
        
        // Spawn the robot on the screen
        this.screen.addEntity(this.group);
    }

    /**
     * Create the visual representation of the robot
     */
    private createSprite(): void {
        // Placeholder - replace with actual image loading
        this.sprite = new Konva.Rect({
            x: 0,
            y: 0,
            width: 50,
            height: 50,
            fill: 'blue',
            stroke: 'darkblue',
            strokeWidth: 2,
        });
        this.group.add(this.sprite);
    }

    /**
     * Load robot image from URL
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
     * Render the Robot (update the screen)
     */
    render(): void {
        this.screen.render();
    }

    /**
     * Move the robot to a specific position
     */
    moveTo(x: number, y: number): void {
        this.group.position({ x, y });
        this.screen.render();
    }

    /**
     * Get health
     */
    getHealth(): number {
        return this.health;
    }

    /**
     * Get max attack
     */
    getMaxAttack(): number {
        return this.maxAttack;
    }

    /**
     * Set health
     */
    setHealth(health: number): void {
        this.health = health;
    }

    /**
     * Show the robot
     */
    show(): void {
        this.group.visible(true);
        this.screen.render();
    }

    /**
     * Hide the robot
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