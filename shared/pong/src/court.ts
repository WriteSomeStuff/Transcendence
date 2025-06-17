import { CourtGeometry } from "./court_geometry.ts";
import { CourtState, initCourtState } from "./court_state.js";

export interface Court {
  readonly geometry: CourtGeometry;
  state: CourtState;
}

// some default setup to use
export function initCourt(playersCount: number): Court {
  const geometry = new CourtGeometry(playersCount, 100, 50, 5, 10, 4);
  return {
    geometry: geometry,
    state: initCourtState(
      geometry,
      1,
      Array.from({ length: playersCount }).map((_) => 0.1),
    ),
  };
}
