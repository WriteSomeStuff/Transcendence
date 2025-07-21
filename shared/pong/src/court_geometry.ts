import type { Vector2, PaddleState, CourtGeometry } from "schemas";

import { vec2 } from "./vector2.ts";

export function getWallQuadrilateral(
  geometry: CourtGeometry,
  index: number,
): [Vector2, Vector2, Vector2, Vector2] {
  const a = geometry.vertices[(index * 2) % (geometry.playerCount * 2)]!;
  const b = geometry.vertices[(index * 2 + 1) % (geometry.playerCount * 2)]!;
  const shiftAtoB = vec2.scale(
    vec2.normalize(vec2.subtract(b, a)),
    Math.tan(geometry.renderEdgeAngle) * geometry.wallThickness,
  );
  return [
    a,
    b,
    vec2.add(
      vec2.add(
        b,
        vec2.scale(geometry.normals[index * 2]!, -geometry.wallThickness),
      ),
      vec2.negate(shiftAtoB),
    ),
    vec2.add(
      vec2.add(
        a,
        vec2.scale(geometry.normals[index * 2]!, -geometry.wallThickness),
      ),
      shiftAtoB,
    ),
  ];
}

function getPaddlePoints(
  geometry: CourtGeometry,
  index: number,
  paddle: PaddleState,
  reducedByRadius: boolean,
): [Vector2, Vector2] {
  const [a, b] = getPlayerLineSurface(geometry, index);
  const edgeLength = vec2.length(vec2.subtract(b, a));
  const paddleLength = edgeLength * paddle.edgeRatio;
  const edgeDirection = vec2.normalize(vec2.subtract(b, a));
  const center = vec2.add(
    vec2.scale(vec2.add(a, b), 0.5),
    vec2.scale(
      edgeDirection,
      ((edgeLength - paddleLength) / 2) * paddle.offsetFromCenter,
    ),
  );
  const centerToPaddleSide = vec2.scale(
    edgeDirection,
    (paddleLength - (reducedByRadius ? geometry.ballRadius : 0)) / 2,
  );
  return [
    vec2.subtract(center, centerToPaddleSide),
    vec2.add(center, centerToPaddleSide),
  ];
}

export function getWallNormal(geometry: CourtGeometry, index: number): Vector2 {
  return geometry.normals[index * 2]!;
}

export function getPlayerLineNormal(
  geometry: CourtGeometry,
  index: number,
): Vector2 {
  return geometry.normals[(index * 2 + 1) % (geometry.playerCount * 2)]!;
}

export function getPaddleQuadrilateral(
  geometry: CourtGeometry,
  index: number,
  paddle: PaddleState,
): [Vector2, Vector2, Vector2, Vector2] {
  const [a, b] = getPaddlePoints(geometry, index, paddle, true);
  const normalShift = vec2.scale(
    getPlayerLineNormal(geometry, index),
    geometry.paddleThickness,
  );
  return [a, b, vec2.add(b, normalShift), vec2.add(a, normalShift)];
}

export function getWallSurface(
  geometry: CourtGeometry,
  index: number,
): [Vector2, Vector2] {
  return [
    geometry.vertices[index * 2]!,
    geometry.vertices[(index * 2 + 1) % (geometry.playerCount * 2)]!,
  ];
}

export function getPlayerLineSurface(
  geometry: CourtGeometry,
  index: number,
): [Vector2, Vector2] {
  return [
    geometry.vertices[(index * 2 + 1) % (geometry.playerCount * 2)]!,
    geometry.vertices[(index * 2 + 2) % (geometry.playerCount * 2)]!,
  ];
}

export function getPaddleSurface(
  geometry: CourtGeometry,
  index: number,
  paddle: PaddleState,
): [Vector2, Vector2] {
  const [a, b] = getPaddlePoints(geometry, index, paddle, false);
  const normalShift = vec2.scale(
    getPlayerLineNormal(geometry, index),
    geometry.paddleThickness,
  );
  return [vec2.add(a, normalShift), vec2.add(b, normalShift)];
}

