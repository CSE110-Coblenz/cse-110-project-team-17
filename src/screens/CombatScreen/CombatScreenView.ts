import Konva from "konva";
import { Robot } from "../../entities/robot.ts";
import { Zombie } from "../../entities/zombie.ts";
import { MapView } from "../MapScreen/MapView.ts";
import { CombatScreenModel } from "./CombatScreenModel.ts";
import { STAGE_WIDTH } from "../../constants.ts";
import type { Directions } from "../../entities/base.ts";

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
	private attackGroup: Konva.Group;
	private zombies: Zombie[] = [];
	private RobotHealthText!: Konva.Text;
	private introGroup: Konva.Group;
	private dict!: Record<Directions, Konva.Group>;
	private onIntroClick?: () => void;

	constructor(model: CombatScreenModel) {
		super(model);
		this.screenGroup = new Konva.Group({ visible: false });
		this.mapGroup = new Konva.Group({ visible: false });
		this.entityGroup = new Konva.Group({ visible: false });
		this.introGroup = new Konva.Group({ visible: false });
		this.attackGroup = new Konva.Group({ visible: false });
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
		//this.entityGroup.add(robot.getCurrentImage());
        this.dict = robot.getAllSprites();
        this.dict['right'].visible(true);

        this.entityGroup.add(this.dict['up']);
        this.entityGroup.add(this.dict['down']);
        this.entityGroup.add(this.dict['left']);
        this.entityGroup.add(this.dict['right']);
		this.entityGroup.add(this.attackGroup);


		/* add both groups to this.screenGroup */
		this.screenGroup.add(this.mapGroup);
		this.screenGroup.add(this.entityGroup);
		this.buildIntro();
		this.screenGroup.add(this.introGroup);
		this.introGroup.moveToTop();
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

	addAttack(attack: HTMLImageElement): void {
		let tempImg = new Konva.Image({
			x: 0,
			y: 0,
			width: 16,
			height: 16,
			image: attack
		});
		this.attackGroup.add(tempImg);
	}

	showAttackSprite(): void {
		this.dict['up'].visible(false);
		this.dict['down'].visible(false);
		this.dict['left'].visible(false);
		this.dict['right'].visible(false);
		this.attackGroup.visible(true);
	}

	hideAttackSprite(): void {
		this.attackGroup.visible(false);
	}

	getAttackGroup(): Konva.Group {
		return this.attackGroup;
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

	private buildIntro(): void {
		const bg = new Konva.Rect({
			x: 0,
			y: 0,
			width: this.screenGroup.width() || 1280,
			height: this.screenGroup.height() || 720,
			fill: "rgba(0,0,0,0.75)",
		});

		const title = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 160,
			text: "Zombie Combat",
			fontSize: 42,
			fontFamily: "Arial",
			fill: "white",
			fontStyle: "bold",
		});
		title.offsetX(title.width() / 2);

		const instructions = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 260,
			text: "W/A/S/D to move your robot.\nSpace to punch.\nAvoid zombies and defeat them before they reach you.\nSurvive to rack up your score.",
			fontSize: 22,
			fontFamily: "Arial",
			fill: "#e2e8f0",
			align: "center",
			lineHeight: 1.4,
		});
		instructions.offsetX(instructions.width() / 2);

		const prompt = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 480,
			text: "Click to start",
			fontSize: 24,
			fontFamily: "Arial",
			fill: "#cbd5e1",
		});
		prompt.offsetX(prompt.width() / 2);

		this.introGroup.add(bg);
		this.introGroup.add(title);
		this.introGroup.add(instructions);
		this.introGroup.add(prompt);
		this.introGroup.on("click", () => {
			if (this.onIntroClick) this.onIntroClick();
		});
	}

	updateSprite(robot: Robot): void {
		const direction = robot.getDirection();

		switch (direction) {
			case 'up':
				this.dict['up'].visible(true);
				this.dict['down'].visible(false);
				this.dict['left'].visible(false);
				this.dict['right'].visible(false);
				break;
			case 'down':
				this.dict['up'].visible(false);
				this.dict['down'].visible(true);
				this.dict['left'].visible(false);
				this.dict['right'].visible(false);
				break;
			case 'left':
				this.dict['up'].visible(false);
				this.dict['down'].visible(false);
				this.dict['left'].visible(true);
				this.dict['right'].visible(false);
				break;
			case 'right':
				this.dict['up'].visible(false);
				this.dict['down'].visible(false);
				this.dict['left'].visible(false);
				this.dict['right'].visible(true);
				break;
		}
	}

	showIntro(): void {
		this.introGroup.visible(true);
	}

	hideIntro(): void {
		this.introGroup.visible(false);
	}

	setIntroHandler(fn: () => void): void {
		this.onIntroClick = fn;
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
