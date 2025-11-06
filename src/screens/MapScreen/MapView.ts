import { Group } from 'konva/lib/Group';
import type { View } from '../../types';
import type { MapModel } from './MapModel';

export abstract class MapView implements View {
    protected _model: MapModel

    constructor(model: MapModel) {
        this._model = model;
    }

    /**
     * Show the screen
     */
    abstract show(): void;

    /**
     * Hide the screen
     */
    abstract hide(): void;

    abstract getGroup(): Group;

    abstract getMapGroup(): Group;

    abstract getEntityGroup(): Group;
}