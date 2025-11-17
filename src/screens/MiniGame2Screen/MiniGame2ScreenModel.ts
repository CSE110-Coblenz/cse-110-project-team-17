/**
 * MiniGame2ScreenModel - Manages minigame 2 state
 * Objects can be picked up and dropped one at a time
 */
export class MiniGame2ScreenModel {
    private deliveredItems: string[] = []; // Items that have been delivered to goal
    private objectsOnMap: Map<string, 'idle' | 'carried' | 'delivered'> = new Map();
    private running: boolean = false;
    private currentlyCarriedItem: string | null = null; // Track which item is being carried

    /**
     * Reset minigame state for a new game
     */
    reset(): void {
        this.deliveredItems = [];
        this.objectsOnMap.clear();
        this.running = false;
        this.currentlyCarriedItem = null;
    }

    /**
     * Check if minigame is running
     */
    isRunning(): boolean {
        return this.running;
    }

    /**
     * Set minigame running state
     */
    setRunning(running: boolean): void {
        this.running = running;
    }
    
    /**
     * Add an object to the map
     */
    addObject(objectName: string): void {
        this.objectsOnMap.set(objectName, 'idle');
    }

    /**
     * Pick up an object (mark as carried)
     */
    carryObject(objectName: string): void {
        if (this.objectsOnMap.has(objectName) && !this.currentlyCarriedItem) {
            this.objectsOnMap.set(objectName, 'carried');
            this.currentlyCarriedItem = objectName;
        }
    }

    /**
     * Drop the currently carried object
     */
    dropObject(): string | null {
        if (this.currentlyCarriedItem) {
            const droppedItem = this.currentlyCarriedItem;
            this.objectsOnMap.set(droppedItem, 'idle');
            this.currentlyCarriedItem = null;
            return droppedItem;
        }
        return null;
    }

    /**
     * Get the currently carried item name
     */
    getCurrentlyCarriedItem(): string | null {
        return this.currentlyCarriedItem;
    }

    /**
     * Check if an object is being carried
     */
    isObjectCarried(objectName: string): boolean {
        return this.objectsOnMap.get(objectName) === 'carried';
    }

    /**
     * Check if an object is idle (not carried, not delivered)
     */
    isObjectIdle(objectName: string): boolean {
        return this.objectsOnMap.get(objectName) === 'idle';
    }

    /**
     * Get all delivered items
     */
    getDeliveredItems(): string[] {
        return [...this.deliveredItems];
    }

    /**
     * Mark an object as delivered (for future use if you have a delivery zone)
     */
    deliverObject(objectName: string): void {
        if (this.objectsOnMap.has(objectName)) {
            this.objectsOnMap.set(objectName, 'delivered');
            this.deliveredItems.push(objectName);
            if (this.currentlyCarriedItem === objectName) {
                this.currentlyCarriedItem = null;
            }
        }
    }

    /**
     * Check if all objects have been delivered
     */
    allObjectsDelivered(): boolean {
        return Array.from(this.objectsOnMap.values()).every(state => state === 'delivered');
    }

    /**
     * Check if player is carrying something
     */
    isCarryingSomething(): boolean {
        return this.currentlyCarriedItem !== null;
    }
}