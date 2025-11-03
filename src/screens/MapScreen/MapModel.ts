export type IllegalZone = [number, number, number, number];

export interface RobotPart {
	name: string;
}

export interface Position {
	x: number;
	y: number;
}

export abstract class MapModel {
	private width: number;
	private height: number;

	constructor(
		width: number,
		height: number,
	) {
		this.width = width;
		this.height = height;
	}

	isWithinBounds(position: Position): boolean {
		return (
			position.x >= 0 &&
			position.x <= this.width &&
			position.y >= 0 &&
			position.y <= this.height
		);
	}

	getWidth(): number {
		return this.width;
	}

	getHeight(): number {
		return this.height;
	}
}
