import { ScreenController } from "../../types.ts";
import { ExplorationScreenModel } from "./ExplorationScreenModel.ts";
import { ExplorationScreenView } from "./ExplorationScreenView.ts";
import { InputManager } from "../../input.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { Player } from "../../entities/player.ts";
import { GameObject } from "../../entities/object.ts";
import type { ScreenSwitcher } from "../../types.ts";

export class ExplorationScreenController extends ScreenController {
    private model: ExplorationScreenModel;
    private view: ExplorationScreenView;
    private screenSwitcher: ScreenSwitcher;
    private input!: InputManager;
    private player!: Player;
    private gameObjects: GameObject[] = [];
    private readonly EDGE_THRESHOLD = 10; // Pixels from edge to trigger transition

    constructor(screenSwitcher: ScreenSwitcher) {
        super();
        this.screenSwitcher = screenSwitcher;
        this.model = new ExplorationScreenModel();
        this.view = new ExplorationScreenView();
    }

    /* Load Map and spawn objects */
    async init(): Promise<void> {
        const mapData = await this.loadMap("/porj0.json");
        const playerImage = await this.loadImage("/imagesTemp.jpg");
        
        this.player = new Player("player1", STAGE_WIDTH / 2, STAGE_HEIGHT / 2, playerImage);

        const collectibleDefinitions = [
            { name: "key", x: 200, y: 300, sprite: "/key.jpg" },
            { name: "chest", x: 500, y: 400, sprite: "/chest.png" },
            { name: "orb", x: 150, y: 180, sprite: "/lemon.png" },
            { name: "scroll", x: 420, y: 220, sprite: "/image.png" },
            { name: "gem", x: 320, y: 480, sprite: "/imagesTemp.jpg" },
            { name: "battery", x: 600, y: 260, sprite: "/key.jpg" },
            { name: "antenna", x: 700, y: 360, sprite: "/chest.png" },
        ];

        this.gameObjects.length = 0; // ensure no duplicate pushes on re-init
        for (const definition of collectibleDefinitions) {
            const gameObject = new GameObject(definition.name, definition.x, definition.y, true);
            const objectImage = await this.loadImage(definition.sprite);
            await gameObject.loadImage(objectImage);
            this.gameObjects.push(gameObject);
            this.model.addObject(definition.name);
        }

        await this.view.build(mapData, this.player, this.gameObjects, this.loadImage.bind(this));
    }

    startExploration(): void {
        this.model.setRunning(true);
        this.input = new InputManager();
        this.view.show();
        requestAnimationFrame(this.explorationLoop);
    }

    hide(): void {
        this.model.setRunning(false);
        this.view.hide();
    }

    /* Exploration game loop */
    private explorationLoop = (): void => {
        if (!this.model.isRunning()) return;

        const { dx, dy } = this.input.getDirection();
        const playerImg = this.player.getCurrentImage();
        const currentX = playerImg.x();
        const currentY = playerImg.y();

        console.log("Player position: ", currentX, currentY);

        // Move player
        this.player.move(dx, dy);

        // Get new position after movement
        const newX = playerImg.x();
        const newY = playerImg.y();

        // Check if player is trying to go past the right edge
        if (newX >= STAGE_WIDTH - this.EDGE_THRESHOLD) {
            // Check if all items have been collected
            if (this.model.allObjectsCollected()) {
                // Transition to combat
                this.model.setRunning(false);
                this.screenSwitcher.switchToScreen({ type: "combat" });
                return;
            } else {
                // Prevent movement past the edge
                playerImg.x(STAGE_WIDTH - this.EDGE_THRESHOLD);
                // Show message that items must be collected first
                this.view.showCollectionMessage("Collect all items first!");
            }
        }

        // Optional: Prevent movement past other edges
        if (newX < 0) {
            playerImg.x(0);
        }
        if (newY < 0) {
            playerImg.y(0);
        }
        if (newY >= STAGE_HEIGHT - 32) {
            if (this.model.allObjectsCollected()) {
                // Traveling off the bottom of the map transitions to the minigame
                this.model.setRunning(false);
                this.screenSwitcher.switchToScreen({ type: "minigame2" });
                return;
            }
            playerImg.y(STAGE_HEIGHT - 32);
            this.view.showCollectionMessage("Collect all items before heading down!");
        }

        // Check if 'P' key is pressed for object collection
        const interact = this.input.getInteract();
        if (interact) {
            this.checkObjectCollection();
        }

        this.screenSwitcher.redrawEntities();
        requestAnimationFrame(this.explorationLoop);
    };

    /**
     * Check if player is near any collectible objects
     * Only called when 'P' is pressed
     */
    private checkObjectCollection(): void {
        const playerImg = this.player.getCurrentImage();
        const playerX = playerImg.x();
        const playerY = playerImg.y();

        for (const obj of this.gameObjects) {
            if (obj.isCollected() || !obj.isInteractable()) continue;

            const objPos = obj.getPosition();
            const objX = objPos.x;
            const objY = objPos.y;

            const distance = Math.sqrt(
                Math.pow(playerX - objX, 2) + Math.pow(playerY - objY, 2)
            );

            // If player is close enough (within 50 pixels), collect the object
            if (distance < 50) {
                obj.collect();
                this.model.collectObject(obj.getName());
                this.player.addToInventory(obj.getName());
                this.view.updateInventory(this.model.getCollectedItems());
                console.log(`Collected: ${obj.getName()}`);
                
                // Show visual feedback message
                this.view.showCollectionMessage(`Collected ${obj.getName()}!`);
                
                // Only collect one item per 'P' press
                break;
            }
        }
    }

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

    getView(): ExplorationScreenView {
        return this.view;
    }

    /**
     * Get collected items to pass to combat screen
     */
    getCollectedItems(): string[] {
        return this.model.getCollectedItems();
    }
}
