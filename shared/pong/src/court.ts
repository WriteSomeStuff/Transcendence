import { createCourtGeometry } from "./court_geometry.ts";
import { initCourtState } from "./court_state.js";

import type { Court } from "schemas";

// some default setup to use
export function initCourt(playerCount: number): Court {
  const geometry = createCourtGeometry(playerCount, 100, 50, 5, 10, 4);
  return {
    geometry: geometry,
    state: initCourtState(
      geometry,
      10,
      Array.from({ length: playerCount }).map((_) => 0.4),
    ),
  };
}
