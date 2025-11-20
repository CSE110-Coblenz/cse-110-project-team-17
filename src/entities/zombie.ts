import { BaseEntity } from './base';
import Konva from 'konva';

export type position = {
    x : number;
    y : number;
};

export type Directions = 'up' | 'down' | 'right' | 'left';

export class Zombie extends BaseEntity {
    // private screen: Screen;
    private group: Konva.Group;
    private health: number;
    private maxAttack: number;
    private terminated: boolean = false;
    private sprite: Konva.Image | Konva.Rect | null = null;
    private position: position;
    private currentImage: Konva.Image;
    private dir: Directions;
    private zombie: boolean = true;

    constructor(name: string, health: number, maxAttack: number, x: number = 0, y: number = 0, robotImage?: HTMLImageElement) {
        super(name);
        this.health = health;
        this.maxAttack = maxAttack;
        this.position = { x, y };
        this.dir = 'left';
        
        this.group = new Konva.Group({ x, y });
        this.createSprite();
        this.currentImage = new Konva.Image({
            x,
            y,
            width: 32,
            height: 32,
            image: robotImage,
        });
        
        // Spawn the zombie on the screen
        // this.screen.addEntity(this.group);
    }

    get isZombie(): boolean {
        return this.zombie;
    }

    /**
     * Create the visual representation of the zombie
     */
    private createSprite(): void {
        // Placeholder - replace with actual image loading
        this.sprite = new Konva.Rect({
            x: 0,
            y: 0,
            width: 50,
            height: 50,
            fill: 'green',
            stroke: 'darkgreen',
            strokeWidth: 2,
        });
        this.group.add(this.sprite);
    }

    /**
     * Load zombie image from URL
     */
    loadImage(imageUrl: string): void {
        Konva.Image.fromURL(imageUrl, (image) => {
            if (this.sprite) {
                this.sprite.destroy();
            }
            this.sprite = image;
            this.group.add(image);
            // this.screen.render();
        });
    }

    getCurrentImage(){
        return this.currentImage;
    }

    /**
     * Render the Zombie (update the screen)
     */
    render(): void {
        // this.screen.render();
    }

    /**
     * Move the zombie to a specific position
     */
    moveTo(x: number, y: number): void {
        this.currentImage.x(x);
        this.currentImage.y(y);
        this.position = { x: this.currentImage.x(), y: this.currentImage.y() };
        // this.screen.render();
    }

    /**
     * Animate movement towards a target
     */
    moveTowards(targetX: number, targetY: number, speed: number): void {
        const currentPos = this.group.position();
        const dx = targetX - currentPos.x;
        const dy = targetY - currentPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > speed) {
            const ratio = speed / distance;
            this.moveTo(
                currentPos.x + dx * ratio,
                currentPos.y + dy * ratio
            );
        } else {
            this.moveTo(targetX, targetY);
        }
    }

    /**
     * Check if terminated and clean up memory if true
     */
    checkTermination(): void {
        if (this.terminated) {
            this.destroy();
        }
    }

    /**
     * Set terminated status
     */
    terminate(): void {
        this.terminated = true;
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
            this.terminate();
        }
    }

    /**
     * Get health
     */
    getHealth(): number {
        return this.health;
    }

    setHealth(val : number) :void {
        this.health = val;
    }

    /**
     * Get max attack
     */
    getMaxAttack(): number {
        return this.maxAttack;
    }

    /**
     * Show the zombie
     */
    show(): void {
        this.group.visible(true);
        // this.screen.render();
    }

    /**
     * Hide the zombie
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