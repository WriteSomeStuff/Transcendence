import { Court, initCourt } from "./court.ts";

export class CourtController {
  public court: Court;

  public constructor() {
    this.court = initCourt(2);
  }

  public getCourt(): Court {
    return this.court;
  }
}
