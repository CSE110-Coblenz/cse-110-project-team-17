import { MovableEntity, type Directions } from './base';
import Konva from 'konva';
import { audioManager } from '../audioManager.ts';

const robotSprites: { name: Directions; width: number; src: string }[] = [
    {name: 'up', width: 11, src: "/spritesheets/Robot_Back.png"},
    {name: 'down', width: 16, src: "/spritesheets/Robot_Foward.png"},
    {name: 'right', width: 12, src: "/spritesheets/Robot_Right.png"},
    {name: 'left', width: 12, src: "/spritesheets/Robot_Left.png"},
]

export class Robot extends MovableEntity {
    // private screen: Screen;
    private group: Konva.Group;
    private health: number;
    private maxAttack: number;
    private isZombie: boolean = false;
    private sprites: Record<Directions, Konva.Group> = {
            up: null!,
            down: null!,
            left: null!,
            right: null!,
        };

    constructor(name: string, health: number, maxAttack: number, x: number, y: number, robotImage?: HTMLImageElement) {
        const speed = 3;
        let currentImage = new Konva.Image({
            x,
            y,
            width: 16,
            height: 16,
            image: robotImage,
        });
        super(name, speed, currentImage, x, y);

        this.health = health;
        this.maxAttack = maxAttack;
        this.group = new Konva.Group({ x, y });

        let xOff = 0;
        for(const sprite of robotSprites){
            let html = this.loadImage2(sprite.src);
            if(sprite.name === 'down') xOff = 8;
            let img = new Konva.Image({
                x: 0,
                y: 0,
                width: sprite.width,
                height: 16,
                image: html,
                crop: {
                    x: xOff,
                    y: 0,
                    width: sprite.width,
                    height: 16
                }
            });
            let tempGroup = new Konva.Group({ x: x, y: y, visible: false });
            tempGroup.add(img);
            this.sprites[sprite.name] = tempGroup;
            xOff=0;
        }
    }

    getAllSprites(): Record<Directions, Konva.Group> {
        return this.sprites;
    }

    move(x: number, y: number): void {
        this.sprites['up'].position({ x, y });
        this.sprites['left'].position({ x, y });
        this.sprites['down'].position({ x, y });
        this.sprites['right'].position({ x, y });
        //this.currentImage.x(x);
        //this.currentImage.y(y);
        this.position = { x, y };
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
        audioManager.playSfx("robot_damage");
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
     * Load robot image from URL
     */
    loadImage(image?: HTMLImageElement): void {
        if (!image) return;

        
        // Update existing image on the sprite
        this.getCurrentImage().image(image);
    }

    /**
     * Load image from its path as a string
     */
    private loadImage2(src: string): HTMLImageElement {
        const img = new Image();
        img.src = src;
        return img;
    }
}
