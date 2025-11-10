import Konva from "konva";
import { Robot } from "../../entities/robot.ts";
import { Zombie } from "../../entities/zombie.ts";
import { MapView } from "../MapScreen/MapView.ts";
import { CombatScreenModel } from "./CombatScreenModel.ts";

/**
 * CombatScreenView - Renders the game UI using Konva
 */
export class CombatScreenView extends MapView {
	private screenGroup: Konva.Group;
	private mapGroup: Konva.Group;
	private entityGroup: Konva.Group;
	//private playerSprite: Konva.Image | Konva.Circle | null = null;

	constructor(model: CombatScreenModel) {
		super(model);
		this.screenGroup = new Konva.Group({ visible: false });
		this.mapGroup = new Konva.Group({ visible: false });
		this.entityGroup = new Konva.Group({ visible: false });
	}

	async build(
		robot: Robot,
		zombie: Zombie,
	): Promise<void> {
		/* add robot to entity layer */
		this.entityGroup.add(robot.getCurrentImage());
		this.entityGroup.add(zombie.getCurrentImage());

		/* add both groups to this.screenGroup */
		this.screenGroup.add(this.mapGroup);
		this.screenGroup.add(this.entityGroup);
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
