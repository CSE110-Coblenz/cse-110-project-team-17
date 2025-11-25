import { ScreenController } from "../../types.ts";
import {
    MiniGame2ScreenModel,
    PICKUP_POSITION_TEMPLATES,
    TEXT_SNIPPETS,
} from "./MiniGame2ScreenModel.ts";
import type { TextSnippetDefinition } from "./MiniGame2ScreenModel.ts";
import { MiniGame2ScreenView } from "./MiniGame2ScreenView.ts";
import { InputManager } from "../../input.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { Player } from "../../entities/player.ts";
import { GameObject } from "../../entities/object.ts";
import { Robot } from "../../entities/robot.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { audioManager } from "../../audioManager.ts";

type DropSlotState = {
    id: string;
    label: string;
    expectedSnippetId: string;
    position: { x: number; y: number };
    width: number;
    height: number;
    occupiedBy: string | null;
    status: 'empty' | 'correct' | 'incorrect';
};

type RectBounds = {
    left: number;
    right: number;
    top: number;
    bottom: number;
};

/**
 * MiniGame2ScreenController
 * 
 * Objects can be picked up and dropped with 'P' key.
 * Only one object can be carried at a time.
 */
export class MiniGame2ScreenController extends ScreenController {
    private model: MiniGame2ScreenModel;
    private view: MiniGame2ScreenView;
    private screenSwitcher: ScreenSwitcher;
    private input!: InputManager;
    private player!: Player;
    private robot?: Robot;
    private gameObjects: Map<string, GameObject> = new Map(); // Map name to GameObject
    private dropSlots: DropSlotState[] = [];
    private celebrationTriggered = false;
    private readonly EDGE_THRESHOLD = 10;
    private readonly PICKUP_DISTANCE = 50;
    private readonly PICKUP_COLUMN_X = 140;
    private readonly SLOT_COLUMN_X = STAGE_WIDTH - 520;
    private readonly PICKUP_START_Y = 160;
    private readonly SLOT_START_Y = 60;
    private readonly TEXT_WIDTH = 440;
    private readonly TEXT_FONT_SIZE = 16;
    private readonly CUBE_SIZE = 42;
    private readonly CUBE_SPACING = 16;
    private readonly SLOT_VERTICAL_GAP = 30;
    private readonly BASE_SLOT_HEIGHT = 60;
    private moveSound?: HTMLAudioElement;
    private moveSoundPlaying = false;
    private readonly COUNTDOWN_MS = 60000;
    private timerInterval?: number;
    private timerTimeout?: number;
    static completed = false;

    constructor(screenSwitcher: ScreenSwitcher) {
        super();
        this.screenSwitcher = screenSwitcher;
        this.model = new MiniGame2ScreenModel();
        this.view = new MiniGame2ScreenView();
        this.view.setIntroHandler(this.beginMiniGame);
    }

    /* Load Map and spawn objects */
    async init(): Promise<void> {
        try {
            const mapData = await this.loadMap("/maps/porj0.json");
            const playerImage = await this.loadImage("/sprites/idle-frame1.png");
            const robotImage = await this.loadImage("/sprites/idle-frame1.png");

            this.player = new Player("player1", STAGE_WIDTH / 2, 80, playerImage);
            this.robot = new Robot("companion-robot", 100, 10, STAGE_WIDTH / 2, 120, robotImage);
            this.moveSound = audioManager.createSfxInstance("movement", { volume: 0.15 });
            this.resetState();

            this.setupTextSnippets();

            await this.view.build(
                mapData,
                this.player,
                Array.from(this.gameObjects.values()),
                this.loadImage.bind(this)
            );
            if (this.robot) {
                this.view.getEntityGroup().add(this.robot.getCurrentImage());
            }
            this.view.renderDropSlots(this.getDropSlotVisuals());
            this.reflowSlotPositions();
        } catch (err) {
            console.error("Failed to init MiniGame2:", err);
        }
    }

    startMiniGame(): void {
        if (MiniGame2ScreenController.completed) {
            this.screenSwitcher.switchToScreen({ type: "exploration" });
            return;
        }
        this.model.setRunning(false);
        this.input = new InputManager();
        this.view.show();
        this.view.showIntro();
    }

    private beginMiniGame = (): void => {
        this.view.hideIntro();
        this.model.setRunning(true);
        this.startTimer();
        requestAnimationFrame(this.miniGameLoop);
    };

    hide(): void {
        this.model.setRunning(false);
        this.stopTimer();
        this.view.hide();
    }

