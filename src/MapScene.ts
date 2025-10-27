// Map size constants
const MAP_WIDTH = 1280;
const MAP_HEIGHT = 720;

// Placeholder background image path
const MAP_BACKGROUND_IMAGE = 'assets/map-background.png';

// Robot part interface
interface RobotPart {
  name: string
}

// List of robot parts
const ROBOT_PARTS: RobotPart[] = [
  {name: "Left Arm"},
  {name: "Right Arm"},
  {name: "Left leg"},
  {name: "Right leg"},
  {name: "Body"},
  {name: "Head"},
];

interface Position {
    x: number;
    y: number;
}

class MapScene {
  private width: number;
  private height: number;
  private backgroundImage: string;

  constructor() {
    this.width = MAP_WIDTH;
    this.height = MAP_HEIGHT;
    this.backgroundImage = MAP_BACKGROUND_IMAGE;
  }

  /**
   * Checks if a player position is within the bounds of the map
   * @param position - The player's position {x, y}
   * @returns true if the player is within bounds, false otherwise
   */
  isEntityWithinBounds(position: Position): boolean {
    return (
      position.x >= 0 &&
      position.x <= this.width &&
      position.y >= 0 &&
      position.y <= this.height
    );
  }

  /**
   * Gets the map width
   */
  getWidth(): number {
    return this.width;
  }

  /**
   * Gets the map height
   */
  getHeight(): number {
    return this.height;
  }

  /**
   * Gets the background image path
   */
  getBackgroundImage(): string {
    return this.backgroundImage;
  }
}

export default MapScene;
