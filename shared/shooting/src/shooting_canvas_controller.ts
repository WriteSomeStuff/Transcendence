import type { ShootingCanvas, ShootingPlayerInput, Room } from "schemas";
import { ScoreController } from "./score_controller.ts";

export class ShootingCanvasController {
  private readonly shootingCanvas: ShootingCanvas;
  private scoreController: ScoreController;
  private readonly targetsDisappear: boolean;
  private readonly gameSpeed: number;

  public constructor(room: Room, scoreController: ScoreController) {
    if (room.gameData.game !== "shooting") {
      throw new Error("Invalid game data");
    }
    this.scoreController = scoreController;
    this.shootingCanvas = {
      width: 100,
      height: 100,
      target: null,
    };
    this.gameSpeed = room.gameData.options.gameSpeed;
    this.targetsDisappear = room.gameData.options.targetsDisappear;
  }

  public getShootingCanvas(): ShootingCanvas {
    return this.shootingCanvas;
  }

  public acceptInput(
    playerIndex: number,
    playerInput: ShootingPlayerInput,
  ): void {
    console.log("new input", playerIndex, playerInput);
    if (this.shootingCanvas.target === null) {
      return;
    }
    const distance = Math.hypot(
      playerInput.shootX - this.shootingCanvas.target.x,
      playerInput.shootY - this.shootingCanvas.target.y,
    );
    console.log(
      "input compared to target",
      playerIndex,
      this.shootingCanvas.target,
      "distance",
      distance,
    );
    if (distance < this.shootingCanvas.target.radius) {
      this.scoreController.onTargetHit(playerIndex);
      this.shootingCanvas.target = null;
    }
  }

  public update(delta: number): void {
    const doUpdate = Math.random() < delta * this.gameSpeed;
    if (!doUpdate) {
      return;
    }
    if (this.shootingCanvas.target === null) {
      const targetRadius = 5 + Math.random() * 10;
      const targetX =
        targetRadius +
        Math.random() * (this.shootingCanvas.width - 2 * targetRadius);
      const targetY =
        targetRadius +
        Math.random() * (this.shootingCanvas.height - 2 * targetRadius);
      this.shootingCanvas.target = {
        radius: targetRadius,
        x: targetX,
        y: targetY,
      };
    } else if (this.targetsDisappear) {
      this.shootingCanvas.target = null;
    }
  }
}
