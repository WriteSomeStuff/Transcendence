export class PlayerScore {
  public points: number = 0;
  public lastUpdate: Date | null = null;
  public latestUpdateType: "increase" | "decrease" | null = null;

  public increase(points: number = 1): void {
    this.points += points;
    this.lastUpdate = new Date();
    this.latestUpdateType = "increase";
  }

  public decrease(points: number = 1): void {
    this.points -= points;
    this.lastUpdate = new Date();
    this.latestUpdateType = "decrease";
  }

  static compare(first: PlayerScore, second: PlayerScore): number {
    if (first.points < second.points) {
      return -1;
    }
    if (first.points > second.points) {
      return 1;
    }
    if (first.latestUpdateType === "increase" && second.latestUpdateType === "decrease") {
      return 1;
    }
    if (first.latestUpdateType === "decrease" && second.latestUpdateType === "increase") {
      return -1;
    }
    if (first.latestUpdateType === "decrease") {
      return second.lastUpdate!.getTime() - first.lastUpdate!.getTime();
    }
    if (first.latestUpdateType === "increase") {
      return first.lastUpdate!.getTime() - second.lastUpdate!.getTime();
    }
    return 0;
  }
}