    /* MiniGame game loop */
    private miniGameLoop = (): void => {
        if (!this.model.isRunning()) return;

        if (!this.player) {
            console.error("MiniGame2 player not initialized");
            return;
        }

        const { dx, dy } = this.input.getDirection();
        this.player.setSpeed(this.input.isSprinting() ? 10 : 6);
        const playerImg = this.player.getCurrentImage();

        // Move player
        const prevPos = playerImg.position();
        this.player.move(dx, dy);

        // Get new position after movement
        const newX = playerImg.x();
        const newY = playerImg.y();

        const moved = (dx !== 0 || dy !== 0) && (newX !== prevPos.x || newY !== prevPos.y);
        if (moved) {
            if (this.moveSound && !this.moveSoundPlaying) {
                this.moveSound.currentTime = 0;
                this.moveSoundPlaying = true;
                this.moveSound.onended = () => { this.moveSoundPlaying = false; };
                void this.moveSound.play().catch(() => { this.moveSoundPlaying = false; });
            }
        } else if (this.moveSound && this.moveSoundPlaying) {
            this.moveSound.pause();
            this.moveSound.currentTime = 0;
            this.moveSoundPlaying = false;
        }

        // Update carried object position to follow player
        this.updateCarriedObjectPosition(newX, newY);

        // Boundary checks
        const maxX = STAGE_WIDTH - playerImg.width();
        const maxY = STAGE_HEIGHT - playerImg.height();
        if (newX < 0) playerImg.x(0);
        if (newX > maxX) playerImg.x(maxX);
        if (newY < 0) playerImg.y(0);
        if (newY > maxY) playerImg.y(maxY);
        if (newY <= 0) {
            playerImg.y(0);
            this.model.setRunning(false);
            this.hide();
            this.screenSwitcher.switchToScreen({ type: "exploration" });
            return;
        }

        // Check if 'P' key is pressed for pickup/drop
        const interact = this.input.getInteract();
        if (interact) {
            this.handleInteraction();
        }

        if (this.robot) {
            const rx = this.robot.getCurrentImage().x();
            const ry = this.robot.getCurrentImage().y();
            const dxToPlayer = newX - rx;
            const dyToPlayer = newY - ry;
            const dist = Math.sqrt(dxToPlayer * dxToPlayer + dyToPlayer * dyToPlayer);
            const desiredOffset = 20;
            if (dist > desiredOffset) {
                const step = Math.min(2.5, dist - desiredOffset);
                const nx = rx + (dxToPlayer / dist) * step;
                const ny = ry + (dyToPlayer / dist) * step;
                this.robot.moveTo(nx, ny);
            }
        }

        // Redraw the main layer; App exposes redraw() instead of a dedicated mini-game entity redraw
        this.screenSwitcher.redraw();
        requestAnimationFrame(this.miniGameLoop);
    };

    private startTimer(): void {
        this.stopTimer();
        let remaining = this.COUNTDOWN_MS;
        this.view.updateTimer(Math.ceil(remaining / 1000));
        this.timerInterval = window.setInterval(() => {
            remaining -= 1000;
            if (remaining <= 0) {
                this.failDueToTimeout();
            } else {
                this.view.updateTimer(Math.ceil(remaining / 1000));
            }
        }, 1000);
        this.timerTimeout = window.setTimeout(() => this.failDueToTimeout(), this.COUNTDOWN_MS);
    }

