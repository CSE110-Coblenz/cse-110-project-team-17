import { STAGE_WIDTH, EDGE_THRESHOLD } from "../../constants.ts";

/**
 * ExplorationScreenModel - Manages exploration/object collection state
 */
export class ExplorationScreenModel {
    private collectedItems: string[] = [];
    private objectsOnMap: Map<string, boolean> = new Map(); // objectName -> isCollected
    private running: boolean = false;

    private collectedCount = 0;

    /**
     * Reset exploration state for a new game
     */
    reset(): void {
        this.collectedItems = [];
        this.objectsOnMap.clear();
        this.running = false;
    }

    /**
     * Check if exploration is running
     */
    isRunning(): boolean {
        return this.running;
    }

    /**
     * Set exploration running state
     */
    setRunning(running: boolean): void {
        this.running = running;
    }
    
    /**
     * Add an object to the map
     */
    addObject(objectName: string): void {
        this.objectsOnMap.set(objectName, false);
    }

    /**
     * Collect an object
     */
    collectObject(objectName: string): void {
        if (this.objectsOnMap.has(objectName) && !this.objectsOnMap.get(objectName)) {
            this.objectsOnMap.set(objectName, true);
            this.collectedItems.push(objectName);
            this.collectedCount++;
        }
    }

    /**
     * Check if an object has been collected
     */
    isObjectCollected(objectName: string): boolean {
        return this.objectsOnMap.get(objectName) || false;
    }

    /**
     * Get all collected items
     */
    getCollectedItems(): string[] {
        return [...this.collectedItems];
    }

    /**
     * Check if all objects have been collected
     */
    allObjectsCollected(): boolean {
        return this.collectedCount === this.objectsOnMap.size;
    }

    shouldTransitionToCombat(playerX: number): boolean {
        return playerX >= STAGE_WIDTH - EDGE_THRESHOLD && this.allObjectsCollected();
    }

    getNumCollectedObjects(): number {
        return this.collectedCount;
    }
}