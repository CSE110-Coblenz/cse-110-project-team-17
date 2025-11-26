import { ScreenController } from "../../types.ts";
import { ExplorationScreenModel } from "./ExplorationScreenModel.ts";
import { ExplorationScreenView } from "./ExplorationScreenView.ts";
import { EducationScreenController } from "../EducationScreen/EducationScreenController.ts";
import { InputManager } from "../../input.ts";
import { STAGE_WIDTH, STAGE_HEIGHT , EDGE_THRESHOLD } from "../../constants.ts";
import { Player } from "../../entities/player.ts";
import { GameObject } from "../../entities/object.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { Map } from "../../entities/tempMap.ts";
import { npc } from "../../entities/npc.ts"
import { Robot } from "../../entities/robot.ts";
import { audioManager } from "../../audioManager.ts";
import Konva from "konva";
import { MiniGame2ScreenController } from "../MiniGame2Screen/MiniGame2ScreenController.ts";

export class ExplorationScreenController extends ScreenController {
    private model: ExplorationScreenModel;
    private view: ExplorationScreenView;
    private screenSwitcher: ScreenSwitcher;
    private eduControl: EducationScreenController;
    private input!: InputManager;
    private player!: Player;
    private npc!: npc;
    private robot?: Robot;
    private robotBuilt = false;
    private worktable?: GameObject;
    private gameObjects: GameObject[] = [];
    private transitioning = false;
    private running: boolean;
    private logicTickInterval?: number;
    private lastCollectionMsgTs = 0;
    private COLLECTION_MSG_COOLDOWN_MS = 750;
    private mapBuilder!: Map;
    private moveSound?: HTMLAudioElement;
    private moveSoundPlaying = false;
    private collisionOverlay?: Konva.Group;
    private partsOverlay: Konva.Group;
    private hitbox?: Konva.Rect;
    private movementLockUntil = 0;
    private collisionDebugEnabled = true;

