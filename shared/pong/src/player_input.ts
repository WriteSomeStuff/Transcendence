export class PlayerInput {
  private upPressed: boolean;
  private downPressed: boolean;
  private wasUpdated: boolean;

  public constructor() {
    this.upPressed = false;
    this.downPressed = false;
    this.wasUpdated = false;
  }

  public reset(): void {
    this.upPressed = false;
    this.downPressed = false;
    this.wasUpdated = false;
  }

  public getDirection(): number {
    return Number(this.upPressed) - Number(this.downPressed);
  }

  public pressUp(): void {
    if (!this.upPressed) {
      this.wasUpdated = true;
    }
    this.upPressed = true;
  }

  public pressDown(): void {
    if (!this.downPressed) {
      this.wasUpdated = true;
    }
    this.downPressed = true;
  }

  public releaseUp(): void {
    if (this.upPressed) {
      this.wasUpdated = true;
    }
    this.upPressed = false;
  }

  public releaseDown(): void {
    if (this.downPressed) {
      this.wasUpdated = true;
    }
    this.downPressed = false;
  }

  public collectUpdatedFlag(): boolean {
    const result = this.wasUpdated;
    this.wasUpdated = false;
    return result;
  }
}
