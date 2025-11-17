import { Combat } from "../../combat.ts";
import { Player } from "../../entities/player.ts";
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
	private player : Robot;
	private boss: Zombie;

	constructor(width: number, height: number) {
		super(width, height);
		this.choiceBox = new ChoiceDialogBox();
		const pimg = new Image();
		pimg.src = '/lemon.png';
		this.player = new Robot("player", 100, 50, width / 2, height / 2, pimg);
		const bimg = new Image();
		bimg.src = '/boss.jpg';
		this.boss = new Zombie("boss", 200, 75, width / 2 + 100, height / 2, bimg);
	}

	getPlayer(): Robot {
		return this.player;
	}

	getBoss(): Zombie {
		return this.boss;
	}

	isRunning(): boolean {
		return this.running;
	}

	setRunning(running: boolean): void {
		this.running = running;
	}
}
