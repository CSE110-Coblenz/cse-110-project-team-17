import { ScreenController } from "../../types.ts";
import { ExplorationScreenModel } from "./ExplorationScreenModel.ts";
import { ExplorationScreenView } from "./ExplorationScreenView.ts";
import { InputManager } from "../../input.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { Player } from "../../entities/player.ts";
import { npc } from "../../entities/npc.ts";
import { GameObject } from "../../entities/object.ts";
import type { ScreenSwitcher } from "../../types.ts";

export class ExplorationScreenController extends ScreenController {
    private model: ExplorationScreenModel;
    private view: ExplorationScreenView;
    private screenSwitcher: ScreenSwitcher;
    private input!: InputManager;
    private player!: Player;
    private npc!: npc;
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

        // Create GameObject instances without Screen dependency
        const key = new GameObject("key", 200, 300, true);
        const keyImage = await this.loadImage("/key.jpg");
        await key.loadImage(keyImage);
        this.gameObjects.push(key);
        this.model.addObject("key");

        // NPC Initialization
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

        const chest = new GameObject("chest", 500, 400, true);
        const chestImage = await this.loadImage("/chest.png");
        await chest.loadImage(chestImage);
        this.gameObjects.push(chest);
        this.model.addObject("chest");

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

        const robotCompleted = this.model.allObjectsCollected();
        // If the player pressed any movement key, mark activity and hide any global hints
        if (dx !== 0 || dy !== 0) {
            this.npc.markActive();
        }

        this.npc.updateDialog(
            newX,
            newY,
        );
        

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
                // to show the specific message about the exit being blocked.
                this.npc.showUrgentDialog("Maybe you should finish completing your robot before exiting the junkyard. I heard it's real dangerous out there.");
            }
        }
        // Check if player is trying to go past the top edge
        else if (newY <= 0) {
            // Check if all items have been collected
            if (this.model.allObjectsCollected()) {
                this.view.hide();
                // Start the pokemon minigame
                this.model.setRunning(false);
                this.screenSwitcher.switchToScreen({ type: "pokemon" });
                return;
            }
        }        

        // Optional: Prevent movement past other edges
        if (newX < 0) {
            playerImg.x(0);
        }
        if (newY < 0) {
            playerImg.y(0);
            if (!robotCompleted) {
                // Robot not completed
                playerImg.y(0);
                this.view.showCollectionMessage("Collect all items first!");
                this.npc.showUrgentDialog("Maybe you should finish completing your robot before starting the pokemon boss battles. I heard they are real dangerous.");
            }
        }
        if (newY > STAGE_HEIGHT - 32) { 
            playerImg.y(STAGE_HEIGHT - 32);
            if (!robotCompleted) {
                // Robot not completed
                playerImg.y(STAGE_HEIGHT - 32);
                this.view.showCollectionMessage("Collect all items first!");
                this.npc.showUrgentDialog("Maybe you should finish completing your robot before exiting the junkyard. I heard it's real dangerous out there.");
            }
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
        const wasCompletedBefore = this.model.allObjectsCollected();

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