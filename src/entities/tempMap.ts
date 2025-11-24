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
        tileWidth: number,
        tileHeight: number,
        name: string
    }[] = [];

	constructor(tileSize: number, mapData: any, loadImage: (src: string) => Promise<HTMLImageElement>) {
        this.mapData = mapData;
        this.tileSize = tileSize;
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

    /* Store each tilesheet's data so it can be used to render map */
    /*  --> data stored in this.tilesets[j]                        */
    async loadTilesets() {
        this.tilesets = [];

        /* iterate through tilesets given in map's json file */
        for(const ts of this.mapData.tilesets){
            const response = await fetch(ts.source);
            const tsJson = await response.json();

            /* use the path hardcoded in the json to load image from /public/tiles/* */
            const image = await this.loadImage(tsJson.source);

            /* store tileset data in this.tilesets struct */
            this.tilesets.push({
                firstgid: ts.firstgid,
                image,
                tileWidth: tsJson.tileWidth,
                tileHeight: tsJson.tileHeight,
                tilesPerRow: tsJson.columns,
                name: tsJson.name
            });
        }
    }

    /* identify which spriteSheet to use given tileID */
    private getTilesetForID(tileID: number) {
        let found = null;
        for (const ts of this.tilesets) {
            if (tileID >= ts.firstgid) {
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

        for (const layer of this.mapData.layers) {
            if (layer.type !== "tilelayer") continue;

            const layerGroup = new Konva.Group({ name: layer.name });

            /* 1D array containing map's tile data */
            const tiles = layer.data;

            /* map's width in tiles */
            const mapWidth = layer.width;

            /* map's height in tiles */
            const mapHeight = layer.height;

            /* iterate through every tile using x,y coordinates */
            for(let y = 0; y < mapHeight; y++){
                for(let x = 0; x < mapWidth; x++){
                    /* get tile's index in the 1D array using x,y coordinates */
                    const tileID = tiles[y * mapWidth + x];
                    if (tileID === 0) continue;

                    /* obtain tilesets struct for the tileSet used for tile (x,y) */
                    const ts = this.getTilesetForID(tileID);
                    if(!ts) continue;


                    /* retrieve tile data from the tilesets struct */
                    const tileWidth = ts.tileWidth;
                    const tileHeight = ts.tileHeight;

                    /* obtain the localID, representing which tile in the tilesheet we are rendering */
                    const localID = tileID - ts.firstgid;

                    /* crop the tilesheet (ts.image) to only show the tile: localID */
                    const cropX = (localID % ts.tilesPerRow) * tileWidth;
                    const cropY = Math.floor(localID / ts.tilesPerRow) * tileHeight;

                    /* represent tile as Konva Image, at the tile coordinates (x,y) */
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
                    /* add all tiles from layer[i] to the layerGroup */
                    layerGroup.add(tile);
                }
            }
            /* for each layer, add all tiles to the map group */
            mapGroup.add(layerGroup);
        }

        /* mapGroup now shows the entire map as a single Konva Group*/
        return mapGroup;
    }

    /* given pixel coordinates, compute the corresponding tile */
	getTileAtPixel(x: number, y: number) {
		const tileX = Math.floor(x / this.tileSize);
		const tileY = Math.floor(y / this.tileSize);

		return { tileX, tileY };
	}

    /* verify that the tile has no obstacle on it */
	isBlocked(tileX: number, tileY: number): boolean {
		const index = tileY * this.width + tileX;
		return this.collisionData[index] !== 0;
	}

    /* returns true if the player/robot is allowed to move to the pixel coordinates given */
	canMoveToPixel(x: number, y: number): boolean {
		const { tileX, tileY } = this.getTileAtPixel(x, y);
		return !this.isBlocked(tileX, tileY);
	}

    /*canMoveToArea(x: number, y: number, w: number, h: number): boolean {
        const tl = this.canMoveToPixel(x, y);
        const tr = this.canMoveToPixel(x + w, y);
        const bl = this.canMoveToPixel(x, y + h);
        const br = this.canMoveToPixel(x + w, y + h);

        const ok = tl && tr && bl && br;

        return ok;
    }*/

    canMoveToArea(x: number, y: number, w: number, h: number): boolean {
        const tileSize = this.tileSize;

        const leftTile   = Math.floor(x / tileSize);
        const rightTile  = Math.floor((x + w) / tileSize);
        const topTile    = Math.floor(y / tileSize);
        const bottomTile = Math.floor((y + h) / tileSize);

        for (let ty = topTile; ty <= bottomTile; ty++) {
            for (let tx = leftTile; tx <= rightTile; tx++) {
                if (this.isBlocked(tx, ty)) {
                    return false;
                }
            }
        }
        return true;
    }
}