    private stopTimer(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = undefined;
        }
        if (this.timerTimeout) {
            clearTimeout(this.timerTimeout);
            this.timerTimeout = undefined;
        }
    }

    private failDueToTimeout(): void {
        if (!this.model.isRunning()) return;
        this.model.setRunning(false);
        this.stopTimer();
        this.view.showFailureMessage("Time's up! You failed to finish in 60s.");
        setTimeout(() => {
            this.view.hideFailureMessage();
            this.hide();
            this.screenSwitcher.switchToScreen({ type: "exploration" });
        }, 2000);
    }

    private resetState(): void {
        this.model.reset();
        this.gameObjects.clear();
        this.dropSlots = [];
        this.celebrationTriggered = false;
    }

    /**
     * Handle pickup/drop interaction with 'P' key
     */
    private handleInteraction(): void {
        const playerImg = this.player.getCurrentImage();
        const playerX = playerImg.x();
        const playerY = playerImg.y();
        const playerBounds: RectBounds = {
            left: playerX,
            right: playerX + playerImg.width(),
            top: playerY,
            bottom: playerY + playerImg.height(),
        };

        // If carrying something, try to drop it
        if (this.model.isCarryingSomething()) {
            const carriedItemName = this.model.getCurrentlyCarriedItem();
            if (carriedItemName) {
                const placed = this.attemptSlotPlacement(carriedItemName);
                if (placed) {
                    return;
                }

                const droppedItem = this.model.dropObject();
                if (droppedItem) {
                    const obj = this.gameObjects.get(droppedItem);
                    if (obj) {
                        // Drop at player's current position
                        obj.moveTo(playerX, playerY);
                        obj.show();
                        obj.showCubeAppearance();
                        obj.setHighlight('idle');
                    }
                }
            }
            return;
        }

        // If not carrying anything, try to pick up nearby object
        for (const [name, obj] of this.gameObjects.entries()) {
            // Skip if not idle
            if (!this.model.isObjectIdle(name) || !obj.isInteractable()) continue;

            const expandedBounds = this.expandBounds(this.getObjectBounds(obj), this.PICKUP_DISTANCE);

            // If player intersects expanded object bounds, pick up the object
            if (this.rectanglesTouch(playerBounds, expandedBounds)) {
                this.clearSlotOccupancy(name);
                // Mark as carried in model
                this.model.carryObject(name);
                
                // Position it above player
                obj.show();
                obj.showTextAppearance();
                const objSize = obj.getSize();
                const playerWidth = playerImg.width();
                const offsetX = playerX + playerWidth / 2 - objSize.width / 2;
                const offsetY = playerY - objSize.height - 10;
                obj.moveTo(offsetX, offsetY);
                
                // Update UI
                audioManager.playSfx("object_collect");

                // Only pick up one item per 'P' press
                return;
            }
        }
    }

    /**
     * Update position of carried object to follow the player
     */
    private updateCarriedObjectPosition(playerX: number, playerY: number): void {
        const carriedItemName = this.model.getCurrentlyCarriedItem();
        if (carriedItemName) {
            const obj = this.gameObjects.get(carriedItemName);
            if (obj) {
                const objSize = obj.getSize();
                const playerImg = this.player.getCurrentImage();
                const playerWidth = playerImg ? playerImg.width() : 0;
                const offsetX = playerX + playerWidth / 2 - objSize.width / 2;
                const offsetY = playerY - objSize.height - 10;
                obj.moveTo(offsetX, offsetY);
            }
        }
    }

    private setupTextSnippets(): void {
        const shuffledSnippets = this.getShuffledSnippets();
        const pickupPositions = this.getPickupPositions(shuffledSnippets.length);

        for (let i = 0; i < shuffledSnippets.length; i++) {
            const snippet = shuffledSnippets[i];
            const pos = pickupPositions[i];
            const textObject = new GameObject(
                snippet.id,
                pos.x,
                pos.y,
                true
            );
            textObject.setTextSprite(snippet.text, {
                width: this.TEXT_WIDTH,
                fontSize: this.TEXT_FONT_SIZE,
                fontFamily: "Courier New",
                textColor: "#f8fafc",
                backgroundColor: "#14213d",
                borderColor: "#5ac8fa",
            });

            this.gameObjects.set(snippet.id, textObject);
            this.model.addObject(snippet.id);
        }

        let slotY = this.SLOT_START_Y;
        for (const snippet of TEXT_SNIPPETS) {
            this.dropSlots.push({
                id: `slot-${snippet.id}`,
                label: snippet.label,
                expectedSnippetId: snippet.id,
                position: { x: this.SLOT_COLUMN_X, y: slotY },
                width: this.TEXT_WIDTH,
                height: this.BASE_SLOT_HEIGHT,
                occupiedBy: null,
                status: 'empty',
            });
            slotY += this.BASE_SLOT_HEIGHT + this.SLOT_VERTICAL_GAP;
        }
    }

    private getPickupPositions(count: number): Array<{ x: number; y: number }> {
        const pool = [...PICKUP_POSITION_TEMPLATES];
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }

        const positions: Array<{ x: number; y: number }> = [];
        while (positions.length < count) {
            if (pool.length > 0) {
                positions.push(pool.pop()!);
            } else {
                const fallbackY =
                    this.PICKUP_START_Y + positions.length * (this.CUBE_SIZE + this.CUBE_SPACING);
                positions.push({ x: this.PICKUP_COLUMN_X, y: fallbackY });
            }
        }
        return positions;
    }

    private getShuffledSnippets(): TextSnippetDefinition[] {
        const arr = [...TEXT_SNIPPETS];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    private getDropSlotVisuals(): Array<{
        id: string;
        x: number;
        y: number;
        width: number;
        height: number;
        label: string;
    }> {
        return this.dropSlots.map((slot) => ({
            id: slot.id,
            x: slot.position.x,
            y: slot.position.y,
            width: slot.width,
            height: slot.height,
            label: slot.label,
        }));
    }

    private reflowSlotPositions(): void {
        let currentY = this.SLOT_START_Y;
        for (const slot of this.dropSlots) {
            if (!slot.occupiedBy) {
                slot.width = this.TEXT_WIDTH;
                slot.height = this.BASE_SLOT_HEIGHT;
            }
            const height = slot.height ?? this.BASE_SLOT_HEIGHT;
            slot.position.y = currentY;

            this.view.updateDropSlotLayout(slot.id, {
                x: slot.position.x,
                y: slot.position.y,
                width: slot.width,
                height,
            });

            if (slot.occupiedBy) {
                const obj = this.gameObjects.get(slot.occupiedBy);
                if (obj) {
                    obj.moveTo(slot.position.x, slot.position.y);
                    obj.showTextAppearance();
                }
            } else {
                this.view.updateDropSlotState(slot.id, {
                    filled: false,
                    status: 'empty',
                    width: slot.width,
                    height,
                });
            }

            currentY += height + this.SLOT_VERTICAL_GAP;
        }
    }

    private attemptSlotPlacement(objectName: string): boolean {
        const obj = this.gameObjects.get(objectName);
        if (!obj) return false;

        const objBounds = this.getObjectBounds(obj);
        let targetSlot: DropSlotState | null = null;

        for (const slot of this.dropSlots) {
            if (slot.occupiedBy) continue;
            const slotBounds = this.getSlotBounds(slot);
            if (this.rectanglesTouch(objBounds, slotBounds)) {
                targetSlot = slot;
                break;
            }
        }

        if (!targetSlot) {
            return false;
        }

        const correctPlacement = targetSlot.expectedSnippetId === objectName;

        obj.moveTo(targetSlot.position.x, targetSlot.position.y);
        obj.show();
        obj.showTextAppearance();
        targetSlot.occupiedBy = objectName;
        const objSize = obj.getSize();
        targetSlot.width = this.TEXT_WIDTH;
        targetSlot.height = objSize.height;
        targetSlot.status = correctPlacement ? 'correct' : 'incorrect';
        obj.setHighlight(correctPlacement ? 'correct' : 'incorrect');

        if (correctPlacement) {
            this.model.deliverObject(objectName);
        } else {
            this.model.dropObject();
        }

        this.view.updateDropSlotState(targetSlot.id, {
            filled: true,
            width: targetSlot.width,
            height: targetSlot.height,
            status: targetSlot.status,
        });
        this.reflowSlotPositions();

        if (!this.celebrationTriggered && this.allSlotsCorrect()) {
            this.celebrationTriggered = true;
            this.view.showConfetti();
            this.model.setRunning(false);
            this.stopTimer();
            MiniGame2ScreenController.completed = true;
            setTimeout(() => {
                this.hide();
                this.screenSwitcher.switchToScreen({ type: "exploration" });
            }, 1500);
        }
        return true;
    }

    private allSlotsCorrect(): boolean {
        return this.dropSlots.every((slot) => slot.status === 'correct') && this.model.allObjectsDelivered();
    }

    private getObjectBounds(obj: GameObject): RectBounds {
        const objPos = obj.getPosition();
        const objSize = obj.getSize();
        return {
            left: objPos.x,
            right: objPos.x + objSize.width,
            top: objPos.y,
            bottom: objPos.y + objSize.height,
        };
    }

    private getSlotBounds(slot: DropSlotState): RectBounds {
        return {
            left: slot.position.x,
            right: slot.position.x + slot.width,
            top: slot.position.y,
            bottom: slot.position.y + slot.height,
        };
    }

    private expandBounds(bounds: RectBounds, padding: number): RectBounds {
        return {
            left: bounds.left - padding,
            right: bounds.right + padding,
            top: bounds.top - padding,
            bottom: bounds.bottom + padding,
        };
    }

    private rectanglesTouch(a: RectBounds, b: RectBounds): boolean {
        return (
            a.left <= b.right &&
            a.right >= b.left &&
            a.top <= b.bottom &&
            a.bottom >= b.top
        );
    }

    private clearSlotOccupancy(objectName: string): void {
        let changed = false;
        for (const slot of this.dropSlots) {
            if (slot.occupiedBy === objectName && slot.status !== 'correct') {
                slot.occupiedBy = null;
                slot.status = 'empty';
                slot.width = this.TEXT_WIDTH;
                slot.height = this.BASE_SLOT_HEIGHT;
                this.view.updateDropSlotState(slot.id, {
                    filled: false,
                    status: 'empty',
                    width: slot.width,
                    height: slot.height,
                });
                const obj = this.gameObjects.get(objectName);
                if (obj) {
                    obj.showCubeAppearance();
                    obj.setHighlight('idle');
                }
                changed = true;
            }
        }
        if (changed) {
            this.reflowSlotPositions();
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

    getView(): MiniGame2ScreenView {
        return this.view;
    }

    /**
     * Get delivered items to pass to next screen
     */
    getDeliveredItems(): string[] {
        return this.model.getDeliveredItems();
    }
}
