export type TextSnippetDefinition = {
    id: string;
    label: string;
    text: string;
};

export const TEXT_SNIPPETS: TextSnippetDefinition[] = [
    { id: "object1", label: "1", text: "CLASS Robot" },
    { id: "object2", label: "2", text: "    PRIVATE text name: String" },
    {
        id: "object3",
        label: "3",
        text: [
            "    PUBLIC CONSTRUCTOR Robot(inputName : String)",
            "        SET name ← inputName",
        ].join("\n"),
    },
    {
        id: "object4",
        label: "4",
        text: [
            "    PUBLIC METHOD attack() -> String",
            "        RETURN name + \" light zap (5 dmg).\"",
        ].join("\n"),
    },
    { id: "object5", label: "5", text: "CLASS AdvancedRobot EXTENDS Robot" },
    {
        id: "object6",
        label: "6",
        text: [
            "    PUBLIC METHOD attack() -> String",
            "        RETURN \"⚡ SUPER BLAST!\" +",
            "               \" EMP burst\"",
            "               \"  (25 dmg + stun).\"",
        ].join("\n"),
    },
    {
        id: "object7",
        label: "7",
        text: [
            "Robot r1 = NEW Robot(\"R1\")",
            "Robot r2 = NEW AdvancedRobot(\"R2\")",
        ].join("\n"),
    },
];

export const PICKUP_POSITION_TEMPLATES: Array<{ x: number; y: number }> = [
    { x: 120, y: 140 },
    { x: 120, y: 220 },
    { x: 120, y: 300 },
    { x: 120, y: 380 },
    { x: 120, y: 460 },
    { x: 220, y: 180 },
    { x: 220, y: 260 },
    { x: 220, y: 340 },
    { x: 220, y: 420 },
    { x: 220, y: 500 },
];

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
