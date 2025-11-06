import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { CombatScreenModel } from "./CombatScreenModel.ts";
import { CombatScreenView } from "./CombatScreenView.ts";
import { InputManager } from "../../input.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { Zombie } from "../../entities/zombie.ts";
import { Robot } from "../../entities/robot.ts";




export class CombatScreenController extends ScreenController {
	private model: CombatScreenModel;
	private view: CombatScreenView;
	private screenSwitcher: ScreenSwitcher;
	private input!: InputManager;

	/* Create model and view, instantiate reference to top-level App class */
	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.model = new CombatScreenModel(STAGE_WIDTH, STAGE_HEIGHT);
		this.view = new CombatScreenView(this.model);
	}

	/* Loads Map and Player data (on boot) */
	async init(): Promise<void> {
		const mapData = await this.loadMap("/porj0.json");
		this.model.setMapData(mapData);

		const robotImage = await this.loadImage("/lemon.png");
		const zombieImage = await this.loadImage("/imagesTemp.jpg");
		const attackingImage = await this.loadImage("/image.png");
		const idleImage = await this.loadImage("/lemon.png");

		const robot = new Robot("robot", 100, 50, STAGE_WIDTH / 2, STAGE_HEIGHT / 2, robotImage);
		const zombie = new Zombie("zombie", 100, 50, STAGE_WIDTH / 2, STAGE_HEIGHT / 2, zombieImage);

		this.model.setEntities(robot, zombie);
		this.model.setAttackingImage(attackingImage);
		this.model.setIdleImage(idleImage);

		await this.view.build(
			this.model.getMapData(),
			this.model.getRobot(),
			this.model.getZombie(),
			this.loadImage.bind(this),
		);
	}

	/* Called by App class when switchToScreen("game") is executed */
	/* 	--> start gameLoop function 							   */
	/* 	--> create InputManager object to process user input 	   */
	/*  --> show CombatScreenView (all three Konva.Groups) 		   */
	startCombat(): void {
		this.input = new InputManager();
		this.view.show();

		this.model.setRunning(true);

		requestAnimationFrame(this.gameLoop);
	}

	/* make all groups in CombatScreenView invisible */
	hide(): void {
		this.model.setRunning(false);
		this.view.hide();
	}

	/* gameLoop runs 60 times/sec, updates position of Player sprite */
	private gameLoop = (): void => {
		if (!this.model.isRunning() || !this.input) {
			return;
		}

		const { dx, dy } = this.input.getDirection();
		this.model.updateRobotPosition(dx, dy);

		const attack = this.input.getAttack();
		this.model.processAttackRequest(attack);

		this.screenSwitcher.redrawCombatEntities();
		
		requestAnimationFrame(this.gameLoop);
	};


	private async loadMap(jsonPath: string): Promise<any> {
		const res = await fetch(jsonPath);
		return await res.json();
	}

	private loadImage(src: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = src;
		img.onload = () => resolve(img);
		img.onerror = () => reject(`Failed to load image: ${src}`);
		});
	}
	
	getView(): CombatScreenView {
		return this.view;
	}
}
