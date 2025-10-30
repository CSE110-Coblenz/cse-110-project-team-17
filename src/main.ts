import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "./constants.ts";
// import { MapController } from "";

export class Screen {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    
    // TODO: create instance variable for every class that implements MapController
    // private __mapController: __MapController;

    constructor(container: string) {
        // Initialize Konva stage (the main canvas)
        this.stage = new Konva.Stage({
            container,
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
        });

        // Create a layer (screens will be added to this layer)
        this.layer = new Konva.Layer();
		this.stage.add(this.layer);

        // TODO: initialize every controller class
        // this.__mapController = new __mapController(this);

        // TODO: add every controller view to the layer
        // this.layer.add(this.__mapController.getView().getGroup());

        // Draw the layer (render everything to the canvas)
        this.layer.draw();

        // TODO: show the first screen (probably the menu)
        // this.mapController.getView().show();
    }

    /**
	 * Switch to a different screen
	 *
	 * This method implements screen management by:
	 * 1. Hiding all screens (setting their Groups to invisible)
	 * 2. Showing only the requested screen
	 *
	 * This pattern ensures only one screen is visible at a time.
	 */
	switchToScreen(screen: string): void {
		// Hide all screens first by setting their Groups to invisible
		// TODO: call hide on each screen controller
        // this.menuController.hide();
		// this.gameController.hide();
		// this.resultsController.hide();

		// Show the requested screen based on the screen type
		switch (screen) {
			// TODO: add case for each screen
            
            // case "menu":
			// 	this.menuController.show();
			// 	break;

			// case "game":
			// 	// Start the game (which also shows the game screen)
			// 	this.gameController.startGame();
			// 	break;

			// case "result":
			// 	// Show results with the final score
			// 	this.resultsController.showResults(screen.score);
			// 	break;
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
}

new Screen("container");