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
	private backgroundImage: string;
	public ROBOT_PARTS: RobotPart[];

	constructor(
		width: number,
		height: number,
		backgroundImage: string,
		robotParts: RobotPart[],
	) {
		this.width = width;
		this.height = height;
		this.backgroundImage = backgroundImage;
		this.ROBOT_PARTS = robotParts;
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

	getBackgroundImage(): string {
		return this.backgroundImage;
	}
}
