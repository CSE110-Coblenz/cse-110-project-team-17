import Konva from "konva";
import { Player } from "../../entities/player.ts";
import { GameObject } from "../../entities/object.ts";
import type { View } from "../../types.ts";

/**
 * MiniGame2ScreenView - Renders the minigame 2 screen
 * Objects are carried above the player instead of disappearing
 */
export class MiniGame2ScreenView implements View {
    private screenGroup: Konva.Group;
    private mapGroup: Konva.Group;
    private dropSlotGroup: Konva.Group;
    private entityGroup: Konva.Group;
    private uiGroup: Konva.Group;
    private carriedItemsText: Konva.Text;
    private dropSlotVisuals: Map<string, { rect: Konva.Rect; label: Konva.Text }>;

    constructor() {
        this.screenGroup = new Konva.Group({ visible: false });
        this.mapGroup = new Konva.Group({ visible: false });
        this.dropSlotGroup = new Konva.Group({ visible: false });
        this.entityGroup = new Konva.Group({ visible: false });
        this.uiGroup = new Konva.Group({ visible: false });
        this.dropSlotVisuals = new Map();

        // Create carried items display
        this.carriedItemsText = new Konva.Text({
            x: 10,
            y: 10,
            text: "Carrying: ",
            fontSize: 20,
            fontFamily: "Arial",
            fill: "white",
            stroke: "black",
            strokeWidth: 1,
        });
        this.uiGroup.add(this.carriedItemsText);

        this.screenGroup.add(this.mapGroup);
        this.screenGroup.add(this.dropSlotGroup);
        this.screenGroup.add(this.entityGroup);
        this.screenGroup.add(this.uiGroup);
    }

    async build(
        mapData: any,
        player: Player,
        gameObjects: GameObject[],
        loadImage: (src: string) => Promise<HTMLImageElement>
    ): Promise<void> {
        const tilesetInfo = mapData.tilesets[0];
        const tileWidth = mapData.tilewidth;
        const tileHeight = mapData.tileheight;
        const tileset = await loadImage("/tiles/colony.png");
        const tilesPerRow = Math.floor(tileset.width / tileWidth);

        /* Build map and add it to the mapGroup */
        for(const layer of mapData.layers){
            if(layer.type !== "tilelayer") continue;

            const tiledLayerGroup = new Konva.Group();
            const tiles = layer.data;
            const mapWidth = layer.width;
            const mapHeight = layer.height;

            /* Render the layers of the Tiled map */
            for(let y = 0; y < mapHeight; y++){
                for(let x = 0; x < mapWidth; x++){
                    const tileId = tiles[y * mapWidth + x];
                    if (tileId === 0) continue; // empty tile

                    const gid = tileId - tilesetInfo.firstgid;

                    const tile = new Konva.Image({
                        x: x * tileWidth,
                        y: y * tileHeight,
                        width: tileWidth,
                        height: tileHeight,
                        image: tileset,
                        crop: {
                            x: (gid % tilesPerRow) * tileWidth,
                            y: Math.floor(gid / tilesPerRow) * tileHeight,
                            width: tileWidth,
                            height: tileHeight,
                        },
                    });
                    tiledLayerGroup.add(tile);
                }
            }
            this.mapGroup.add(tiledLayerGroup);
        }

        /* Add game objects to entity layer first so player renders on top */
        for (const obj of gameObjects) {
            const objGroup = obj.getGroup();
            this.entityGroup.add(objGroup);
        }

        /* Add player to entity layer last */
        this.entityGroup.add(player.getCurrentImage());
    }

    renderDropSlots(
        slots: Array<{ id: string; x: number; y: number; width: number; height: number; label: string }>
    ): void {
        this.dropSlotGroup.destroyChildren();
        this.dropSlotVisuals.clear();

        for (const slot of slots) {
            const rect = new Konva.Rect({
                x: slot.x,
                y: slot.y,
                width: slot.width,
                height: slot.height,
                stroke: "#334155",
                strokeWidth: 1,
                cornerRadius: 8,
                opacity: 0.8,
                fill: "#111927",
                listening: false,
            });

            const label = new Konva.Text({
                x: slot.x,
                y: slot.y,
                text: `Slot ${slot.label}`,
                fontSize: 14,
                fontFamily: "Courier New",
                fill: "#5ac8fa",
                opacity: 0.8,
                width: slot.width,
                align: "center",
                listening: false,
            });

            label.y(slot.y + (slot.height - label.height()) / 2);

            this.dropSlotGroup.add(rect);
            this.dropSlotGroup.add(label);
            this.dropSlotVisuals.set(slot.id, { rect, label });
        }
    }

