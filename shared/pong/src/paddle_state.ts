// stores relative values of a paddle
export interface PaddleState {
  offsetFromCenter: number; // from -1 to 1, relative
  edgeRatio: number;
  velocity: number;
}

export function initPaddle(edgeRatio: number): PaddleState {
  return {
    offsetFromCenter: 0,
    edgeRatio: edgeRatio,
    velocity: 0,
  };
}

export function updatePaddle(state: PaddleState, delta: number): PaddleState {
  state.offsetFromCenter += delta * state.velocity;
  state.offsetFromCenter = Math.min(Math.max(state.offsetFromCenter, -1), 1);
  return state;
}
