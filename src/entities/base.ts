import Konva from "konva";


export type position = {
    x : number;
    y : number;
};
export type Directions = 'up' | 'down' | 'right' | 'left';

/* Holds all of the classes that Robot and Zombie share */
/* Also hold functions to implement object collision to Player, Zombie, and Robot */
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

    getPosition(): position {
        return this.position;
    }

    getDirection(): Directions {
        return this.dir;
    }

    faceDirection(direction: Directions): void {
        this.dir = direction;
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

    moveTo(x: number, y: number): void {
        this.currentImage.x(x);
        this.currentImage.y(y);
        this.position = { x, y };
    }

    /** Get the entity's name */
    getName(): string {
        return this.name;
    }

    /** Get the movement speed */
    getSpeed(): any {
        return this.speed;
    }

    setSpeed(speed: number): void {
        this.speed = speed;
    }
}
