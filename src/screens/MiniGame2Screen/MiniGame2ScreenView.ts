import Konva from "konva";
import { Player } from "../../entities/player.ts";
import { GameObject } from "../../entities/object.ts";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";

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
    private timerText!: Konva.Text;
    private failureText!: Konva.Text;
    private dropSlotVisuals: Map<string, { rect: Konva.Rect; label: Konva.Text }>;
    private introGroup: Konva.Group;
    private onIntroClick?: () => void;

    constructor() {
        this.screenGroup = new Konva.Group({ visible: false });
        this.mapGroup = new Konva.Group({ visible: false });
        this.dropSlotGroup = new Konva.Group({ visible: false });
        this.entityGroup = new Konva.Group({ visible: false });
        this.uiGroup = new Konva.Group({ visible: false });
        this.dropSlotVisuals = new Map();
        this.introGroup = new Konva.Group({ visible: false });

        this.buildUi();

        this.screenGroup.add(this.mapGroup);
        this.screenGroup.add(this.dropSlotGroup);
        this.screenGroup.add(this.entityGroup);
        this.screenGroup.add(this.uiGroup);
        this.buildIntro();
        this.screenGroup.add(this.introGroup);
        this.introGroup.moveToTop();
    }

    private buildUi(): void {
        // Timer display
        this.timerText = new Konva.Text({
            x: 10,
            y: 10,
            text: "",
            fontSize: 20,
            fontFamily: "Arial",
            fill: "white",
            stroke: "black",
            strokeWidth: 1,
        });
        this.uiGroup.add(this.timerText);

        // Failure popup
        this.failureText = new Konva.Text({
            x: STAGE_WIDTH / 2,
            y: STAGE_HEIGHT / 2,
            text: "",
            fontSize: 28,
            fontFamily: "Arial",
            fill: "red",
            stroke: "black",
            strokeWidth: 2,
            visible: false,
        });
        this.failureText.offsetX(this.failureText.width() / 2);
        this.failureText.offsetY(this.failureText.height() / 2);
        this.uiGroup.add(this.failureText);
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

    updateTimer(secondsLeft: number): void {
        this.timerText.text(`Time: ${secondsLeft}s`);
    }

    showFailureMessage(msg: string): void {
        this.failureText.text(msg);
        this.failureText.offsetX(this.failureText.width() / 2);
        this.failureText.offsetY(this.failureText.height() / 2);
        this.failureText.visible(true);
        this.uiGroup.draw();
    }

    hideFailureMessage(): void {
        this.failureText.visible(false);
        this.uiGroup.draw();
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

    private buildIntro(): void {
        const bg = new Konva.Rect({
            x: 0,
            y: 0,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            fill: "rgba(0,0,0,0.75)",
        });

        const title = new Konva.Text({
            x: STAGE_WIDTH / 2,
            y: 160,
            text: "MiniGame 2: Rebuild the Code",
            fontSize: 38,
            fontFamily: "Arial",
            fill: "white",
            fontStyle: "bold",
            align: "center",
        });
        title.offsetX(title.width() / 2);

        const instructions = new Konva.Text({
            x: STAGE_WIDTH / 2,
            y: 260,
            text: "Use W/A/S/D to move.\nPress P to pick up the highlighted code block.\nCarry one block at a time to the correct slot on the right.\nA block can only fit a slot when the block itself is visually in contact with the slot.\nMatch all snippets to complete the robot code.",
            fontSize: 22,
            fontFamily: "Arial",
            fill: "#e2e8f0",
            align: "center",
            lineHeight: 1.4,
        });
        instructions.offsetX(instructions.width() / 2);

        const prompt = new Konva.Text({
            x: STAGE_WIDTH / 2,
            y: 480,
            text: "Click to start",
            fontSize: 24,
            fontFamily: "Arial",
            fill: "#cbd5e1",
        });
        prompt.offsetX(prompt.width() / 2);

        this.introGroup.add(bg);
        this.introGroup.add(title);
        this.introGroup.add(instructions);
        this.introGroup.add(prompt);
        this.introGroup.on("click", () => {
            if (this.onIntroClick) this.onIntroClick();
        });
    }

    showIntro(): void {
        this.introGroup.visible(true);
    }

    hideIntro(): void {
        this.introGroup.visible(false);
    }

    setIntroHandler(fn: () => void): void {
        this.onIntroClick = fn;
    }
}
