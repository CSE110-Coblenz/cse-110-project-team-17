import Konva from "konva";
import type { ScreenSwitcher, Screen } from "./types.ts";
import { MenuScreenController } from "./screens/MenuScreen/MenuScreenController.ts";
import { ExplorationScreenController } from "./screens/ExplorationScreen/ExplorationScreenController.ts";
import { CombatScreenController } from "./screens/CombatScreen/CombatScreenController.ts";
import { ResultsScreenController } from "./screens/ResultsScreen/ResultsScreenController.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants.ts";

/**
 * Main Application - Coordinates all screens
 */
class App implements ScreenSwitcher {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private entityLayer: Konva.Layer;

    private menuController: MenuScreenController;
    private explorationController: ExplorationScreenController;
    private combatController: CombatScreenController | null = null;
    private resultsController: ResultsScreenController;

    constructor(container: string) {
        // Initialize Konva stage
        this.stage = new Konva.Stage({
            container,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
        });

        // Create layers
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);

        this.entityLayer = new Konva.Layer();
        this.stage.add(this.entityLayer);

        // Initialize all screen controllers
        this.menuController = new MenuScreenController(this);
        this.explorationController = new ExplorationScreenController(this);
        this.resultsController = new ResultsScreenController(this);

        // Load exploration screen
        this.explorationController.init();

        // Add screen groups to layers
        this.layer.add(this.menuController.getView().getGroup());
        this.layer.add(this.explorationController.getView().getGroup());
        this.layer.add(this.resultsController.getView().getGroup());

        // Add entity groups
        this.entityLayer.add(this.explorationController.getView().getEntityGroup());

        // Draw layers
        this.layer.draw();
        this.entityLayer.draw();

        // Start with menu screen
        this.menuController.getView().show();
    }

    async switchToScreen(screen: Screen): Promise<void> {
        // Hide all screens
        this.menuController.hide();
        this.explorationController.hide();
        if (this.combatController) {
            this.combatController.hide();
        }
        this.resultsController.hide();

        // Show requested screen
        switch (screen.type) {
            case "menu":
                this.menuController.show();
                break;

            case "exploration":
                this.explorationController.startExploration();
                break;

            case "combat":
                console.log("Switching to combat screen");
                // Clean up old combat controller if it exists
                if (this.combatController) {
                    // CRITICAL: Stop the game loop first
                    this.combatController.cleanup();
                    
                    // Then destroy the visual elements
                    this.combatController.getView().getGroup().destroy();
                    this.combatController.getView().getEntityGroup().destroy();
                }

                // Create new combat controller
                this.combatController = new CombatScreenController(this);
                console.log("Initialized new CombatScreenController");
                await this.combatController.init();

                // Add to layers
                this.layer.add(this.combatController.getView().getGroup());
                this.entityLayer.add(this.combatController.getView().getEntityGroup());

                // Start combat
                this.combatController.startCombat();
                break;

            case "result":
                this.resultsController.showResults(screen.score);
                break;
        }
    }

    redraw(): void {
        this.layer.batchDraw();
    }

    getLayer(): Konva.Layer {
        return this.layer;
    }

    redrawEntities(): void {
        this.entityLayer.batchDraw();
    }

    getEntityLayer(): Konva.Layer {
        return this.entityLayer;
    }

    getStageWidth(): number {
        return STAGE_WIDTH;
    }

    getStageHeight(): number {
        return STAGE_HEIGHT;
    }
}

// Initialize the application
new App("container");