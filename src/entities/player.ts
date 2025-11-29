import { MovableEntity, type Directions } from './base';
import Konva from 'konva';


const playerSprites: { name: Directions; width: number; src: string }[] = [
    {name: 'up', width: 11, src: "/spritesheets/Character_up_idle-Sheet6.png"},
    {name: 'down', width: 13, src: "/spritesheets/Character_down_idle-Sheet6.png"},
    {name: 'right', width: 12, src: "/spritesheets/Character_side_idle-Sheet6.png"},
    {name: 'left', width: 12, src: "/spritesheets/Character_side-left_idle-Sheet6.png"},
]


/* 
* Set the Player Sprite, and control how it moves across the map.
*/
export class Player extends MovableEntity {
    private inventory: string[] = [];
    private sprites: Record<Directions, Konva.Group> = {
        up: null!,
        down: null!,
        left: null!,
        right: null!,
    };

    constructor(name: string, x: number, y: number, temp: HTMLImageElement){
        const speed = 2;
        let temp2 = new Konva.Image({
            x: 0,
            y: 0,
            width: 16,
            height: 16,
            image: temp
        });
        super(name, speed, temp2, x, y);

        for(const sprite of playerSprites){
            let html = this.loadImage(sprite.src);
            let img = new Konva.Image({
                x: 0,
                y: 0,
                width: sprite.width,
                height: 16,
                image: html,
                crop: {
                    x: 0,
                    y: 0,
                    width: sprite.width,
                    height: 16
                }
            });
            
            let tempGroup = new Konva.Group({ x: x, y: y,visible: false });
            tempGroup.add(img);
            this.sprites[sprite.name] = tempGroup;
        }
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

    getAllSprites(): Record<Directions, Konva.Group> {
        return this.sprites;
    }

    private loadImage(src: string): HTMLImageElement {
        const img = new Image();
        img.src = src;
        return img;
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
}
