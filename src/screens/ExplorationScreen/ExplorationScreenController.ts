import { ScreenController } from "../../types.ts";
import { ExplorationScreenModel } from "./ExplorationScreenModel.ts";
import { ExplorationScreenView } from "./ExplorationScreenView.ts";
import { InputManager } from "../../input.ts";
import { STAGE_WIDTH, STAGE_HEIGHT , EDGE_THRESHOLD } from "../../constants.ts";
import { Player } from "../../entities/player.ts";
import { npc } from "../../entities/npc.ts";
import { GameObject } from "../../entities/object.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { Map } from "../../entities/tempMap.ts";

export class ExplorationScreenController extends ScreenController {
    private model: ExplorationScreenModel;
    private view: ExplorationScreenView;
    private screenSwitcher: ScreenSwitcher;
    private input!: InputManager;
    private player!: Player;
    private npc!: npc;
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
        const mapData = await this.loadMap("/maps/Exploration_Map_ZA.json");

        /* mapBuilder uses the Map class to build the map using the mapData(.json)*/
        this.mapBuilder = new Map(16, mapData, this.loadImage.bind(this));
        await this.mapBuilder.loadTilesets();

        /* Assemble the mapGroup in the Map class and give it to the ScreenView */
        const mapGroup = await this.mapBuilder.buildMap();
        this.view.getMapGroup().add(mapGroup);

        /* Create player instance */
        const playerImage = await this.loadImage("/sprites/idle-frame1.png");
        this.player = new Player("player1", STAGE_WIDTH/2, STAGE_HEIGHT/2, playerImage);

        // Create GameObject instances without Screen dependency
        const key = new GameObject("key", 200, 300, true);
        const keyImage = await this.loadImage("/objects/key.jpg");
        await key.loadImage(keyImage);
        this.gameObjects.push(key);
        this.model.addObject("key");

                const npcImage = await this.loadImage("/npc.png");
        const gameTrivia = [
            "The first wave of zombies was actually caused by a corrupted line of code, not a virus.",
            "Your robot creation can handle up to three different combat modules, so choose your code wisely!",
            "The 'Pokemon Battle' style mini-game uses the very same logic engine you are trying to repair.",
            "Every snippet of code you find represents a memory fragment from the Robot's original AI.",
            "Rumor has it that some of the robot parts are hidden in plain sight, disguised as junk.",
            "Some parts of the junkyard are booby-trapped. Be cautious when exploring unfamiliar areas.",
            "Completing your robot not only helps you escape but also unlocks special abilities for the combat phase.",
            "Keep an eye out for environmental clues; they might lead you to hidden robot parts.",
            "The junkyard's layout changes slightly each time you enter, so stay alert and adapt your strategy.",
            "The junkyard is a remnant of a failed tech experiment; understanding its history might give you an edge.",
            "Not all robot parts are created equal; some have unique properties that can enhance your robot's performance.",
            "Trust your instincts when exploring—the junkyard has a way of revealing secrets to those who pay attention.",
            "Good luck, survivor! Your journey through the junkyard is just the beginning of a much larger adventure.",
            "Stay vigilant; the junkyard is full of surprises, both helpful and hazardous.",
            "Exploration is key—take your time to thoroughly search the junkyard for all its hidden treasures.",
            "Your robot's AI can adapt to different combat styles based on the parts you choose to install.",
            "The journey through the junkyard is as much about discovery as it is about survival—embrace both aspects to succeed.",
            "Remember, every piece of code you collect brings you one step closer to restoring your robot's full potential."
        ];
        this.npc = new npc( 400, 300, gameTrivia, npcImage);
        this.view.getEntityGroup().add(this.npc.getCurrentImage());
        this.view.getEntityGroup().draw();

        const chest = new GameObject("chest", 50, 40, true);
        const chestImage = await this.loadImage("/objects/chest.png");
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
                    this.npc.showUrgentDialog("Maybe you should finish completing your robot before exiting the junkyard. I heard it's real dangerous out there.");
                }
            }
        }
        // LEFT edge && TOP edge
        if(x < 0) playerImg.x(0);
        if(y <= 0) {
            playerImg.y(0);
            if (!this.model.allObjectsCollected())
                this.npc.showUrgentDialog("Maybe you should finish completing your robot before exiting the junkyard. I heard it's real dangerous out there.");
        }
        // BOTTOM edge (CHANGE DEPENDING ON SPRITE)
        const playerHeight = 16;
        if(y > STAGE_HEIGHT - playerHeight){
            playerImg.y(STAGE_HEIGHT - playerHeight);
            if (!this.model.allObjectsCollected())
                this.npc.showUrgentDialog("Maybe you should finish completing your robot before exiting the junkyard. I heard it's real dangerous out there.");
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
        if(this.mapBuilder.canMoveToArea(next.x, next.y, 16, 16)){
            this.player.moveTo(next.x, next.y);
        }
        
        this.npc.updateDialog(
            dx,
            dy,
        );

        /* console.log(
            "corner ->",
            next.x, next.y,
            "tile:",
            Math.floor(next.x / this.mapBuilder.getTileSize()),
            Math.floor(next.y / this.mapBuilder.getTileSize()),
            "blocked:", this.mapBuilder.isBlocked(Math.floor(next.x / this.mapBuilder.getTileSize()), Math.floor(next.y / this.mapBuilder.getTileSize()))
        ); */

        console.log("mapBuilder =", this.mapBuilder);
        console.log("next.x =", next.x);
        console.log("next.y =", next.y);
        console.log("tileSize =", this.mapBuilder.getTileSize());

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
        const wasCompletedBefore = this.model.allObjectsCollected();

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
                // Check for robot completion
                const isCompletedNow = this.model.allObjectsCollected();
                if (!wasCompletedBefore && isCompletedNow) {
                    const completionMessage = "Now that the robot is complete, you are safe to explore out of this junkyard. Good luck, survivor!";
                    this.npc.showUrgentDialog(completionMessage);
                }
                
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