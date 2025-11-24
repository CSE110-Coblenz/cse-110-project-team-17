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
     * Adds Robot and Zombie images to the entity group. Then
	 * adds entityGroup & mapGroup to screenGroup
     */
	async build(
		robot: Robot,
	): Promise<void> {
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