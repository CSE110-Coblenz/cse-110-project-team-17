import { ScreenController } from "../../types.ts";
import { ExplorationScreenModel } from "./ExplorationScreenModel.ts";
import { ExplorationScreenView } from "./ExplorationScreenView.ts";
import { InputManager } from "../../input.ts";
import { STAGE_WIDTH, STAGE_HEIGHT , EDGE_THRESHOLD } from "../../constants.ts";
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
    private running: boolean;

    private logicTickInterval?: number;
    private lastCollectionMsgTs = 0;
    private COLLECTION_MSG_COOLDOWN_MS = 750;

    constructor(screenSwitcher: ScreenSwitcher) {
        super();
        this.screenSwitcher = screenSwitcher;
        this.model = new ExplorationScreenModel();
        this.view = new ExplorationScreenView();
        this.running = false;
    }

    /* Load Map and spawn objects */
    async init(): Promise<void> {
        const mapData = await this.loadMap("/porj0.json");
        const playerImage = await this.loadImage("/imagesTemp.jpg");
        
        this.player = new Player("player1", STAGE_WIDTH / 2, STAGE_HEIGHT / 2, playerImage);

        // Create GameObject instances without Screen dependency
        const key = new GameObject("key", 200, 300, true);
        const keyImage = await this.loadImage("/key.jpg");
        await key.loadImage(keyImage);
        this.gameObjects.push(key);
        this.model.addObject("key");

        const chest = new GameObject("chest", 500, 400, true);
        const chestImage = await this.loadImage("/chest.png");
        await chest.loadImage(chestImage);
        this.gameObjects.push(chest);
        this.model.addObject("chest");

        await this.view.build(mapData, this.player, this.gameObjects, this.loadImage.bind(this));
    }

    /* check collisions 10 times a second */
    private logicTick = (): void => {
        if (!this.running) return;

        const { dx, dy } = this.input.getDirection();
        const playerImg = this.player.getCurrentImage();
        const newX = playerImg.x();

        // Movement-related game logic
        if (dx !== 0 || dy !== 0) {
            this.checkEdges();
        }

        // Check if the player should transition to combat
        if (this.model.shouldTransitionToCombat(newX)) {
            this.running = false;
            this.screenSwitcher.switchToScreen({ type: "combat" });
            return;
        }

        // Check for interactions
        if (this.input.getInteract()) {
            this.checkObjectCollection();
        }
    };

    private checkEdges(): void {
        const playerImg = this.player.getCurrentImage();
        const x = playerImg.x();
        const y = playerImg.y();

        // RIGHT EDGE
        if(x >= STAGE_WIDTH - EDGE_THRESHOLD){
            if(this.model.allObjectsCollected()){
                this.running = false;
                this.screenSwitcher.switchToScreen({ type: "combat" });
                return;
            } else {
                // show one message every cooldown period
                playerImg.x(STAGE_WIDTH - EDGE_THRESHOLD);
                const now = performance.now();
                if (now - this.lastCollectionMsgTs > this.COLLECTION_MSG_COOLDOWN_MS) {
                    this.view.showCollectionMessage("Collect all items first!");
                    this.lastCollectionMsgTs = now;
                }
            }
        }

        // LEFT edge
        if(x < 0) playerImg.x(0);

        // TOP edge
        if(y < 0) playerImg.y(0);

        // BOTTOM edge
        const playerHeight = 32;
        if(y > STAGE_HEIGHT - playerHeight){
            playerImg.y(STAGE_HEIGHT - playerHeight);
        }
    }

    startExploration(): void {
        this.running = true;
        this.input = new InputManager();
        requestAnimationFrame(this.explorationLoop);
        this.view.show();
        this.logicTickInterval = window.setInterval(() => this.logicTick(), 100);
    }

    /* Exploration game loop */
    private explorationLoop = (): void => {
        if(!this.running) return;
        const { dx, dy } = this.input.getDirection();
        this.player.move(dx, dy);
        this.screenSwitcher.redrawExplorationEntities();
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

        for(const obj of this.gameObjects){
            if(obj.isCollected() || !obj.isInteractable()) continue;

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

    hide(): void {
        this.running = false;
        this.view.hide();
    }
}