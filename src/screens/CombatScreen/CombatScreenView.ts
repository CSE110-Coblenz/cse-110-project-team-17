import Konva from "konva";
import { Robot } from "../../entities/robot.ts";
import { Zombie } from "../../entities/zombie.ts";
import { MapView } from "../MapScreen/MapView.ts";
import { CombatScreenModel } from "./CombatScreenModel.ts";

/**
 * CombatScreenView
 *
 * Renders the combat screen: builds tiled map layers and maintains an entity
 * group containing Robot and Zombie images. The view exposes groups so the
 * top-level App can add them to the main entity layer.
 */
export class CombatScreenView extends MapView {
	private screenGroup: Konva.Group;
	private mapGroup: Konva.Group;
	private entityGroup: Konva.Group;
	private zombies: Zombie[] = [];
	private RobotHealthText!: Konva.Text;

	constructor(model: CombatScreenModel) {
		super(model);
		this.screenGroup = new Konva.Group({ visible: false });
		this.mapGroup = new Konva.Group({ visible: false });
		this.entityGroup = new Konva.Group({ visible: false });
	}

	/**
     * build
     *
     * Creates Konva.Image tiles for each tile layer in the Tiled map JSON,
     * then adds Robot and Zombie images to the entity group.
     */
	async build(
		mapData: any,
		robot: Robot,
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

			/* Render the layers of the Tiled map.
               Each tile is created as a Konva.Image that uses the tileset
               as the source and `crop` to select the correct tile region. */
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

		/* Add robot and zombie images (their Konva.Image instances)
           to the entity group so they are rendered above the map. */
		this.entityGroup.add(robot.getCurrentImage());

		/* add both groups to this.screenGroup */
		this.screenGroup.add(this.mapGroup);
		this.screenGroup.add(this.entityGroup);
		this.RobotHealthText = new Konva.Text({
			x: 1100,
			y: 10,
			text: "Robot Health: 100",
			fontSize: 20,
			fontFamily: "Arial",
			fill: "Black",
		});
		this.entityGroup.add(this.RobotHealthText);
	}

	/** Optionally: get all zombies for AI logic */
	getZombies(): Zombie[] {
		return this.zombies;
	}

	/** Add a new zombie to the view */
	addZombie(zombie: Zombie): void {
		this.zombies.push(zombie);
		this.entityGroup.add(zombie.getCurrentImage());
	}

	private zombieCounterText!: Konva.Text;

	addZombieCounter(x: number, y: number): void {
		this.zombieCounterText = new Konva.Text({
			x,
			y,
			text: "Score: 0",
			fontSize: 20,
			fontFamily: "Arial",
			fill: "black",
		});
		this.entityGroup.add(this.zombieCounterText);
	}

	updateZombieCounter(count: number): void {
		if (this.zombieCounterText) {
			this.zombieCounterText.text(`Zombies defeated: ${count}`);
		}
	}

	updateRobotHealth(health: number): void {
		if (this.RobotHealthText) {
			this.RobotHealthText.text(`Robot Health: ${health}`);
		}
	}


	/* Expose the groups so the App can mix them into the stage layers. */
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

	destroy() {
		this.screenGroup.destroy();
		this.entityGroup.destroy();
	}

}