    constructor(screenSwitcher: ScreenSwitcher, eduControl: EducationScreenController) {
        super();
        this.screenSwitcher = screenSwitcher;
        this.model = new ExplorationScreenModel();
        this.view = new ExplorationScreenView(() => this.handleBookClick());
        this.eduControl = eduControl;
        this.eduControl.setOnClose(() => this.handleBookClose());
        // this.view = new ExplorationScreenView();
        this.running = false;
        this.partsOverlay = new Konva.Group();
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

        this.collisionOverlay = this.mapBuilder.buildCollisionOverlay();
        this.collisionOverlay.visible(false); // hidden by default
        this.view.getMapGroup().add(this.collisionOverlay);


        /* Create player instance */
        const playerImage = await this.loadImage("/sprites/idle-frame1.png");
        this.player = new Player("player1", STAGE_WIDTH/2, STAGE_HEIGHT/2, playerImage);
        this.moveSound = audioManager.createSfxInstance("movement", { volume: 0.2 });

        const hitbox = new Konva.Rect({
            x: 0, y: 0, width: 16, height: 16,
            stroke: "lime", strokeWidth: 1, listening: false,
        });
        this.view.getPlayerGroup().add(hitbox);

        this.hitbox = new Konva.Rect({
            x: 0,
            y: 0,
            width: 16,
            height: 16,
            stroke: "lime",
            strokeWidth: 1,
            listening: false,
        });
        this.view.getPlayerGroup().add(this.hitbox);


        const collectibleDefinitions = [
            { name: "robot_arm1", x: 200, y: 300, sprite: "/objects/robot_parts/Robot_Arm1.png" },
            { name: "robot_arm2", x: 500, y: 400, sprite: "/objects/robot_parts/Robot_Arm2.png" },
            { name: "robot_leg1", x: 400, y: 180, sprite: "/objects/robot_parts/Robot_leg1.png" },
            { name: "robot_leg2", x: 420, y: 220, sprite: "/objects/robot_parts/Robot_leg2.png" },
            { name: "robot_chest", x: 320, y: 480, sprite: "/objects/robot_parts/Robot_chest.png" },
            { name: "robot_head", x: 600, y: 260, sprite: "/objects/robot_parts/Robot_head.png" },
            { name: "robot_wires", x: 700, y: 360, sprite: "/objects/robot_parts/Robot_wires.png" },
        ];

        this.gameObjects.length = 0; // ensure no duplicate pushes on re-init
        for (const definition of collectibleDefinitions) {
            const gameObject = new GameObject(definition.name, definition.x, definition.y, true);
            const objectImage = await this.loadImage(definition.sprite);
            await gameObject.loadImage(objectImage, 0.5);
            this.gameObjects.push(gameObject);
            this.model.addObject(definition.name);
        }

        // Add worktable (not collectible) as an interactable station
        this.worktable = new GameObject("worktable", STAGE_WIDTH - 120, STAGE_HEIGHT - 140, true);
        const worktableImage = await this.loadImage("/objects/chest.png");
        await this.worktable.loadImage(worktableImage);
        this.gameObjects.push(this.worktable);

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

        if (this.collisionDebugEnabled && this.collisionOverlay && this.input.getToggleDebug()) {
            const showing = this.collisionOverlay.visible();
            this.collisionOverlay.visible(!showing);
            if (!showing) {
                this.showAllRobotParts();
            } else {
                this.hideAllRobotPartHighlights();
            }
            this.view.getMapGroup().draw();
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
        // RIGHT EDGE -> Combat
        if(x >= STAGE_WIDTH - EDGE_THRESHOLD){
            if(this.robotBuilt && !this.transitioning){
                this.transitioning = true;
                this.running = false;
                this.movementLockUntil = 0;
                this.hide();
                this.view.hideEdgeIndicator("right");
                this.screenSwitcher.switchToScreen({ type: "combat" });
                return;
            } else { // show one message every cooldown period
                playerImg.x(STAGE_WIDTH - EDGE_THRESHOLD);
                this.lockMovement(1200);
                const now = performance.now();
                if (now - this.lastCollectionMsgTs > this.COLLECTION_MSG_COOLDOWN_MS) {
                    this.view.showCollectionMessage("Build your robot at the worktable first!");
                    this.lastCollectionMsgTs = now;
                    this.npc.showUrgentDialogFor("Finish assembling your robot at the worktable before heading out.", 1200);
                }
                this.nudgeFromEdge("right");
                return;
            }
        }
        // LEFT edge
        if(x < 0) playerImg.x(0);
        // TOP EDGE: POKEMON MINIGAME
        if(y <= 0) {
            if (this.robotBuilt && !this.transitioning) {
                this.transitioning = true;
                this.movementLockUntil = 0;
                this.hide();
                this.view.hideEdgeIndicator("top");
                this.screenSwitcher.switchToScreen({ type: "pokemon" });
                this.player.moveTo(this.player.getPosition().x, this.player.getPosition().y+10); // Move player slightly down to avoid immediate re-trigger
            } else {
                playerImg.y(0);
                this.lockMovement(1200);
                this.npc.showUrgentDialogFor("Finish assembling your robot at the worktable before fighting the boss.", 1200);
                this.nudgeFromEdge("top");
                return;
            }
        }
        // BOTTOM edge -> MiniGame2
        const playerHeight = 16;
        if(y >= STAGE_HEIGHT - EDGE_THRESHOLD){
            if (this.robotBuilt && !this.transitioning) {
                if (MiniGame2ScreenController.completed) {
                    this.npc.showUrgentDialogFor("You've already cleared this path. Head right for the main fight.", 1200);
                    this.nudgeFromEdge("bottom");
                    return;
                }
                this.transitioning = true;
                this.running = false;
                this.movementLockUntil = 0;
                this.stopLogicLoop();
                this.view.hide();
                this.view.hideEdgeIndicator("bottom");
                this.screenSwitcher.switchToScreen({ type: "minigame2" });
                return;
            } else {
                playerImg.y(STAGE_HEIGHT - playerHeight);
                this.lockMovement(1200);
                const now = performance.now();
                if (now - this.lastCollectionMsgTs > this.COLLECTION_MSG_COOLDOWN_MS) {
                    this.view.showCollectionMessage("Build your robot at the worktable first!");
                    this.lastCollectionMsgTs = now;
                }
                this.npc.showUrgentDialogFor("Finish assembling your robot at the worktable before heading down.", 1200);
                this.nudgeFromEdge("bottom");
                return;
            }
        }
    }


    /* Initializes ExplorationScreen gameplay:
    *   --> called by top-level App class when screen switches to ExplorationScreen
    */
    startExploration(): void {
        this.running = true;
        this.transitioning = false;
        this.movementLockUntil = 0;
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
        const now = performance.now();
        if (now < this.movementLockUntil) {
            requestAnimationFrame(this.explorationLoop);
            return;
        }
        const { dx, dy } = this.input.getDirection();
        this.player.setSpeed(this.input.isSprinting() ? 6 : 3);

        if (dx !== 0 || dy !== 0) {
            this.npc.markActive();
        }
        
        /* added functionality for OBJECT COLLISION */
        const prevPos = this.player.getCurrentImage().position();
        const next = this.player.getNextPosition(dx, dy);
        if (next.y <= 0) {
            next.y = 0
        }
        if(this.mapBuilder.canMoveToArea(next.x, next.y, 16, 16)){
            this.player.moveTo(next.x, next.y);
            const moved = dx !== 0 || dy !== 0;
            const newPos = this.player.getCurrentImage().position();
            if (moved && (newPos.x !== prevPos.x || newPos.y !== prevPos.y)) {
                if (this.moveSound && !this.moveSoundPlaying) {
                    this.moveSound.currentTime = 0;
                    this.moveSoundPlaying = true;
                    this.moveSound.onended = () => { this.moveSoundPlaying = false; };
                    void this.moveSound.play().catch(() => { this.moveSoundPlaying = false; });
                }
            } else {
                if (this.moveSound && this.moveSoundPlaying) {
                    this.moveSound.pause();
                    this.moveSound.currentTime = 0;
                    this.moveSoundPlaying = false;
                }
            }
        }

        this.npc.updateDialog(
            next.x,
            next.y,
        );

        if (this.robot && this.robotBuilt) {
            const robotImg = this.robot.getCurrentImage();
            const rx = robotImg.x();
            const ry = robotImg.y();
            const px = this.player.getCurrentImage().x();
            const py = this.player.getCurrentImage().y();
            const dxToPlayer = px - rx;
            const dyToPlayer = py - ry;
            const dist = Math.sqrt(dxToPlayer * dxToPlayer + dyToPlayer * dyToPlayer);
            const desiredOffset = 20;
            if (dist > desiredOffset) {
                const step = Math.min(2.5, dist - desiredOffset);
                const nx = rx + (dxToPlayer / dist) * step;
                const ny = ry + (dyToPlayer / dist) * step;
                if (this.mapBuilder.canMoveToArea(nx, ny, 16, 16)) {
                    this.robot.moveTo(nx, ny);
                }
            }
        }

        this.screenSwitcher.redrawExplorationPlayer();

        if (this.hitbox) {
            this.hitbox.position(this.player.getCurrentImage().position());
        }

        if (this.npc.isNpcShowingHint() && !this.robotBuilt && !this.view.showingPartBoundary()) {
            this.view.setShowingPartBoundary(true);
            // Get a random robot part position to highlight
            const uncollectedParts = this.gameObjects.filter(
                (obj) => !obj.isCollected() && obj.isInteractable() && obj.getName() !== "worktable"
            );
            if (uncollectedParts.length > 0) {
                const randomIndex = Math.floor(Math.random() * uncollectedParts.length);
                const partToHighlight = uncollectedParts[randomIndex];
                const partPos = partToHighlight.getPosition();
                const highlightBox = new Konva.Rect({
                    x: partPos.x,
                    y: partPos.y,
                    width: 16,
                    height: 16,
                    stroke: "yellow",
                    strokeWidth: 2,
                    dash: [4, 4],
                    listening: false,
                });
                this.view.setRobotPartBoundaryBox(highlightBox);
                this.view.showRobotPartBoundary();
            }
        } else if (!this.npc.isNpcShowingHint() && this.view.showingPartBoundary()) {
            this.view.setShowingPartBoundary(false);
            this.view.removeRobotPartBoundary();
        }

        requestAnimationFrame(this.explorationLoop);
    };


    // For debugging purposes
    showAllRobotParts(): void {
        const uncollectedParts = this.gameObjects.filter(
            (obj) => !obj.isCollected() && obj.isInteractable() && obj.getName() !== "worktable"
        );
        if (uncollectedParts.length === 0) return;

        for (const part of uncollectedParts) {
            const partPos = part.getPosition();
            const highlightBox = new Konva.Rect({
                x: partPos.x,
                y: partPos.y,
                width: 16,
                height: 16,
                stroke: "yellow",
                strokeWidth: 2,
                dash: [4, 4],
                listening: false,
            });
            this.partsOverlay.add(highlightBox);
        }
        this.view.getEntityGroup().add(this.partsOverlay);
        this.view.getEntityGroup().draw();
    }

    hideAllRobotPartHighlights(): void {
        this.partsOverlay.destroyChildren();
        this.view.getEntityGroup().draw();
    }


    /**
     * Check if player is near any collectible objects
     * Only called when 'P' is pressed
     */
    private async checkObjectCollection(): Promise<void> {
        const playerImg = this.player.getCurrentImage();
        const playerX = playerImg.x();
        const playerY = playerImg.y();

        for(const obj of this.gameObjects){
            if(obj.isCollected() || !obj.isInteractable()) continue;
            if (obj.getName() === "worktable") continue; // handled separately

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
                audioManager.playSfx("object_collect");
                
                // Show visual feedback message
                this.view.showCollectionMessage(`Collected ${obj.getName()}!`);

                const unlocked = this.eduControl.unlockLesson();
                if (unlocked) {
                    this.view.showBookNotification();
                }

                if (this.model.allObjectsCollected() && this.worktable) {
                    this.view.showWorktableNotification(this.worktable.getPosition());
                }
                
                // Only collect one item per 'P' press
                break;
            }
        }

        if (this.model.allObjectsCollected()) {
            await this.handleWorktableInteraction();
        }
    }

