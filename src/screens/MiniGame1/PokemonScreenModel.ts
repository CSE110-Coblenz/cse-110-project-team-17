import { Combat } from "../../combat.ts";
import { Robot } from "../../entities/robot.ts";
import { Zombie } from "../../entities/zombie.ts";
import { MapModel } from "../MapScreen/MapModel.ts";
import { ChoiceDialogBox } from "./ChoiceDialogBox.ts";

/**
 * CombatScreenModel
 *
 * Holds combat-specific state: references to Robot and Zombie entities,
 * map data, running flag for the game loop, and attack animation images.
 * Extends MapModel so it can validate positions against map bounds.
 */
export class PokemonScreenModel extends MapModel{
	private choiceBox: ChoiceDialogBox;
	private mapData: any;
	private running: boolean = false;
	private attackRequested: boolean = false;
	private attackingImage!: any;
	private idleImage!: any;
	private attackDuration: number = 500; // milliseconds

	constructor(width: number, height: number) {
		super(width, height);
		this.choiceBox = new ChoiceDialogBox();
	}

	isRunning(): boolean {
		return this.running;
	}

	setRunning(running: boolean): void {
		this.running = running;
	}
}