    updateDropSlotState(
        slotId: string,
        options: {
            filled: boolean;
            width?: number;
            height?: number;
            status?: 'empty' | 'correct' | 'incorrect';
        }
    ): void {
        const visual = this.dropSlotVisuals.get(slotId);
        if (!visual) return;

        if (typeof options.width === "number") {
            visual.rect.width(options.width);
            visual.label.width(options.width);
        }
        if (typeof options.height === "number") {
            visual.rect.height(options.height);
            visual.label.y(visual.rect.y() + (visual.rect.height() - visual.label.height()) / 2);
        }

        if (typeof options.width === "number" && typeof options.height === "undefined") {
            visual.label.y(visual.rect.y() + (visual.rect.height() - visual.label.height()) / 2);
        }

        const status = options.status ?? 'empty';
        let strokeColor = "#5ac8fa";
        let fillColor = "rgba(0,0,0,0)";
        let opacity = options.filled ? 0.45 : 0.6;

        if (status === 'correct') {
            strokeColor = "#2dd4bf";
            fillColor = "rgba(45,212,191,0.35)";
            opacity = 0.8;
        } else if (status === 'incorrect') {
            strokeColor = "#fb7185";
            fillColor = "rgba(251,113,133,0.4)";
            opacity = 0.85;
        }

        visual.rect.stroke(strokeColor);
        visual.rect.opacity(opacity);
        visual.rect.shadowColor("rgba(0,0,0,0)");
        visual.rect.shadowBlur(0);
        visual.rect.shadowOpacity(0);

        if (options.filled) {
            visual.rect.fill(fillColor);
            visual.label.visible(false);
        } else {
            visual.rect.fill("rgba(0,0,0,0)");
            visual.label.visible(true);
        }
    }

    updateDropSlotLayout(
        slotId: string,
        layout: { x: number; y: number; width: number; height: number }
    ): void {
        const visual = this.dropSlotVisuals.get(slotId);
        if (!visual) return;

        visual.rect.x(layout.x);
        visual.rect.y(layout.y);
        visual.rect.width(layout.width);
        visual.rect.height(layout.height);
        visual.label.x(layout.x);
        visual.label.width(layout.width);
        visual.label.y(layout.y + (layout.height - visual.label.height()) / 2);
    }

    showConfetti(): void {
        const colors = ["#ff6b6b", "#ffd166", "#4ecdc4", "#5ac8fa", "#f5a623"];
        const originX = 640;
        const originY = 240;
        for (let i = 0; i < 15; i++) {
            const piece = new Konva.Rect({
                x: originX,
                y: originY,
                width: 5,
                height: 8,
                rotation: Math.random() * 360,
                fill: colors[i % colors.length],
                opacity: 0.8,
            });
            this.uiGroup.add(piece);

            const dx = (Math.random() - 0.5) * 400;
            const dy = -Math.random() * 200 - 80;
            const duration = 1 + Math.random() * 0.8;

            const tween = new Konva.Tween({
                node: piece,
                duration,
                x: piece.x() + dx,
                y: piece.y() + dy,
                rotation: piece.rotation() + Math.random() * 360,
                opacity: 0,
                easing: Konva.Easings.EaseOut,
                onFinish: () => piece.destroy(),
            });
            tween.play();
        }
    }

    /**
     * Update carried items display
     */
    updateCarriedItems(items: string[]): void {
        if (items.length === 0) {
            this.carriedItemsText.text("Carrying: Nothing");
        } else {
            this.carriedItemsText.text(`Carrying: ${items[0]}`); // Show only one item
        }
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

    getUIGroup(): Konva.Group {
        return this.uiGroup;
    }

    show(): void {
        this.screenGroup.visible(true);
        this.mapGroup.visible(true);
        this.dropSlotGroup.visible(true);
        this.entityGroup.visible(true);
        this.uiGroup.visible(true);
    }

    hide(): void {
        this.screenGroup.visible(false);
        this.mapGroup.visible(false);
        this.dropSlotGroup.visible(false);
        this.entityGroup.visible(false);
        this.uiGroup.visible(false);
    }
}
