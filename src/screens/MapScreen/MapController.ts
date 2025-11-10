import type { MapModel } from './MapModel';
import type { MapView } from './MapView';

export abstract class MapController {
	private mapModel: MapModel;
	private mapView: MapView;
	// private screenSwitcher: Screen;

	constructor(
		mapModel: MapModel,
		mapView: MapView,
		// screenSwitcher: Screen
	) {
		this.mapModel = mapModel;
		this.mapView = mapView;
		// this.screenSwitcher = screenSwitcher;
	}

    public getModel() : MapModel {
        return this.mapModel;
    }    

	getView(): MapView {
		return this.mapView;
	}

	show(): void {
		this.mapView.show();
	}

	hide(): void {
		this.mapView.hide();
	}
}
