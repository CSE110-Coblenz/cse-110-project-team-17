import { MovableEntity } from './base';
import Konva from 'konva';

/* 
* Set the Player Sprite, and control how it moves across the map.
*/
export class Player extends BaseEntity {
    // private group: Konva.Group;
    private inventory: string[] = [];
    // private imageFrames: CanvasImageSource[] = [];
    private currentImage: Konva.Image;
    // private currentFrameIndex: number = 0;
    private speed = 5;

    constructor(name: string, x: number, y: number, playerImage: HTMLImageElement){
        super(name);
        //this.screen = screen;
        // this.group = new Konva.Group({ x, y });
        this.currentImage = new Konva.Image({
            x,
            y,
            width: 32,
            height: 32,
            image: playerImage,
        });
        // this.screen.addEntity(this.group);
    }

    getCurrentImage(){
        return this.currentImage;
    }

    move(dx: number, dy: number){
        this.currentImage.x(this.currentImage.x() + dx * this.speed);
        this.currentImage.y(this.currentImage.y() + dy * this.speed);
    }

    /**
     * Set image frames and initialize the visual representation
     *
    setImageFrames(frames: CanvasImageSource[]): void {
        this.imageFrames = frames;
        if (frames.length > 0) {
            this.loadImage(frames[0]);
        }
    }

    /**
     * Load an image onto the player
     *
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

        super(name, speed, currentImage, x, y);
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
}