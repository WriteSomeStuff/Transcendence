export class PlayerInput {
  private upPressed: boolean;
  private downPressed: boolean;

  public constructor() {
    this.upPressed = false;
    this.downPressed = false;
  }

  public reset(): void {
    this.upPressed = false;
    this.downPressed = false;
  }

  public getDirection(): number {
    return Number(this.upPressed) - Number(this.downPressed);
  }

  public pressUp(): void {
    this.upPressed = true;
  }

  public pressDown(): void {
    this.downPressed = true;
  }

  public releaseUp(): void {
    this.upPressed = false;
  }

  public releaseDown(): void {
    this.downPressed = false;
  }
}
