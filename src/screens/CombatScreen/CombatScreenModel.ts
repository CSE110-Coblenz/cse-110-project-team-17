import { Combat } from "../../combat.ts";
import { Robot } from "../../entities/robot.ts";
import { Zombie } from "../../entities/zombie.ts";
import { MapModel } from "../MapScreen/MapModel";
import Konva from "konva";

/**
 * CombatScreenModel
 *
 * Holds combat-specific state: references to Robot and Zombie entities,
 * map data, running flag for the game loop, and attack animation images.
 * Extends MapModel so it can validate positions against map bounds.
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
	private zombies: Zombie[] = [];

	constructor(width: number, height: number) {
		super(width, height);
		this.combat = new Combat();
	}

	 /* Map data setter/getter. view needs map data to render tiles. */
	setMapData(data: any): void {
		this.mapData = data;
	}

	getMapData(): any {
		if (!this.mapData) {
			throw new Error("Map data has not been initialized.");
		}
		return this.mapData;
	}

	 /* Store entity instances so controller and view can access them. */
	setEntities(robot: Robot, zombie: Zombie): void {
		this.robot = robot;
		this.zombie = zombie;
	}

	/**
     * updateRobotPosition
     *
     * Applies delta movement to the robot, updates facing direction,
     * and logs movement for debugging.
     */
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

	/**
	 * updateZombieAI
	 *
	 * Moves all zombies toward the robot gradually.
	 * Called by controller every frame or on a fixed interval.
	 */
	updateZombieAI(): void {
		const robot = this.getRobot();
		const robotImg = robot.getCurrentImage();

		// Move all other zombies
		for (const z of this.zombies) {
			this.moveSingleZombieTowardRobot(z, robotImg);
		}
	}

	/**
	 * moveSingleZombieTowardRobot
	 *
	 * Helper function to move one zombie toward robot smoothly.
	 */
	private moveSingleZombieTowardRobot(zombie: Zombie, robotImg: Konva.Image) {
		const zImg = zombie.getCurrentImage();
		const dx = robotImg.x() - zImg.x();
		const dy = robotImg.y() - zImg.y();
		const dist = Math.sqrt(dx * dx + dy * dy);

		if (dist < 10) return; // close enough, don't move

		const step = 5; // pixels per update
		const newX = zImg.x() + (dx / dist) * step;
		const newY = zImg.y() + (dy / dist) * step;

		zombie.moveTo(newX, newY);

		// update facing direction
		if (Math.abs(dx) > Math.abs(dy)) {
			zombie.faceDirection(dx > 0 ? "right" : "left");
		} else if (dy !== 0) {
			zombie.faceDirection(dy > 0 ? "down" : "up");
		}
	}


	addZombie(z: Zombie) {
    	this.zombies.push(z);
	}
	getZombies(): Zombie[] {
		return this.zombies;
	}

	/**
     * processAttackRequest
     *
     * Triggers combat.performAttack when an attack is requested.
     * Also swaps robot images to show attack animation for a short duration.
     */
	processAttackRequest(attack: boolean, timestamp: number, lastAttackTime: number): number {
		this.attackRequested = attack;
		if (!this.attackRequested) return -1;

		if (timestamp - lastAttackTime < this.getAttackDuration()) {
			console.log("Attack on cooldown.");
			return -1;
		}

		const robot = this.getRobot();
		const attackingZombies: Zombie[] = [];
		console.log('Robot Position: ', robot.getPosition());
		console.log('Total Zombies: ', this.zombies.length);
		// Loop through all zombies to see which ones are in front
		for (let i = 0; i < this.zombies.length; i++) {
			const zombie = this.zombies[i];
			if (zombie.getHealth() <= 0) continue; // skip dead zombies
			console.log('Zombie Position: ', zombie.getPosition());

			this.combat.performAttack({ attacker: robot }, { attacked: zombie });

			if (zombie.getHealth() <= 0) {
				this.incrementZombiesDefeated();
				console.log(`${zombie.getName()} defeated!`);
				attackingZombies.push(zombie); // mark for optional removal
			}
		}

		// Optionally remove defeated zombies from array
		for (const deadZombie of attackingZombies) {
			const idx = this.zombies.indexOf(deadZombie);
			if (idx !== -1) this.zombies.splice(idx, 1);
		}

		this.attackRequested = false;

		// swap robot sprite to attacking image then back to idle
		const attackingImage = this.getAttackingImage();
		const idleImage = this.getIdleImage();
		robot.loadImage(attackingImage);
		setTimeout(() => {
			robot.loadImage(idleImage);
		}, this.getAttackDuration());

		return 0;
	}


	// inside CombatScreenModel
	private zombiesDefeated: number = 0;

	incrementZombiesDefeated(): void {
		this.zombiesDefeated++;
	}

	getZombiesDefeated(): number {
		return this.zombiesDefeated;
	}


	 /* Safe getters for robot/zombie with helpful errors. */
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

	/* Control whether combat loop should run. */
	setRunning(isRunning: boolean): void {
		this.running = isRunning;
	}

	isRunning(): boolean {
		return this.running;
	}

	getCombat(): Combat {
		return this.combat;
	}

	/* Attack / idle image setters/getters used by controller to animate sprite. */
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

	/* Reset model to initial state (used when leaving/restarting combat). */
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
     * incrementScore / getScore
     *
     * Placeholder scoring helpers (kept for compatibility with other screens).
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
