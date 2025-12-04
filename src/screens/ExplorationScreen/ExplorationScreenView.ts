import Konva from "konva";
import { Player } from "../../entities/player.ts";
import { GameObject } from "../../entities/object.ts";
import type { View } from "../../types.ts";
import type { Directions } from "../../entities/base.ts";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../../constants.ts";

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
    private bookButtonGroup: Konva.Group;
    private bookIndicator?: Konva.Group;
    private worktableIndicator?: Konva.Group;
    private edgeIndicatorGroup: Konva.Group;
    private edgeBadges: Record<"top" | "right" | "bottom", Konva.Group | null> = {
        top: null,
        right: null,
        bottom: null,
    };
    private isShowingBoundary: boolean = false;
    private robotPartBoundaryBox?: Konva.Rect;
    private dict!: Record<Directions, Konva.Group>;

    constructor(onBookClick: () => void) {
        this.screenGroup = new Konva.Group({ visible: false });
        this.mapGroup = new Konva.Group({ visible: false });
        this.entityGroup = new Konva.Group({ visible: false });
        this.uiGroup = new Konva.Group({ visible: false });

        this.playerGroup = new Konva.Group({ visible: false });
        this.edgeIndicatorGroup = new Konva.Group();

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

         // Create education book button in top right using image icon
         this.bookButtonGroup = new Konva.Group();
         Konva.Image.fromURL("/objects/book.png", (img) => {
            const iconSize = 60;
            const margin = 20;
            img.width(iconSize);
            img.height(iconSize);
            // Position top-right based on stage width
            const targetX = STAGE_WIDTH - margin - iconSize;
            img.position({ x: targetX, y: margin });

            this.bookButtonGroup.add(img);

            // Notification badge (hidden by default)
            const badge = new Konva.Group({ visible: false, listening: false });
            const badgeCircle = new Konva.Circle({
                radius: 12,
                fill: "red",
                stroke: "black",
                strokeWidth: 1,
            });
            const badgeText = new Konva.Text({
                text: "!",
                fontSize: 18,
                fontFamily: "Arial",
                fill: "white",
            });
            badgeText.offsetX(badgeText.width() / 2);
            badgeText.offsetY(badgeText.height() / 2);
            badge.add(badgeCircle);
            badge.add(badgeText);
            badge.position({
                x: img.x() + iconSize - 6,
                y: img.y() - 6,
            });
            this.bookIndicator = badge;
            this.bookButtonGroup.add(badge);

            this.bookButtonGroup.on("click", onBookClick);
            this.bookButtonGroup.on('mouseover', function (e) {
              const stage = e.target.getStage();
              if (stage) stage.container().style.cursor = 'pointer';
            });
            this.bookButtonGroup.on('mouseout', function (e) {
              const stage = e.target.getStage();
              if (stage) stage.container().style.cursor = 'default';
            });
            this.entityGroup.add(this.bookButtonGroup);
         });

         this.screenGroup.add(this.uiGroup);
    }

    /* 
    *  Since Map is already built in the ScreenController:
    *   --> add all player sprite groups to same layer
    *   --> add game objects to their own layer
    *   --> add built map && game objects to the screenGroup
    * 
    *   NOTE: playerGroup is NOT a part of the screenGroup
    */
    async build(
        player: Player,
        gameObjects: GameObject[]
    ): Promise<void> {
        this.dict = player.getAllSprites();
        this.dict['right'].visible(true);

        this.playerGroup.add(this.dict['up']);
        this.playerGroup.add(this.dict['down']);
        this.playerGroup.add(this.dict['left']);
        this.playerGroup.add(this.dict['right']);

        /* Add game objects to entity layer - use the group, not just the image */
        for (const obj of gameObjects) {
            const objGroup = obj.getGroup();
            this.entityGroup.add(objGroup);
        }

        this.buildEdgeIndicators();
        this.entityGroup.add(this.edgeIndicatorGroup);

        /* Add groups to screenGroup */
        this.screenGroup.add(this.mapGroup);
        this.screenGroup.add(this.entityGroup);
        this.hideEdgeIndicators();
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

    hideEntities(): void {
        this.entityGroup.visible(false);
        this.playerGroup.visible(false);
        this.screenGroup.draw();
    }

    showEntities(): void {
        this.entityGroup.visible(true);
        this.playerGroup.visible(true);
        this.screenGroup.draw();
    }

    showBookNotification(): void {
        if (this.bookIndicator) {
            this.bookIndicator.visible(true);
            this.entityGroup.draw();
        }
    }

    hideBookNotification(): void {
        if (this.bookIndicator) {
            this.bookIndicator.visible(false);
            this.entityGroup.draw();
        }
    }

    showWorktableNotification(pos: { x: number; y: number }): void {
        if (!this.worktableIndicator) {
            const badge = new Konva.Group({ listening: false });
            const badgeCircle = new Konva.Circle({
                radius: 10,
                fill: "red",
                stroke: "black",
                strokeWidth: 1,
            });
            const badgeText = new Konva.Text({
                text: "!",
                fontSize: 14,
                fontFamily: "Arial",
                fill: "white",
            });
            badgeText.offsetX(badgeText.width() / 2);
            badgeText.offsetY(badgeText.height() / 2);
            badge.add(badgeCircle);
            badge.add(badgeText);
            this.worktableIndicator = badge;
            this.entityGroup.add(badge);
        }
        const offset = { x: 10, y: -10 };
        this.worktableIndicator.position({ x: pos.x + offset.x, y: pos.y + offset.y });
        this.worktableIndicator.visible(true);
        this.entityGroup.draw();
    }

    hideWorktableNotification(): void {
        if (this.worktableIndicator) {
            this.worktableIndicator.visible(false);
            this.entityGroup.draw();
        }
    }

    private buildEdgeIndicators(): void {
        const addBadge = (x: number, y: number, key: "top" | "right" | "bottom") => {
            const group = new Konva.Group({ listening: false });
            const circle = new Konva.Circle({
                radius: 12,
                fill: "red",
                stroke: "black",
                strokeWidth: 1.5,
            });
            const text = new Konva.Text({
                text: "!",
                fontSize: 18,
                fontFamily: "Arial",
                fill: "white",
            });
            text.offsetX(text.width() / 2);
            text.offsetY(text.height() / 2);
            group.add(circle);
            group.add(text);
            group.position({ x, y });
            this.edgeIndicatorGroup.add(group);
            this.edgeBadges[key] = group;
        };

        const margin = 24;
        // Top (Pokemon), Right (Combat), Bottom (MiniGame2)
        addBadge(STAGE_WIDTH / 2 + 255, margin, "top"); // near top center, nudged further right
        addBadge(STAGE_WIDTH - margin, STAGE_HEIGHT / 2 + 145, "right"); // right edge, lowered
        addBadge(STAGE_WIDTH / 2 + 35, STAGE_HEIGHT - margin, "bottom"); // bottom center, nudged right
    }

    showEdgeIndicators(): void {
        this.edgeIndicatorGroup.visible(true);
        this.entityGroup.draw();
    }

    hideEdgeIndicators(): void {
        this.edgeIndicatorGroup.visible(false);
        this.entityGroup.draw();
    }

    hideEdgeIndicator(edge: "top" | "right" | "bottom"): void {
        const badge = this.edgeBadges[edge];
        if (badge) {
            badge.visible(false);
            this.entityGroup.draw();
        }
    }

    showRobotPartBoundary(): void {
        this.entityGroup.add(this.robotPartBoundaryBox!);
        this.entityGroup.draw();
    }

    removeRobotPartBoundary(): void {
        this.robotPartBoundaryBox?.destroy();
        this.entityGroup.draw();
    }

    showingPartBoundary(): boolean {
        return this.isShowingBoundary;
    }

    setShowingPartBoundary(value: boolean): void {
        this.isShowingBoundary = value;
    }

    getRobotPartBoundaryBox(): Konva.Rect | undefined {
        return this.robotPartBoundaryBox;
    }
    setRobotPartBoundaryBox(box: Konva.Rect): void {
        this.robotPartBoundaryBox = box;
    }

    updateSprite(player: Player): void {
        const direction = player.getDirection();

        switch (direction) {
            case 'up':
                this.dict['up'].visible(true);
                this.dict['down'].visible(false);
                this.dict['left'].visible(false);
                this.dict['right'].visible(false);
                break;
            case 'down':
                this.dict['up'].visible(false);
                this.dict['down'].visible(true);
                this.dict['left'].visible(false);
                this.dict['right'].visible(false);
                break;
            case 'left':
                this.dict['up'].visible(false);
                this.dict['down'].visible(false);
                this.dict['left'].visible(true);
                this.dict['right'].visible(false);
                break;
            case 'right':
                this.dict['up'].visible(false);
                this.dict['down'].visible(false);
                this.dict['left'].visible(false);
                this.dict['right'].visible(true);
                break;
        }
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
