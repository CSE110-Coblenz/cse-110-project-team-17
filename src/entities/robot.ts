import { MovableEntity } from './base';
import Konva from 'konva';



export class Robot extends MovableEntity {
    // private screen: Screen;
    private group: Konva.Group;
    private health: number;
    private maxAttack: number;
    private isZombie: boolean = false;

    constructor(name: string, health: number, maxAttack: number, x: number, y: number, robotImage?: HTMLImageElement) {
        const speed = 5;
        let currentImage = new Konva.Image({
            x,
            y,
            width: 32,
            height: 32,
            image: robotImage,
        });
        super(name, speed, currentImage, x, y);

        this.health = health;
        this.maxAttack = maxAttack;
        this.group = new Konva.Group({ x, y });
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

    getIsZombie(): boolean {
        return this.isZombie;
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
     * */
    show(): void {
        this.group.visible(true);
        // this.screen.render();
    }

    /**
     * Hide the robot
     *
     * */
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

    /**
     * Create the visual representation of the robot
     *
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
        this.getCurrentImage().image(image);
    }

    /*
    getCurrentImage(){
        return this.currentImage;
    } 

    /**
     * Move the robot to a specific position
     *
    moveTo(dx: number, dy: number): void {
        this.currentImage.x(this.currentImage.x() + dx * this.speed);
        this.currentImage.y(this.currentImage.y() + dy * this.speed);
        this.position = { x: this.currentImage.x(), y: this.currentImage.y() };
        // this.screen.render();
    }
    
    /**
     * Render the Robot (update the screen)
     *
    render(): void {
        // this.screen.render();
    }

    /**
     * Move the robot to a specific position
     *
    move(dx: number, dy: number): void {
        this.currentImage.x(this.currentImage.x() + dx * this.speed);
        this.currentImage.y(this.currentImage.y() + dy * this.speed);
        this.position = { x: this.currentImage.x(), y: this.currentImage.y() };
        // this.screen.render();
    } */
}