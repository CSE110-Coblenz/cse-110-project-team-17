import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { MenuScreenView } from "./MenuScreenView.ts";
import type { MenuAssets } from "./MenuScreenView.ts"; 

/**
 * MenuScreenController - Handles menu interactions
 */
export class MenuScreenController extends ScreenController {
    private view: MenuScreenView; 
    private screenSwitcher: ScreenSwitcher;
    private initializationPromise: Promise<void>; // Tracks when the menu is ready to be displayed

    constructor(screenSwitcher: ScreenSwitcher) {
        super();
        this.screenSwitcher = screenSwitcher;
        this.view = new MenuScreenView(() => this.handleStartClick());
        this.initializationPromise = this.initialize();
    }
    
    /**
     * loads assets and initializes the view of the menu screen
     */
    private async initialize(): Promise<void> {
        console.log("MenuScreenController: Starting asset loading...");
        const assets: MenuAssets = await MenuScreenView.loadAssets();
        this.view.initialize(assets);     
        console.log("MenuScreenController: View initialized successfully.");
    }

    /**
     * Handle start button click
     */
    private handleStartClick(): void {
        this.screenSwitcher.switchToScreen({type: "exploration"});
    }

    /**
     * Get the view.
     */
    getView(): MenuScreenView {
        return this.view;
    }
    
    /**
     * awaits the initialization of the menu screen
     */
    getInitializationPromise(): Promise<void> {
        return this.initializationPromise;
    }
}
