import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { CombatScreenModel } from "./CombatScreenModel.ts";
import { CombatScreenView } from "./CombatScreenView.ts";
import { InputManager } from "../../input.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { Zombie } from "../../entities/zombie.ts";
import { Robot } from "../../entities/robot.ts";


/**
 * CombatScreenController
 *
 * Coordinates the combat gameplay: initializes model + view, processes input,
 * runs the combat game loop, and updates rendering via the ScreenSwitcher.
 */
export class CombatScreenController extends ScreenController {
	private model: CombatScreenModel;
	private view: CombatScreenView;
	private screenSwitcher: ScreenSwitcher;
	private input!: InputManager;
	private lastZombieMoveTime = 0;
	private lastAttackTime = 0;
	private lastSpawnTime = 0;
	private zombiePendingAttack = false;
	private zombieAttackStartTime = 0;
	private ZOMBIE_WINDUP = 500; // ms
	private zombieCombatDelay = 2000; // ms
	private zombieLastAttackTime = 0;
	private animationFrameId: number | null = null; // Track animation frame


	private readonly ZOMBIE_SPAWN_INTERVAL = 10000;

	/* Create model and view, instantiate reference to top-level App class */
	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.model = new CombatScreenModel(screenSwitcher.getStageWidth(), screenSwitcher.getStageHeight());
		this.view = new CombatScreenView(this.model);
	}

	/* Loads Map and Player data (on boot) */
	async init(): Promise<void> {
		const mapData = await this.loadMap("/porj0.json");
		this.model.setMapData(mapData);

		// load images used by robot/zombie and attack animations
		const robotImage = await this.loadImage("/lemon.png");
		const zombieImage = await this.loadImage("/imagesTemp.jpg");
		const attackingImage = await this.loadImage("/image.png");
		const idleImage = await this.loadImage("/lemon.png");

		// create entities centered on stage
		const robot = new Robot("robot", 100, 50, STAGE_WIDTH / 2, STAGE_HEIGHT / 2, robotImage);
		const zombie = new Zombie("zombie", 100, 50, STAGE_WIDTH, STAGE_HEIGHT, zombieImage);

		this.model.addZombie(zombie);
		this.view.addZombie(zombie);

		// store entities and images in the model
		this.model.setEntities(robot, zombie);
		this.model.setAttackingImage(attackingImage);
		this.model.setIdleImage(idleImage);

		// after building the view
		this.view.addZombieCounter(10, 10); // top-left corner

		// build view (map + add entity images to the view's groups)
		await this.view.build(
			this.model.getMapData(),
			this.model.getRobot(),
			this.loadImage.bind(this),
		);
	}

	/**
     * startCombat
     *
     * Called when switching into combat screen. Creates an InputManager,
     * shows the combat view and starts the requestAnimationFrame loop.
     */
	startCombat(): void {
		this.input = new InputManager();
		this.view.show();

		// set running variable to active
		this.model.setRunning(true);

		// start the frame loop
		this.animationFrameId = requestAnimationFrame(this.gameLoop);
	}

	/**  * hide
	 *
	 * Called when switching away from combat screen. Stops the game loop
	 * by setting running to false and hides the combat view.
	 */
	hide(): void {
		this.model.setRunning(false);
		this.view.hide();
	}
	
	private async spawnZombie(): Promise<void> {
		const zombieImage = await this.loadImage("/imagesTemp.jpg");
		const x = Math.random() * (STAGE_WIDTH - 32);
		const y = Math.random() * (STAGE_HEIGHT - 32);
		const newZombie = new Zombie(`zombie-${Date.now()}`, 100, 50, x, y, zombieImage);

		this.model.addZombie(newZombie); // You'll need to implement addZombie in your model
		this.view.addZombie(newZombie); // Update view to show the new zombie
		console.log(`Spawned new zombie at (${x.toFixed(0)}, ${y.toFixed(0)})`);
	}

	/**
     * gameLoop
     *
     * Runs every frame while combat is active. Reads player input,th
     * updates model (movement, attack), then asks the top-level app
     * to redraw the entity layer.
     */
	private gameLoop = (timestamp: number): void => {

		if (this.model.getRobot().getHealth() <= 0) {
			this.model.getRobot().setHealth(100);
			console.log("Robot defeated! Game Over.");
			this.model.setRunning(false);
			this.model.reset();
			this.screenSwitcher.switchToScreen({ type: "result", score: this.model.getZombiesDefeated() });
			return;
		}

		// stop condition: model not running or input not initialized
		if (!this.model.isRunning() || !this.input) {
			return;
		}

		// movement input (WASD)
		let { dx, dy } = this.input.getDirection();
		this.model.updateRobotPosition(dx, dy);

		// Zombie AI movement
		if (timestamp - this.lastZombieMoveTime >= 150) {
			this.model.updateZombieAI();
			this.lastZombieMoveTime = timestamp;
		}

		// Start wind-up
		if (!this.zombiePendingAttack &&
			timestamp - this.zombieLastAttackTime >= this.zombieCombatDelay) {

			this.zombiePendingAttack = true;
			this.zombieAttackStartTime = timestamp;
		}

		// Finish wind-up and perform attack
		if (this.zombiePendingAttack &&
			timestamp - this.zombieAttackStartTime >= this.ZOMBIE_WINDUP) {

			this.model.processAttackRequest(true, timestamp, this.zombieLastAttackTime, false);

			this.zombieLastAttackTime = timestamp;
			this.zombiePendingAttack = false;
		}


		// attack input (space): model handles attack timing/animation
		const attack = this.input.getAttack();
		let returned = this.model.processAttackRequest(attack, timestamp, this.lastAttackTime, true);
		if (attack && returned != -1) {
			this.lastAttackTime = timestamp;
		}

		// spawn zombies periodically
		if (timestamp - this.lastSpawnTime >= this.ZOMBIE_SPAWN_INTERVAL) {
			this.spawnZombie();
			this.lastSpawnTime = timestamp;
		}
		// update live counter
		this.view.updateZombieCounter(this.model.getZombiesDefeated());


		// redraw
		this.screenSwitcher.redrawEntities();

		// next frame
		this.animationFrameId = requestAnimationFrame(this.gameLoop);
	};

	/* Utility: load tiled map JSON */
	private async loadMap(jsonPath: string): Promise<any> {
		const res = await fetch(jsonPath);
		return await res.json();
	}

	/* Utility: load image into HTMLImageElement */
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

	/**
	 * cleanup
	 * 
	 * Stops the game loop and cleans up resources.
	 * Must be called before destroying the controller.
	 */
	cleanup(): void {
		// Stop the game loop
		this.model.setRunning(false);
		
		// Cancel any pending animation frame
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
		
		// Clean up input manager
		if (this.input) {
			this.input = null!;
		}
		
		// Reset timers
		this.lastZombieMoveTime = 0;
		this.lastAttackTime = 0;
		this.lastSpawnTime = 0;
		this.zombiePendingAttack = false;
		this.zombieAttackStartTime = 0;
		this.zombieLastAttackTime = 0;
	}

	/**
	 * @deprecated Use cleanup() instead
	 */
	destroy() {
		this.cleanup();
	}
}