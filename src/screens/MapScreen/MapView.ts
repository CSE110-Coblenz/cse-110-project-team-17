import { Group } from 'konva/lib/Group';

export abstract class MapView {
    private group: Group;

    constructor(konvaGroup: Group) {
        this.group = konvaGroup;
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

    getGroup(): Group {
        return this.group;
    }
}
