import { CourtGeometry, createCourtGeometry } from "./court_geometry.ts";
import { CourtState } from "./court_state.ts";

export interface Court {
  readonly geometry: CourtGeometry;
  state: CourtState;
}

// some default setup to use
export function initCourt(playerCount: number): Court {
  const geometry = createCourtGeometry(playerCount, 100, 50, 5, 10, 4);
  return {
    geometry: geometry,
    state: new CourtState(
      geometry,
      10,
      Array.from({ length: playerCount }).map((_) => 0.4),
    ),
  };
}
