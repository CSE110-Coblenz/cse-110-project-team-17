import Konva from "konva";
import type { ScreenSwitcher, Screen } from "./types.ts";
import { MenuScreenController } from "./screens/MenuScreen/MenuScreenController.ts";
import { ExplorationScreenController } from "./screens/ExplorationScreen/ExplorationScreenController.ts";
import { CombatScreenController } from "./screens/CombatScreen/CombatScreenController.ts";
import { ResultsScreenController } from "./screens/ResultsScreen/ResultsScreenController.ts";
import { PokemonScreenController } from "./screens/MiniGame1/PokemonScreenController.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants.ts";

/**
 * Main Application - Coordinates all screens
 */
export class App implements ScreenSwitcher {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private entityLayer: Konva.Layer;

    private menuController: MenuScreenController;
    private explorationController: ExplorationScreenController;
    private combatController: CombatScreenController;
    private resultsController: ResultsScreenController;
    private pokemonController: PokemonScreenController;

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
        this.combatController = new CombatScreenController(this);
        this.resultsController = new ResultsScreenController(this);
        this.pokemonController = new PokemonScreenController(this);

        // Load both screens
        this.explorationController.init();
        this.combatController.init();

        // Add all screen groups to layers
        this.layer.add(this.menuController.getView().getGroup());
        this.layer.add(this.explorationController.getView().getGroup());
        this.layer.add(this.combatController.getView().getGroup());
        this.layer.add(this.resultsController.getView().getGroup());
        this.layer.add(this.pokemonController.getView().getGroup());

        // Add entity groups
        this.entityLayer.add(this.explorationController.getView().getEntityGroup());
        this.entityLayer.add(this.combatController.getView().getEntityGroup());

        // Draw layers
        this.layer.draw();
        this.entityLayer.draw();

        // Start with menu screen
        // this.menuController.getView().show();
        this.pokemonController.getView().show();
    }

    switchToScreen(screen: Screen): void {
        // Hide all screens
        this.menuController.hide();
        this.explorationController.hide();
        this.combatController.hide();
        this.resultsController.hide();
        this.pokemonController.hide();

        // Show requested screen
        switch (screen.type) {
            case "menu":
                this.menuController.show();
                break;

            case "exploration":
                this.explorationController.startExploration();
                break;

            case "combat":
                this.combatController.startCombat();
                break;

            case "result":
                this.resultsController.showResults(screen.score);
                break;
            
            case "pokemon":
                this.pokemonController.show();
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
new App("container").switchToScreen({ type: "pokemon" });
