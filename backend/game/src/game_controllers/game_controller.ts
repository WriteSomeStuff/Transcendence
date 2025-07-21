import type { Room } from "schemas";

export abstract class GameController {
  protected room: Room;

  protected constructor(room: Room) {
    this.room = room;
  }

  public abstract getBroadcastMessages(): object[];
  public abstract getPlayerMessages(index: number): object[];
  public abstract onPlayerJoin(index: number): void;
  public abstract onPlayerAction(index: number, action: object): void;
  public abstract onPlayerLeave(index: number): void;
  public abstract start(): void;
  public abstract update(delta: number): void;
}
