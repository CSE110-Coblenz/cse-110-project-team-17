import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";

/**
 * GameScreenView - Renders the game UI using Konva
 */
export class GameScreenView implements View {
	private group: Konva.Group;
	private playerSprite: Konva.Image | Konva.Circle | null = null;
	//private scoreText: Konva.Text;
	//private timerText: Konva.Text;

	constructor() {
		this.group = new Konva.Group({ visible: false });

		// TODO: Task 2 - Load and display lemon image using Konva.Image.fromURL()
		// Placeholder circle (remove this when implementing the image)
		Konva.Image.fromURL("/lemon.png", (image) => {
			this.playerSprite = image;
			this.playerSprite.width(32).height(32);
			this.playerSprite.offsetX(image.width() / 2)
			.offsetY(image.height() / 2);
			this.playerSprite.x(STAGE_WIDTH / 2).y(STAGE_HEIGHT / 2);
			this.group.add(this.playerSprite);
		});
	}

	/**
	 * Randomize lemon position
	 */
	randomizeLemonPosition(): void {
		if (!this.playerSprite) return;

		// Define safe boundaries (avoid edges)
		const padding = 100;
		const minX = padding;
		const maxX = STAGE_WIDTH - padding;
		const minY = padding;
		const maxY = STAGE_HEIGHT - padding;

		// Generate random position
		const randomX = Math.random() * (maxX - minX) + minX;
		const randomY = Math.random() * (maxY - minY) + minY;

		// Update lemon position
		this.playerSprite.x(randomX);
		this.playerSprite.y(randomY);
		this.group.getLayer()?.draw();
	}

	/**
	 * Show the screen
	 */
	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();
	}

	/**
	 * Hide the screen
	 */
	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}
}
