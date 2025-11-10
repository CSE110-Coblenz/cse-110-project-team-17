import { BaseEntity } from './base';
import Konva from 'konva';

export type position = {
    x : number;
    y : number;
};

export type Directions = 'up' | 'down' | 'right' | 'left';

export class Robot extends BaseEntity {
    // private screen: Screen;
    private group: Konva.Group;
    private health: number;
    private maxAttack: number;
    private sprite: Konva.Image | Konva.Rect | null = null;
    private position: position;
    private currentImage: Konva.Image;
    private dir: Directions;
    private speed = 1;

    constructor(name: string, health: number, maxAttack: number, x: number = 0, y: number = 0, robotImage?: HTMLImageElement) {
        super(name);
        // this.screen = screen;
        this.health = health;
        this.maxAttack = maxAttack;
        this.position = { x, y };
        this.dir = 'right';
        this.currentImage = new Konva.Image({
            x,
            y,
            width: 32,
            height: 32,
            image: robotImage,
        });
        
        this.group = new Konva.Group({ x, y });
        this.createSprite();
        
        // Spawn the robot on the screen
        // this.screen.addEntity(this.group);
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
    loadImage(image?: HTMLImageElement): void {
        if (!image) return;

        // Update existing image on the sprite
        this.currentImage.image(image);
    }

    getCurrentImage(){
        return this.currentImage;
    }

    

    /**
     * Render the Robot (update the screen)
     */
    render(): void {
        // this.screen.render();
    }

    /**
     * Move the robot to a specific position
     */
    moveTo(dx: number, dy: number): void {
        this.currentImage.x(this.currentImage.x() + dx * this.speed);
        this.currentImage.y(this.currentImage.y() + dy * this.speed);
        this.position = { x: this.currentImage.x(), y: this.currentImage.y() };
        // this.screen.render();
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

    getPosition(): position {
        return this.position;
    }

    getDirection(): Directions {
        return this.dir;
    }

    faceDirection(direction: Directions): void {
        this.dir = direction;
    }

    /**
     * Take damage
     */
    takeDamage(amount: number): void {
        this.health -= amount;
        if (this.health <= 0) {
            console.log("You have died");
            this.destroy();
        }
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
        // this.screen.render();
    }

    /**
     * Hide the robot
     */
    hide(): void {
        this.group.visible(false);
        // this.screen.render();
    }

    /**
     * Clean up resources
     */
    destroy(): void {
        // this.screen.removeEntity(this.group);
    }
}