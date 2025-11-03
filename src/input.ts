/* Input Manager class is instantiated, the constructor creates two */
/* event listeners that keep track of which button is pressed using */
/* <key, value> pair ==> <String, boolean>                          */

/* getDirection() function determines the direction of the sprite's movement */
/* given what keys are pressed                                               */
/* (if "w" and "s" are pressed at the same time sprite does not move)        */

export class InputManager {
  private keys: Record<string, boolean> = {};
  private attack: boolean = false;

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
}