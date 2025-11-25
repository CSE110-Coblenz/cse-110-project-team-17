import Konva from "konva";
import type { View } from "../../types.ts";
import { STAGE_WIDTH } from "../../constants.ts";

// single image asset for the menu screen, Main_Menu.jpg
export interface MenuAssets {
    menuImage: HTMLImageElement;
}

/**
 * MenuScreenView - Renders the menu screen
 */
export class MenuScreenView implements View {
    private group: Konva.Group;
    private onStartClick: () => void; //store when click happens

    constructor(onStartClick: () => void) {
        this.group = new Konva.Group({ visible: true });
        this.onStartClick = onStartClick;
    }

    //shows the menu screen with the provided assets
    public initialize(assets: MenuAssets): void {
        const BUTTON_X = STAGE_WIDTH / 2 - 110;
        const BUTTON_Y = 440;
        const BUTTON_WIDTH = 250;
        const BUTTON_HEIGHT = 60;

        // the background image
        const background = new Konva.Image({
            image: assets.menuImage, 
            x: 0,
            y: 0,
            width: STAGE_WIDTH,
            height: 750,
            listening: false,
        });
        this.group.add(background);

        // Create a transparent rectangle for the "Start" button
        const startHotspot = new Konva.Rect({
            x: BUTTON_X,
            y: BUTTON_Y,
            width: BUTTON_WIDTH,
            height: BUTTON_HEIGHT,
            stroke: 'transparent',
            fill: 'transparent',
            cursor: 'pointer',
        });
        
        // Attach the click handler to the transparent hotspot
        startHotspot.on("click", this.onStartClick);
        this.group.add(startHotspot);

        startHotspot.on('mouseover', () => {
            document.body.style.cursor = 'pointer';
        });

        startHotspot.on('mouseout', () => {
            document.body.style.cursor = 'default';
        });
    }

    // Load the image asset for the menu screen
    static loadAssets(): Promise<MenuAssets> {
        return new Promise((resolve) => {
            const menuImageUrl = "/public/Menu/Main_Menu.jpg";
            const menuImg = new window.Image();
            menuImg.onload = () => {
                resolve({ menuImage: menuImg });
            };
            // just in case the image fails to load
            menuImg.onerror = () => {
                console.error(`Failed to load menu image from ${menuImageUrl}.`);
                resolve({ menuImage: new window.Image() }); 
            };
            menuImg.src = menuImageUrl;
        });
    }

    /**
     * Show the screen
     */
    show(): void {
        this.group.visible(true);
        this.group.getLayer()?.draw();
    }

    /**
     * Hide the screen
     */
    hide(): void {
        this.group.visible(false);
        this.group.getLayer()?.draw();
    }

    getGroup(): Konva.Group {
        return this.group;
    }
}
