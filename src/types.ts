import Konva from "konva";
import type { Group } from "konva/lib/Group";

export interface View {
	getGroup(): Group;
	show(): void;
	hide(): void;
}

/**
 * Screen types for navigation
 *
 * - "menu": Main menu screen
 * - "game": Gameplay screen
 * - "result": Results screen with final score
 *   - score: Final score to display on results screen
 */
export type Screen =
	| { type: "menu" }
	| { type: "exploration" }
	| { type: "combat" }
	| { type: "result"; score: number };

export abstract class ScreenController {
	abstract getView(): View;

	show(): void {
		this.getView().show();
	}

	hide(): void {
		this.getView().hide();
	}
}

export interface ScreenSwitcher {
	switchToScreen(screen: Screen): void;
	
	/* added these functions so that gameloop can update  */
	/* the main layer from the GameScreenController 	  */
	redraw(): void;
	getLayer(): Konva.Layer;
	redrawCombatEntities(): void;
	redrawExplorationPlayer(): void;
	getCombatLayer(): Konva.Layer;
}

/* Map interface, allows map to be built using mapData 	    */
/* --> mapData is created in the ScreenController 	   	    */
/* --> mapData holds parsed JSON data as JavaScript object  */
export interface Maps {
	buildMap(mapData: any): Promise<Konva.Group>;
}
