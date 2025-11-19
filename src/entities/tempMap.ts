import Konva from "konva";
import type { Maps } from "../types.ts";

/* The Map class makes JSON parsing and map building from a tileset         */
/* completely transparent from the ScreenView classes. Now, individual      */
/* maps can be built in the Controller. The purpose of this is to separate  */
/* the Map layer, so it isn't accidentally drawn repeatedly in the gameLoop */
/* it also makes the ScreenView class more readable/scalable.				*/
export class Map implements Maps {
	private tilePath: string;
	private mapSize: number;
    private mapData: any;
	private loadImage: (src: string) => Promise<HTMLImageElement>;
    private collisionData: number[];     // <--- ADD THIS
    private width: number;
    private height: number;

	constructor(tilePath: string, size: number, mapData: any, loadImage: (src: string) => Promise<HTMLImageElement>) {
		this.tilePath = tilePath;
		this.mapSize = size;
        this.mapData = mapData;
		this.loadImage = loadImage;
		this.height = mapData.height;
		this.width = mapData.width;

		const objectLayer = mapData.layers[1];
		this.collisionData = objectLayer.data;
	}

	getTilesetPath(): string {
		return this.tilePath;
	}

	getSize(): number {
		return this.mapSize;
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

	/**
	 * Builds a Konva.Group representing the map layers and tiles
	 */
	async buildMap(): Promise<Konva.Group> {
		const mapGroup = new Konva.Group();

		if(!this.mapData?.tilesets?.length){
			console.warn("No tilesets found in map data");
			return mapGroup;
		}

		const tilesetInfo = this.mapData.tilesets[0];
		const tileWidth = this.mapData.tilewidth;
		const tileHeight = this.mapData.tileheight;

		const tileset = await this.loadImage(this.tilePath);
		const tilesPerRow = Math.floor(tileset.width / tileWidth);

		for(const layer of this.mapData.layers){
			if(layer.type !== "tilelayer") continue;

			const layerGroup = new Konva.Group({ name: layer.name });
			const tiles = layer.data;
			const mapWidth = layer.width;
			const mapHeight = layer.height;

			for (let y = 0; y < mapHeight; y++) {
				for (let x = 0; x < mapWidth; x++) {
					const tileId = tiles[y * mapWidth + x];
					if (tileId === 0) continue;

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
					layerGroup.add(tile);
				}
			}

			mapGroup.add(layerGroup);
		}

		return mapGroup;
	}

	getTileAtPixel(x: number, y: number) {
		const tileX = Math.floor(x / this.mapSize);
		const tileY = Math.floor(y / this.mapSize);

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
