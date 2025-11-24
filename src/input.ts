
/* event listeners that keep track of which button is pressed using */
/* <key, value> pair ==> <String, boolean>                          */

/* getDirection() function determines the direction of the sprite's movement */
/* given what keys are pressed                                               */
/* (if "w" and "s" are pressed at the same time sprite does not move)        */

export class InputManager {
  private keys: Record<string, boolean> = {};
  private attack: boolean = false;
  private interact: boolean = false;  // Track 'P' key state
  private toggleDebug: boolean = false;

  constructor() {
    window.addEventListener("keydown", (e) => this.keys[e.key.toLowerCase()] = true);
    window.addEventListener("keyup", (e) => this.keys[e.key.toLowerCase()] = false);
  }

  getDirection() {
    let dx = 0, dy = 0;
    if (this.keys["w"]) dy -= 1;
    if (this.keys["s"]) dy += 1;
    if (this.keys["a"]) dx -= 1;
    if (this.keys["d"]) dx += 1;
    return { dx, dy };
  }

  isSprinting(): boolean {
    return !!this.keys["shift"];
  }
  
  getAttack(): boolean {
    if (this.keys[" "] && !this.attack) {
      this.attack = true;
      return true;
    }
    else if (this.keys[" "] && this.attack) {
      return false;
    }
    else {
      this.attack = false;
      return false;
    }
  }

  /**
   * Check if 'P' key is pressed for interaction
   * Returns true only once per key press (prevents multiple collections)
   */
  getInteract(): boolean {
    if (this.keys["p"] && !this.interact) {
      this.interact = true;
      return true;
    }
    else if (this.keys["p"] && this.interact) {
      return false;
    }
    else {
      this.interact = false;
      return false;
    }
  }

  getToggleDebug(): boolean {
    if (this.keys["g"] && !this.toggleDebug) {
      this.toggleDebug = true;
      return true;
    } else if (this.keys["g"] && this.toggleDebug) {
      return false;
    } else {
      this.toggleDebug = false;
      return false;
    }
  }
}
