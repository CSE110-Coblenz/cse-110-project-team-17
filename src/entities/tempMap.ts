import Konva from "konva";
import type { Maps } from "../types.ts";

/* The Map class makes JSON parsing and map building from a tileset         */
/* completely transparent from the ScreenView classes. Now, individual      */
/* maps can be built in the Controller. The purpose of this is to separate  */
/* the Map layer, so it isn't accidentally drawn repeatedly in the gameLoop */
/* it also makes the ScreenView class more readable/scalable.				*/
export class Map implements Maps {
	private tileSize: number;
    private mapData: any;
	private loadImage: (src: string) => Promise<HTMLImageElement>;
    private collisionData: number[];
    private width: number;
    private height: number;

    private tilesets: {
        firstgid: number;
        image: HTMLImageElement;
        tilesPerRow: number;
    }[] = [];

	constructor(mapData: any, loadImage: (src: string) => Promise<HTMLImageElement>) {
        this.mapData = mapData;
        this.tileSize = mapData.tileHeight;
		this.loadImage = loadImage;
		this.height = mapData.height;
		this.width = mapData.width;

		const objectLayer = mapData.layers[1];
		this.collisionData = objectLayer.data;
	}

	getTileSize(): number {
		return this.tileSize;
	}

	getMapData(): any {
		return this.mapData;
	}

	getWidth(){
		return this.width;
	}

	getHeight(){
		return this.height;
	}

async loadTilesets() {
    const baseTilesDir = "/tiles/"; // adjust to match repo/public/tiles/

    for (const ts of this.mapData.tilesets) {
        // Convert ts.source (e.g., "Dirt_Map.tsx") → "Dirt_Map.png"
        const pngName = ts.source.replace(".tsx", ".png");
        const imagePath = baseTilesDir + pngName;

        // Load PNG
        const image = await this.loadImage(imagePath);

        // Tiles are always 16x16 so width gives us tilesPerRow
        const tilesPerRow = Math.floor(image.width / 16);

        this.tilesets.push({
            firstgid: ts.firstgid,
            image,
            tilesPerRow
        });
    }

    // Sort in case firstgid is not ordered in JSON
    //this.tilesets.sort((a, b) => a.firstgid - b.firstgid);
}

    private getTilesetForGid(gid: number) {
        let found = null;
        for (const ts of this.tilesets) {
            if (gid >= ts.firstgid) {
                found = ts;
            } else break;
        }
        return found;
    }

async buildMap(): Promise<Konva.Group> {
    const mapGroup = new Konva.Group();

    if (!this.tilesets.length) {
        console.warn("Tilesets not loaded — call loadTilesets() first");
        return mapGroup;
    }

    const tileWidth = this.tileSize;
    const tileHeight = this.tileSize;

    for (const layer of this.mapData.layers) {
        if (layer.type !== "tilelayer") continue;

        const layerGroup = new Konva.Group({ name: layer.name });

        const tiles = layer.data;
        const mapWidth = layer.width;
        const mapHeight = layer.height;

        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                const tileId = tiles[y * mapWidth + x];
                if (tileId === 0) continue;

                // Find the correct tileset for this GID
                const ts = this.getTilesetForGid(tileId);
                if (!ts) continue;

                const localId = tileId - ts.firstgid;
                const cropX = (localId % ts.tilesPerRow) * tileWidth;
                const cropY = Math.floor(localId / ts.tilesPerRow) * tileHeight;

                const tile = new Konva.Image({
                    x: x * tileWidth,
                    y: y * tileHeight,
                    width: tileWidth,
                    height: tileHeight,
                    image: ts.image,
                    crop: {
                        x: cropX,
                        y: cropY,
                        width: tileWidth,
                        height: tileHeight
                    }
                });

                layerGroup.add(tile);
            }
        }

        mapGroup.add(layerGroup);
    }

    return mapGroup;
}

	getTileAtPixel(x: number, y: number) {
		const tileX = Math.floor(x / this.tileSize);
		const tileY = Math.floor(y / this.tileSize);

		return { tileX, tileY };
	}

	isBlocked(tileX: number, tileY: number): boolean {
		const index = tileY * this.width + tileX;
		return this.collisionData[index] !== 0;
	}

	canMoveToPixel(x: number, y: number): boolean {
		const { tileX, tileY } = this.getTileAtPixel(x, y);
		return !this.isBlocked(tileX, tileY);
	}

	canMoveToArea(x: number, y: number, w: number, h: number): boolean {
		return (
			this.canMoveToPixel(x, y) &&
			this.canMoveToPixel(x + w, y) &&
			this.canMoveToPixel(x, y + h) &&
			this.canMoveToPixel(x + w, y + h)
		);
	}
}
