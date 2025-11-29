import Konva from "konva";

export class npc {
    private x: number;
    private y: number;
    private image: Konva.Image;

    // NPC Dialog/Trivia State
    private triviaFacts: string[];
    private dialogText?: Konva.Text;
    
    // Hold the single, non-changing trivia fact while in range
    private stickyTrivia: string | null = null;

    // Inactivity state
    private lastPlayerActivity = Date.now();
    private readonly INACTIVITY_LIMIT = 30000; // 30 seconds
    private isShowingHint = false;
    private dialogBackground?: Konva.Rect;

    private lingerEndTime: number = 0;
    private readonly LINGER_DURATION: number = 3000; // 3 seconds

    private robotBuilt: boolean = false;
    private allPartsCollected: boolean = false;

    private lastUpdate = 0;

    constructor(x: number, y: number, triviaFacts: string[], image: HTMLImageElement) {
        this.x = x;
        this.y = y;
        this.triviaFacts = triviaFacts;

        this.image = new Konva.Image({
            x: this.x,
            y: this.y,
            image: image,
            width: 16,
            height: 16,
        });
    }

    public setRobotBuilt(isBuilt: boolean): void {
        this.robotBuilt = isBuilt;
    }
    public setAllPartsCollected(isCollected: boolean): void {
        this.allPartsCollected = isCollected;
    }

    getCurrentImage() {
        return this.image;
    }

    getDialogPosition() {
        return { x: this.x - 100, y: this.y - 90 };
    }

    public showUrgentDialog(message: string): void {
        this.showDialog(message, true);
    }

    // Show urgent dialog that auto-hides after durationMs
    public showUrgentDialogFor(message: string, durationMs: number): void {
        this.showDialog(message, true);
        this.stickyTrivia = null;
        this.isShowingHint = false;
        this.lingerEndTime = Date.now() + durationMs;
    }

    public clearDialog(): void {
        this.hideDialog();
    }

    // Clears only the visual elements of the dialog,
    //used to make trivia persist without changing text.
    private clearDialogVisuals() {
        const layer = this.image.getLayer();

        if (this.dialogText) {
            this.dialogText.destroy();
            this.dialogText = undefined;
        }

        if (this.dialogBackground) {
            this.dialogBackground.destroy();
            this.dialogBackground = undefined;
        }

        if (layer) {
            // redraw immediately to remove visuals
            layer.batchDraw();
        }
    }

    // Hides the dialog and resets all related state.
    private hideDialog() {
        const layer = this.image.getLayer();

        if (this.dialogText) {
            this.dialogText.destroy();
            this.dialogText = undefined;
        }

        if (this.dialogBackground) {
            this.dialogBackground.destroy();
            this.dialogBackground = undefined;
        }

        if (layer) {
            layer.batchDraw();
        }

        this.isShowingHint = false;
        this.stickyTrivia = null;
        this.lingerEndTime = 0; // Reset the linger timer
    }

    private showDialog(text: string, isHint: boolean = false) {
        // If the same text is already showing, do nothing.
        if (this.dialogText?.text() === text) {
            this.isShowingHint = isHint;
            return;
        }

        // Clear existing dialog visuals
        this.clearDialogVisuals();

        const { x, y } = this.getDialogPosition();
        const PADDING = 4;
        const DIALOG_WIDTH = 300;

        const textNode = new Konva.Text({
            x: x + PADDING,
            y: y + PADDING,
            text: text,
            fontSize: 16,
            fontFamily: "Arial",
            fill: "white",
            padding: PADDING,
            align: "center",
            width: DIALOG_WIDTH - 2 * PADDING,
            lineHeight: 1.2,
        });

        const boxWidth = textNode.width() + 2 * PADDING;
        const boxHeight = textNode.height() + 2 * PADDING;

        this.dialogBackground = new Konva.Rect({
            x,
            y,
            width: boxWidth,
            height: boxHeight,
            fill: "rgba(0,0,0,0.85)",
            cornerRadius: 6,
        });

        this.dialogText = textNode;

        const layer = this.image.getLayer();
        if (layer) {
            layer.add(this.dialogBackground);
            layer.add(this.dialogText);
            layer.batchDraw();
        }

        this.isShowingHint = isHint;
    }

    // Marks the player as active, resetting inactivity timers.
    public markActive(): void {
        this.lastPlayerActivity = Date.now();
        if (this.isShowingHint) {
            this.startLinger(); 
        }
    }

    // Main update method to be called each frame.
    public updateDialog(playerX: number, playerY: number): void {
        const now = Date.now();
        if(now - this.lastUpdate < 500) return;
        this.lastUpdate = now;

        // If a dialog is currently lingering, check its timer.
        // If the linger time has passed, hide the dialog.
        if (this.lingerEndTime > 0) {
            if (now > this.lingerEndTime) {
                this.hideDialog();
            }
            return;
        }

        const distance = Math.sqrt((playerX - this.x) ** 2 + (playerY - this.y) ** 2);
        const PROXIMITY_LIMIT = 90;

        // Check for inactivity 
        if (!this.isShowingHint && now - this.lastPlayerActivity > this.INACTIVITY_LIMIT) {
            let hintMessage = "";
            if (this.robotBuilt) {
                // NEW: Post-robot inactivity message
                hintMessage = "Don't stop now! Let's keep exploring the other areas to unlock new capabilities.";
            } else if (this.allPartsCollected) {
                // Pre-robot inactivity message
                hintMessage = "You have all the pieces! Head to the workbench with the '!' mark and press 'P' to assemble the robot.";
            } else {
                // State 1: Default, pre-robot (Generic parts collection hint)
                hintMessage = "Don't forget to explore and find those robot parts!";
            }

            this.showDialog(hintMessage, true);
            this.isShowingHint = true;
            this.lastPlayerActivity = now;
            return;
        }

        // If inactivity is showing do not override it
        if (this.isShowingHint) return;

        // Player is far hide dialog
        if (distance > PROXIMITY_LIMIT) {
            this.hideDialog();
            return;
        }


        // Player is close enough for trivia
        if (this.stickyTrivia === null) {
            if (this.triviaFacts.length === 0) return;
            // choose and lock the trivia immediately
            const randomIndex = Math.floor(Math.random() * this.triviaFacts.length);
            this.stickyTrivia = this.triviaFacts[randomIndex];

            // Show the dialog exactly once for this newly-chosen trivia
            this.showDialog(this.stickyTrivia);
            return;
        }

        // If stickyTrivia is already chosen, only call showDialog if visuals differ.
        if (this.dialogText?.text() !== this.stickyTrivia) {
            this.showDialog(this.stickyTrivia);
        }
    }

    // Starts the linger timer for the inactivity and urgent dialogs.
    private startLinger(): void {
        this.isShowingHint = false; 
        this.stickyTrivia = null; 
        // Only start lingering if we aren't already
        if (this.lingerEndTime === 0) {
            this.lingerEndTime = Date.now() + this.LINGER_DURATION;
        }
    }

}