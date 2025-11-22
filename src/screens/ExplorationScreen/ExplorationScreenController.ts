import { ScreenController } from "../../types.ts";
import { ExplorationScreenModel } from "./ExplorationScreenModel.ts";
import { ExplorationScreenView } from "./ExplorationScreenView.ts";
import { InputManager } from "../../input.ts";
import { STAGE_WIDTH, STAGE_HEIGHT , EDGE_THRESHOLD } from "../../constants.ts";
import { Player } from "../../entities/player.ts";
import { GameObject } from "../../entities/object.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { Map } from "../../entities/tempMap.ts";

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
    private mapBuilder!: Map;

    constructor(screenSwitcher: ScreenSwitcher) {
        super();
        this.screenSwitcher = screenSwitcher;
        this.model = new ExplorationScreenModel();
        this.view = new ExplorationScreenView();
        this.running = false;
    }

    /**
     * Called by top-level App class BEFORE the game starts
     *  --> builds map, initializes entities
     */
    async init(): Promise<void> {
        /* mapData represents the map's .json file */
        const mapData = await this.loadMap("/Exploration_Map_ZA.json");

        /* mapBuilder uses the Map class to build the map using the mapData(.json)*/
        this.mapBuilder = new Map(mapData, this.loadImage.bind(this));
        await this.mapBuilder.loadTilesets();

        /* Assemble the mapGroup in the Map class and give it to the ScreenView */
        const mapGroup = await this.mapBuilder.buildMap();
        this.view.getMapGroup().add(mapGroup);

        /* Create player instance */
        const playerImage = await this.loadImage("/imagesTemp.jpg");
        this.player = new Player("player1", STAGE_WIDTH/2, STAGE_HEIGHT/2, playerImage);

        // Create GameObject instances without Screen dependency
        const key = new GameObject("key", 200, 300, true);
        const keyImage = await this.loadImage("/key.jpg");
        await key.loadImage(keyImage);
        this.gameObjects.push(key);
        this.model.addObject("key");

        const chest = new GameObject("chest", 50, 40, true);
        const chestImage = await this.loadImage("/chest.png");
        await chest.loadImage(chestImage);
        this.gameObjects.push(chest);
        this.model.addObject("chest");

        /* */
        await this.view.build(this.player, this.gameObjects);
    }


    /**
     * check Map Border Collisions 10 times a second  
     * check Object Collection 10 times a second
     */ 
    private logicTick = (): void => {
        if (!this.running) return;
        const { dx, dy } = this.input.getDirection();

        if(dx !== 0 || dy !== 0){
            this.checkEdges();
        }

        if(this.input.getInteract()){
            this.checkObjectCollection();
        }
    };


    /**
     * Helper method to check Map Border Collisions
     */
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
            } else { // show one message every cooldown period
                playerImg.x(STAGE_WIDTH - EDGE_THRESHOLD);
                const now = performance.now();
                if (now - this.lastCollectionMsgTs > this.COLLECTION_MSG_COOLDOWN_MS) {
                    this.view.showCollectionMessage("Collect all items first!");
                    this.lastCollectionMsgTs = now;
                }
            }
        }
        // LEFT edge && TOP edge
        if(x < 0) playerImg.x(0);
        if(y < 0) playerImg.y(0);
        // BOTTOM edge
        const playerHeight = 32;
        if(y > STAGE_HEIGHT - playerHeight){
            playerImg.y(STAGE_HEIGHT - playerHeight);
        }
    }


    /* Initializes ExplorationScreen gameplay:
    *   --> called by top-level App class when screen switches to ExplorationScreen
    */
    startExploration(): void {
        this.running = true;
        this.input = new InputManager();
        requestAnimationFrame(this.explorationLoop);
        this.view.show();
        this.logicTickInterval = window.setInterval(() => this.logicTick(), 50);
    }


    /* GAME LOOP: 
    *    --> runs 60 times/sec, only responsible for playerSprite movement
    */
    private explorationLoop = (): void => {
        if(!this.running) return;
        const { dx, dy } = this.input.getDirection();
        
        /* added functionality for OBJECT COLLISION */
        const next = this.player.getNextPosition(dx, dy);
        if(this.mapBuilder.canMoveToArea(next.x, next.y, 32, 32)){
            this.player.applyPosition(next.x, next.y);
        }

        this.screenSwitcher.redrawExplorationPlayer();
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


    /**
     * Convert a .json to a Konva struct that we can reference
     */
    private async loadMap(jsonPath: string): Promise<any> {
        const res = await fetch(jsonPath);
        return await res.json();
    }


    /**
     * Convert a .png --> HTMLImageElement (Konva Object)
     */
    private loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = () => reject(`Failed to load image: ${src}`);
        });
    }

    /**
     * Return this view
     */
    getView(): ExplorationScreenView {
        return this.view;
    }


    /**
     * Get collected items to pass to combat screen
     */
    getCollectedItems(): string[] {
        return this.model.getCollectedItems();
    }


    /**
     * Hide the Exploration Screen
     */
    hide(): void {
        this.running = false;
        this.view.hide();
        this.stopLogicLoop();
    }

    /* just in case */
    private stopLogicLoop(): void {
        if(this.logicTickInterval){
            clearInterval(this.logicTickInterval);
            this.logicTickInterval = undefined;
        }
    }
}