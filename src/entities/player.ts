import { MovableEntity } from './base';
import Konva from 'konva';

/* 
* Set the Player Sprite, and control how it moves across the map.
*/
export class Player extends MovableEntity {
    private inventory: string[] = [];

    constructor(name: string, x: number, y: number, playerImage: HTMLImageElement){
        const currentImage = new Konva.Image({
            x,
            y,
            width: 16,
            height: 16,
            image: playerImage,
        });
        const speed = 3;

        super(name, speed, currentImage, x, y);
    }

    /** Move by delta and update position */
    move(dx: number, dy: number): void {
        const next = this.getNextPosition(dx, dy);
        this.moveTo(next.x, next.y);
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
