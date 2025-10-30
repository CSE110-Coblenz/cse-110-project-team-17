/**
 * BaseEntity - Describes basic functionality shared across entities in the game
 */
import { Map } from './tempMap';

export class BaseEntity {
    private location: Map | null = null;
    protected name: string = '';

    constructor(name: string) {
        this.name = name;
    }

    /**
     * Reset entity state
     */
    reset(): void {
        this.location = null;
        this.name = '';
    }

    /**
     * Change location of the entity
     */
    changeLocation(newLocation: Map): void {
        this.location = newLocation;
    }

    /**
     * Get the name of the entity
     */
    getName(): string {
        return this.name;
    }

    /**
     * Get the location of the entity
     */
    getLocation(): Map | null {
        return this.location;
    }
}