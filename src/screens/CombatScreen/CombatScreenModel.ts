import { Combat } from "../../combat.ts";
import { Robot } from "../../entities/robot.ts";
import { Zombie } from "../../entities/zombie.ts";
import { MapModel } from "../MapScreen/MapModel";

/**
 * CombatScreenModel - Manages game state
 */
export class CombatScreenModel extends MapModel{
	private score = 0;
	private combat: Combat;
	private mapData: any;
	private robot?: Robot;
	private zombie?: Zombie;
	private running: boolean = false;
	private attackRequested: boolean = false;
	private attackingImage!: any;
	private idleImage!: any;
	private attackDuration: number = 500; // milliseconds

	constructor(width: number, height: number) {
		super(width, height);
		this.combat = new Combat();
	}

	setMapData(data: any): void {
		this.mapData = data;
	}

	getMapData(): any {
		if (!this.mapData) {
			throw new Error("Map data has not been initialized.");
		}
		return this.mapData;
	}

	setEntities(robot: Robot, zombie: Zombie): void {
		this.robot = robot;
		this.zombie = zombie;
	}

	updateRobotPosition(dx: number, dy: number): void {
		const robot = this.getRobot();
		const previousY = robot.getPosition().y;
		const previousX = robot.getPosition().x;
		robot.moveTo(dx, dy);
		const currentPosition = robot.getPosition();
		if (currentPosition.x !== previousX) {
			robot.faceDirection(currentPosition.x > previousX ? "right" : "left");
		}
		else if (currentPosition.y !== previousY) {
			robot.faceDirection(currentPosition.y > previousY ? "down" : "up");
		}
		console.log("direction: " + robot.getDirection());
	}

	processAttackRequest(attack: boolean): void {
		this.attackRequested = attack;
		if (!this.attackRequested) {
			return;
		}

		const robot = this.getRobot();
		const zombie = this.getZombie();
		console.log("Attack initiated!");
		this.combat.performAttack({ attacker: robot }, { attacked: zombie });
		console.log("Zombie health after attack:", zombie.getHealth());
		this.attackRequested = false;
		const attackingImage = this.getAttackingImage();
		const idleImage = this.getIdleImage();
		robot.loadImage(attackingImage);
		setTimeout(() => {
			robot.loadImage(idleImage);
		}, this.getAttackDuration());
	}

	getRobot(): Robot {
		if (!this.robot) {
			throw new Error("Robot has not been initialized.");
		}
		return this.robot;
	}

	getZombie(): Zombie {
		if (!this.zombie) {
			throw new Error("Zombie has not been initialized.");
		}
		return this.zombie;
	}

	setRunning(isRunning: boolean): void {
		this.running = isRunning;
	}

	isRunning(): boolean {
		return this.running;
	}

	getCombat(): Combat {
		return this.combat;
	}

	setAttackingImage(image: HTMLImageElement): void {
		this.attackingImage = image;
	}

	getAttackingImage(): HTMLImageElement {
		if (!this.attackingImage) {
			throw new Error("Attacking image has not been initialized.");
		}
		return this.attackingImage;
	}

	setIdleImage(image: HTMLImageElement): void {
		this.idleImage = image;
	}

	getIdleImage(): HTMLImageElement {
		if (!this.idleImage) {
			throw new Error("Idle image has not been initialized.");
		}
		return this.idleImage;
	}

	setAttackDuration(duration: number): void {
		this.attackDuration = duration;
	}

	getAttackDuration(): number {
		return this.attackDuration;
	}

	reset(): void {
		this.running = false;
		this.attackRequested = false;
		this.score = 0;
		this.robot = undefined;
		this.zombie = undefined;
		this.mapData = undefined;
		this.attackingImage = undefined;
		this.idleImage = undefined;
	}

	/**
	 * Increment score when lemon is clicked
	 */
	incrementScore(): void {
		this.score++;
	}

	/**
	 * Get current score
	 */
	getScore(): number {
		return this.score;
	}
}