function create2PlayerCourt(
  playerZoneDepth: number,
  wallZoneDepth: number,
  ballRadius: number,
  paddleThickness: number,
  wallThickness: number,
): CourtGeometry {
  const vertices: Vector2[] = [
    vec2.create(-playerZoneDepth, -wallZoneDepth),
    vec2.create(playerZoneDepth, -wallZoneDepth),
    vec2.create(playerZoneDepth, wallZoneDepth),
    vec2.create(-playerZoneDepth, wallZoneDepth),
  ];
  const normals: Vector2[] = [
    vec2.create(0, 1),
    vec2.create(-1, 0),
    vec2.create(0, -1),
    vec2.create(1, 0),
  ];
  return {
    playerCount: 2,
    playerZoneDepth: paddleThickness,
    wallZoneDepth: wallZoneDepth,
    ballRadius: ballRadius,
    paddleThickness: paddleThickness,
    wallThickness: wallThickness,
    vertices: vertices,
    normals: normals,
    renderEdgeAngle: 0,
    frameWidth: 2 * playerZoneDepth,
    frameHeight: 2 * (wallZoneDepth + wallThickness),
  };
}

export function createCourtGeometry(
  playerCount: number,
  playerZoneDepth: number,
  wallZoneDepth: number,
  ballRadius: number,
  paddleThickness: number,
  wallThickness: number,
): CourtGeometry {
  if (playerCount === 2) {
    return create2PlayerCourt(
      playerZoneDepth,
      wallZoneDepth,
      ballRadius,
      paddleThickness,
      wallThickness,
    );
  }
  const renderEdgeAngle = Math.PI - Math.PI / playerCount;
  const extraPlayerZoneDepth = wallThickness / Math.cos(renderEdgeAngle);
  const innerPolygonSide =
    playerZoneDepth * 2 * Math.tan(Math.PI / playerCount);
  const distanceToInnerPolygonVertex =
    innerPolygonSide / (2 * Math.sin(Math.PI / playerCount));
  const distanceFromInnerPolygonVertex =
    (distanceToInnerPolygonVertex - wallZoneDepth) /
    Math.cos(((playerCount - 2) * Math.PI) / playerCount / 2);
  let innerPolygonVertices: Vector2[] = [];
  for (let i = 0; i < playerCount; i++) {
    const angle = ((2 * Math.PI) / playerCount) * i;
    innerPolygonVertices.push(
      vec2.scale(
        vec2.create(Math.sin(angle), -Math.cos(angle)),
        distanceToInnerPolygonVertex,
      ),
    );
  }
  const vertices: Vector2[] = [];
  const normals: Vector2[] = [];
  for (let i = 0; i < playerCount; i++) {
    const prev = innerPolygonVertices[(playerCount + i - 1) % playerCount]!;
    const next = innerPolygonVertices[(playerCount + i + 1) % playerCount]!;
    const curr = innerPolygonVertices[i]!;
    vertices.push(
      vec2.add(
        curr,
        vec2.scale(
          vec2.normalize(vec2.subtract(prev, curr)),
          distanceFromInnerPolygonVertex,
        ),
      ),
    );
    vertices.push(
      vec2.add(
        curr,
        vec2.scale(
          vec2.normalize(vec2.subtract(next, curr)),
          distanceFromInnerPolygonVertex,
        ),
      ),
    );
    normals.push(
      vec2.normalize(
        vec2.negate(vec2.add(vertices[i * 2]!, vertices[i * 2 + 1]!)),
      ),
    );
    normals.push(vec2.normalize(vec2.negate(vec2.add(curr, next))));
  }
  const outerPolygonSide =
    (playerZoneDepth + extraPlayerZoneDepth) *
    2 *
    Math.tan(Math.PI / playerCount);
  const distanceToOuterPolygonVertex =
    outerPolygonSide / (2 * Math.sin(Math.PI / playerCount));
  const width = 4 * distanceToOuterPolygonVertex;
  const height = 4 * distanceToOuterPolygonVertex;
  return {
    playerCount: playerCount,
    playerZoneDepth: playerZoneDepth,
    wallZoneDepth: wallZoneDepth,
    ballRadius: ballRadius,
    paddleThickness: paddleThickness,
    wallThickness: wallThickness,
    vertices: vertices,
    normals: normals,
    renderEdgeAngle: renderEdgeAngle,
    frameWidth: width,
    frameHeight: height,
  };
}
