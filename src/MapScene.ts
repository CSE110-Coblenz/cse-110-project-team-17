// Map size constants
const MAP_WIDTH = 1280;
const MAP_HEIGHT = 720;

// Placeholder background image path
const MAP_BACKGROUND_IMAGE = 'assets/map-background.png';

// Robot part interface
interface RobotPart {
  name: string
}

interface Position {
    x: number;
    y: number;
}

class MapScene {
  private width: number;
  private height: number;
  private backgroundImage: string;
  // List of robot parts
  private ROBOT_PARTS: RobotPart[]

  constructor() {
    this.width = MAP_WIDTH;
    this.height = MAP_HEIGHT;
    this.backgroundImage = MAP_BACKGROUND_IMAGE;
    this.ROBOT_PARTS = [
      {name: "Left Arm"},
      {name: "Right Arm"},
      {name: "Left leg"},
      {name: "Right leg"},
      {name: "Body"},
      {name: "Head"},
    ];
  }

  /**
   * Transfers a robot part by name, removing and returning it from the list
   * @param name - The name of the robot part to transfer
   * @returns The robot part if found, null otherwise
   */
  transferPart(name: string): RobotPart | null {
    const index = this.ROBOT_PARTS.findIndex(part => part.name === name);
    if (index !== -1) {
      return this.ROBOT_PARTS.splice(index, 1)[0];
    }
    return null;
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
