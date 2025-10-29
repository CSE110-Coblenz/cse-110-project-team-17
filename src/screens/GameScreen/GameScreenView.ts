import Konva from "konva";
import { Player } from "../../entities/player.ts";
import type { View } from "../../types.ts";

/**
 * GameScreenView - Renders the game UI using Konva
 */
export class GameScreenView implements View {
	private screenGroup: Konva.Group;
	private mapGroup: Konva.Group;
	private entityGroup: Konva.Group;
	private playerSprite: Konva.Image | Konva.Circle | null = null;

	constructor() {
		this.screenGroup = new Konva.Group({ visible: false });
		this.mapGroup = new Konva.Group;
		this.entityGroup = new Konva.Group({ visible: false });
	}

	async build(
		mapData: any,
		player: Player,
		loadImage: (src: string) => Promise<HTMLImageElement>
	): Promise<void> {
		const tilesetInfo = mapData.tilesets[0];
		const tileWidth = mapData.tilewidth;
		const tileHeight = mapData.tileheight;
		const tileset = await loadImage("/tiles/colony.png");
		const tilesPerRow = Math.floor(tileset.width / tileWidth);

		/* Build map and add it to the a Konva.Group */
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
			/* add the built map to this.mapLayer */
			this.mapGroup.add(tiledLayerGroup);
		}

		/* add player to entity layer */
		this.entityGroup.add(player.getCurrentImage());

		/* add both groups to this.screenGroup */
		this.screenGroup.add(this.mapGroup);
		//this.screenGroup.add(this.entityGroup);

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
		this.entityGroup.visible(true);
	}

	hide(): void {
		this.screenGroup.visible(false);
		this.mapGroup.visible(false);
		this.entityGroup.visible(false);
	}
}
