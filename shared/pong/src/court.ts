import { createCourtGeometry } from "./court_geometry.ts";
import { initCourtState } from "./court_state.js";

import type {Court, CourtGeometry} from "schemas";

function chooseGeometry(playerCount: number): CourtGeometry {
  if (playerCount === 2) {
    return createCourtGeometry(playerCount, 100, 50, 5, 10, 4);
  } else {
    return createCourtGeometry(playerCount, 100, 100, 5, 10, 10);
  }
}

// some default setup to use
export function initCourt(playerCount: number, paddleEdgeRatio: number): Court {
  const geometry = chooseGeometry(playerCount);
  return {
    geometry: geometry,
    state: initCourtState(
      geometry,
      50,
      Array.from({ length: playerCount }).map((_) => paddleEdgeRatio),
    ),
  };
}