    private async handleWorktableInteraction(): Promise<void> {
        if (!this.worktable || this.robotBuilt) return;

        const playerPos = this.player.getCurrentImage().position();
        const worktablePos = this.worktable.getPosition();
        const distance = Math.sqrt(
            Math.pow(playerPos.x - worktablePos.x, 2) +
            Math.pow(playerPos.y - worktablePos.y, 2)
        );

        if (distance >= 60) return;

        const robotImage = await this.loadImage("/sprites/idle-frame1.png");
        this.robot = new Robot("companion-robot", 100, 10, worktablePos.x, worktablePos.y, robotImage);
        this.view.getPlayerGroup().add(this.robot.getCurrentImage());
        this.robotBuilt = true;
        this.view.hideWorktableNotification();
        audioManager.playSfx("robot_completion");
        this.view.showEdgeIndicators();
        this.lockMovement(1200);
        this.npc.showUrgentDialogFor(
            "Robot complete! New areas are open. Main combat lies to the right.\nCheck minigames at the top and bottom to unlock new capabilities.",
            6000
        );
    }

    private lockMovement(durationMs: number): void {
        this.movementLockUntil = performance.now() + durationMs;
    }

    private nudgeFromEdge(edge: "right" | "top" | "bottom"): void {
        const img = this.player.getCurrentImage();
        if (!img) return;
        const duration = 150;
        let targetX = img.x();
        let targetY = img.y();

        switch (edge) {
            case "right":
                targetX = STAGE_WIDTH - EDGE_THRESHOLD - 12;
                break;
            case "top":
                targetY = 14;
                break;
            case "bottom":
                targetY = STAGE_HEIGHT - 20;
                break;
        }

        new Konva.Tween({
            node: img,
            x: targetX,
            y: targetY,
            duration: duration / 1000,
            easing: Konva.Easings.EaseOut,
        }).play();
    }

    setCollisionDebugEnabled(flag: boolean): void {
        this.collisionDebugEnabled = flag;
        if (!flag && this.collisionOverlay) {
            this.collisionOverlay.visible(false);
            this.view.getMapGroup().draw();
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

    private handleBookClick(): void {
        const opened = this.eduControl.openBook();
        if (opened) {
            this.view.hideBookNotification();
            this.view.hideEntities();
            this.npc.clearDialog();
        }
    }

    private handleBookClose(): void {
        this.view.showEntities();
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
        this.npc.clearDialog();
    }

    /* just in case */
    private stopLogicLoop(): void {
        if(this.logicTickInterval){
            clearInterval(this.logicTickInterval);
            this.logicTickInterval = undefined;
        }
    }
}
