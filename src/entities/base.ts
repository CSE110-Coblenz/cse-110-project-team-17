import Konva from "konva";
export type position = {
    x : number;
    y : number;
};
export type Directions = 'up' | 'down' | 'right' | 'left';

/** 
 * This class helps to implement object collision 
 * features across all movable entities 
 **/
export abstract class MovableEntity {
    protected name: string;
    protected speed: number;
    protected currentImage: Konva.Image;
    protected position: position;
    protected dir: Directions;

    constructor(
        name: string,
        speed: number,
        currentImage: Konva.Image,
        x: number,
        y: number
    ) {
        this.name = name;
        this.speed = speed;
        this.currentImage = currentImage;
        this.position = { x, y };
        this.dir = 'right';
    }

    /** Get the entity's name */
    getName(): string {
        return this.name;
    }

    /** Get the movement speed */
    getSpeed(): number {
        return this.speed;
    }

    setSpeed(speed: number): void {
        this.speed = speed;
    }

    getDir(): Directions {
        return this.dir;
    }

    setDir(dir: Directions): void {
        this.dir = dir;
    }

    /** Get Konva image */
    getCurrentImage(): Konva.Image {
        return this.currentImage;
    }

    /** Current X/Y accessors */
    getX(): number {
        return this.currentImage.x();
    }

    getY(): number {
        return this.currentImage.y();
    }

    /** Calculate next position given dx/dy */
    getNextPosition(dx: number, dy: number) {
        return {
            x: this.getX() + dx * this.speed,
            y: this.getY() + dy * this.speed,
        };
    }

    /** Apply new position to the sprite */
    applyPosition(x: number, y: number) {
        this.currentImage.x(x);
        this.currentImage.y(y);
        this.position = { x, y };
    }

    moveTo(dx: number, dy: number): void {
        this.currentImage.x(this.currentImage.x() + dx * this.speed);
        this.currentImage.y(this.currentImage.y() + dy * this.speed);
        this.position = { x: this.currentImage.x(), y: this.currentImage.y() };
        // this.screen.render();
    }

    faceDirection(direction: Directions): void {
        this.dir = direction;
    }
}
