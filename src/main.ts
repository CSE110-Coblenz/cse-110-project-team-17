import Konva from "konva";
import type { ScreenSwitcher, Screen } from "./types.ts";
import { MenuScreenController } from "./screens/MenuScreen/MenuScreenController.ts";
import { ExplorationScreenController } from "./screens/ExplorationScreen/ExplorationScreenController.ts";
import { MiniGame2ScreenController } from "./screens/MiniGame2Screen/MiniGame2ScreenController.ts";
import { CombatScreenController } from "./screens/CombatScreen/CombatScreenController.ts";
import { ResultsScreenController } from "./screens/ResultsScreen/ResultsScreenController.ts";
import { EducationScreenController } from "./screens/EducationScreen/EducationScreenController.ts";
import { PokemonScreenController } from "./screens/MiniGame1/PokemonScreenController.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants.ts";
import { audioManager } from "./audioManager.ts";

/**
 * Main Application - Coordinates all screens
 */
export class App implements ScreenSwitcher {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private explorationLayer: Konva.Layer;
    private combatLayer: Konva.Layer;
    private playerLayer: Konva.Layer;
    private miniLayer: Konva.Layer;

    private menuController: MenuScreenController;
    private explorationController: ExplorationScreenController;
    private miniGame2Controller: MiniGame2ScreenController;
    private combatController: CombatScreenController;
    private resultsController: ResultsScreenController;
	private educationController: EducationScreenController;
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

        this.explorationLayer = new Konva.Layer();
        this.stage.add(this.explorationLayer);

        this.combatLayer = new Konva.Layer();
        this.stage.add(this.combatLayer);

        this.playerLayer = new Konva.Layer();
        this.stage.add(this.playerLayer);

        this.miniLayer = new Konva.Layer();
        this.stage.add(this.miniLayer);

        // Initialize all screen controllers
        this.menuController = new MenuScreenController(this);
        this.miniGame2Controller = new MiniGame2ScreenController(this);
        this.combatController = new CombatScreenController(this);
		this.educationController = new EducationScreenController();
        this.explorationController = new ExplorationScreenController(this, this.educationController);
        this.resultsController = new ResultsScreenController(this);
        this.pokemonController = new PokemonScreenController(this);

        // Load exploration controller screen 
        this.explorationController.init();
        this.miniGame2Controller.init();    
        this.combatController.init();

        // Add all screen groups to layers
        this.layer.add(this.menuController.getView().getGroup());
        this.layer.add(this.explorationController.getView().getGroup());
        this.layer.add(this.miniGame2Controller.getView().getGroup());
        this.layer.add(this.combatController.getView().getGroup());
        this.layer.add(this.resultsController.getView().getGroup());
		this.layer.add(this.educationController.getView().getGroup());
        this.layer.add(this.pokemonController.getView().getGroup());

        // Add entity groups
        // this.entityLayer.add(this.explorationController.getView().getEntityGroup());
        this.miniLayer.add(this.miniGame2Controller.getView().getEntityGroup());
        // this.entityLayer.add(this.combatController.getView().getEntityGroup());
        /* ENTITY LAYER = (EXPLORATION)+(PLAYER)+(COMBAT) */
        this.explorationLayer.add(this.explorationController.getView().getEntityGroup());
        this.playerLayer.add(this.explorationController.getView().getPlayerGroup());
        //this.combatLayer.add(this.combatController.getView().getEntityGroup());

        // Draw layers
        this.layer.draw();
        this.explorationLayer.draw();
        this.playerLayer.draw();
        this.combatLayer.draw();

        // Start with menu screen
        this.menuController.getView().show();
        audioManager.playTrack("menu");
    }

    async switchToScreen(screen: Screen): Promise<void> {
        // Hide all screens
        this.menuController.hide();
        this.explorationController.hide();
        this.miniGame2Controller.hide();
        this.combatController.hide();
        if (this.combatController) {
            this.combatController.hide();
        }
        this.resultsController.hide();
		    this.educationController.hide();
        this.pokemonController.hide();

        // Show requested screen
        switch (screen.type) {
            case "menu":
                this.menuController.show();
                audioManager.playTrack("menu");
                break;

            case "exploration":
                this.explorationController.startExploration();
                audioManager.playTrack("exploration");
                break;

            case "minigame2":
                this.miniGame2Controller.startMiniGame();
                audioManager.playTrack("minigame2");
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
                this.combatLayer.add(this.combatController.getView().getEntityGroup());

                // Start combat
                this.combatController.startCombat();
                audioManager.playTrack("combat");
                break;

            case "result":
                this.resultsController.showResults(screen.score);
                audioManager.playTrack("result");
                break;
			  case "education":
				   this.educationController.show();
				   break;
        
            case "pokemon":
                this.pokemonController.startCombat();
                audioManager.playTrack("pokemon");
                break;
        }
    }

    redraw(): void {
        this.layer.batchDraw();
    }

    getLayer(): Konva.Layer {
        return this.layer;
    }

    redrawExplorationPlayer(): void {
        this.playerLayer.batchDraw();
    }

    redrawCombatEntities(): void {
        this.combatLayer.batchDraw();
    }

    redrawMiniLayer(): void {
        this.miniLayer.batchDraw();
    }

    getExplorationLayer(): Konva.Layer {
        return this.explorationLayer;
    }

    getCombatLayer(): Konva.Layer {
        return this.combatLayer;
    }
}

// Initialize the application
new App("container");
