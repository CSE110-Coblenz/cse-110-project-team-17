import Konva from "konva";
import { Player } from "../../entities/player.ts";
import { GameObject } from "../../entities/object.ts";
import type { View } from "../../types.ts";

/**
 * ExplorationScreenView - Renders the exploration/object collection screen
 */
export class ExplorationScreenView implements View {
    private screenGroup: Konva.Group;
    private mapGroup: Konva.Group;
    private entityGroup: Konva.Group;
    private playerGroup: Konva.Group;
    private uiGroup: Konva.Group;
    private inventoryText: Konva.Text;
    private collectionMessageText: Konva.Text;
    private messageTimer: number | null = null;

    constructor() {
        this.screenGroup = new Konva.Group({ visible: false });
        this.mapGroup = new Konva.Group({ visible: false });
        this.entityGroup = new Konva.Group({ visible: false });
        this.uiGroup = new Konva.Group({ visible: false });

        this.playerGroup = new Konva.Group({ visible: false });

        // Create inventory display
        this.inventoryText = new Konva.Text({
            x: 10,
            y: 10,
            text: "Inventory: ",
            fontSize: 20,
            fontFamily: "Arial",
            fill: "white",
            stroke: "black",
            strokeWidth: 1,
            visible: true,
        });
        this.uiGroup.add(this.inventoryText);

        // Create collection message (initially hidden)
        this.collectionMessageText = new Konva.Text({
            x: 400,
            y: 100,
            text: "",
            fontSize: 24,
            fontFamily: "Arial",
            fill: "yellow",
            stroke: "black",
            strokeWidth: 2,
            visible: false,
        });
        this.uiGroup.add(this.collectionMessageText);

        this.screenGroup.add(this.uiGroup);
    }

    /* 
    *  Since Map is already built in the ScreenController:
    *   --> add player to its own layer
    *   --> add game objects to their own layer
    *   --> add built map && game objects to the screenGroup
    * 
    *   NOTE: playerGroup is NOT a part of the screenGroup
    */
    async build(
        player: Player,
        gameObjects: GameObject[]
    ): Promise<void> {
        this.playerGroup.add(player.getCurrentImage());

        /* Add game objects to entity layer - use the group, not just the image */
        for (const obj of gameObjects) {
            const objGroup = obj.getGroup();
            this.entityGroup.add(objGroup);
        }

        /* Add groups to screenGroup */
        this.screenGroup.add(this.mapGroup);
        this.screenGroup.add(this.entityGroup);
    }

    /**
     * Update inventory display
     */
    updateInventory(items: string[]): void {
        this.inventoryText.text(`Inventory: ${items.join(", ")}`);
    }

    /**
     * Show a temporary collection message
     */
    showCollectionMessage(message: string): void {
        // Clear any existing timer
        if(this.messageTimer !== null){
            clearTimeout(this.messageTimer);
        }

        // Update and show the message
        this.collectionMessageText.text(message);
        this.collectionMessageText.visible(true);

        // Center the message
        this.collectionMessageText.x(640 - this.collectionMessageText.width() / 2);

        // Hide the message after 2 seconds
        this.messageTimer = window.setTimeout(() => {
            this.collectionMessageText.visible(false);
            this.messageTimer = null;
        }, 2000);
    }

    getGroup(): Konva.Group {
        return this.screenGroup;
    }

    getMapGroup(): Konva.Group {
        return this.mapGroup;
    }

    getEntityGroup(): Konva.Group {
        return this.entityGroup;
    }

    getPlayerGroup(): Konva.Group {
        return this.playerGroup;
    }

    getUIGroup(): Konva.Group {
        return this.uiGroup;
    }

    show(): void {
        this.screenGroup.visible(true);
        this.mapGroup.visible(true);
        this.entityGroup.visible(true);
        this.uiGroup.visible(true);
        this.playerGroup.visible(true);
    }

    hide(): void {
        this.screenGroup.visible(false);
        this.mapGroup.visible(false);
        this.entityGroup.visible(false);
        this.uiGroup.visible(false);
        this.playerGroup.visible(false);
    }
}