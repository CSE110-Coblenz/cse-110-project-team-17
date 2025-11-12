import Konva from "konva";
import { Player } from "../../entities/player.ts";
import { GameObject } from "../../entities/object.ts";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";

/**
 * ExplorationScreenView - Renders the exploration/object collection screen
 */
export class ExplorationScreenView implements View {
    private screenGroup: Konva.Group;
    private mapGroup: Konva.Group;
    private entityGroup: Konva.Group;
    private uiGroup: Konva.Group;
    private inventoryText: Konva.Text;
    private collectionMessageText: Konva.Text;
    private messageTimer: number | null = null;

    constructor(onBookClick: () => void) {
        this.screenGroup = new Konva.Group({ visible: false });
        this.mapGroup = new Konva.Group({ visible: false });
        this.entityGroup = new Konva.Group({ visible: false });
        this.uiGroup = new Konva.Group({ visible: false });

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

        // Create education book button in bottom left
        const bookButtonGroup = new Konva.Group();
        const bookButton = new Konva.Circle({
            x: 80,
			y: STAGE_HEIGHT - 80,   
			radius: 50,
			fill: "#edd737ff",
            stroke: "black",
            strokeWidth: 3
		});
        const bookLabel = new Konva.Text({
			x: bookButton.x(),
			y: bookButton.y(),
			text: "Book",
			fontSize: 24,
			fontFamily: "Arial",
			fill: "black",
		});
        bookLabel.offsetX(bookLabel.width() / 2);
        bookLabel.offsetY(bookLabel.height() / 2);
        bookButtonGroup.add(bookButton);
        bookButtonGroup.add(bookLabel);
        bookButtonGroup.on("click", onBookClick);
		bookButtonGroup.on('mouseover', function (e) {
			let x = e.target.getStage()
			if (x != null) {
				x.container().style.cursor = 'pointer';
			}
		});
		bookButtonGroup.on('mouseout', function (e) {
			let x = e.target.getStage()
			if (x != null) {
				x.container().style.cursor = 'default';
			}
		});
        this.entityGroup.add(bookButtonGroup);

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

        /* Add player to entity layer */
        this.entityGroup.add(player.getCurrentImage());

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
        if (this.messageTimer !== null) {
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

    getUIGroup(): Konva.Group {
        return this.uiGroup;
    }

    show(): void {
        this.screenGroup.visible(true);
        this.mapGroup.visible(true);
        this.entityGroup.visible(true);
        this.uiGroup.visible(true);
    }

    hide(): void {
        this.screenGroup.visible(false);
        this.mapGroup.visible(false);
        this.entityGroup.visible(false);
        this.uiGroup.visible(false);
    }
}