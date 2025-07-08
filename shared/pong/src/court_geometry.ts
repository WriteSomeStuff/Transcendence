import { z } from "zod";

import { createDtoTransformable } from "./dto_transformable.js";

import { Vector2 } from "./vector2.ts";
import { PaddleState } from "./paddle_state.ts";

const CourtGeometryDto = z.object({
  playerCount: z.number().int().min(2),
  playerZoneDepth: z.number(),
  wallZoneDepth: z.number(),
  ballRadius: z.number(),
  paddleThickness: z.number(),
  wallThickness: z.number(),

  vertices: z.array(Vector2.getSchema()),
  normals: z.array(Vector2.getSchema()),
  renderEdgeAngle: z.number(),
});

export class CourtGeometry extends createDtoTransformable(CourtGeometryDto) {
  public readonly playerCount: number;
  public readonly ballRadius: number;
  public readonly paddleThickness: number;
  public readonly wallThickness: number;

  private readonly vertices: Vector2[];
  private readonly normals: Vector2[];
  private readonly renderEdgeAngle: number;

  public readonly frameWidth: number;
  public readonly frameHeight: number;

  private readonly edgeCount: number;

  constructor(
    playerCount: number,
    ballRadius: number,
    paddleThickness: number,
    wallThickness: number,
    vertices: Vector2[],
    normals: Vector2[],
    renderEdgeAngle: number,
    frameWidth: number,
    frameHeight: number,
  ) {
    super();
    this.playerCount = playerCount;
    this.ballRadius = ballRadius;
    this.paddleThickness = paddleThickness;
    this.wallThickness = wallThickness;
    this.vertices = vertices;
    this.normals = normals;
    this.renderEdgeAngle = renderEdgeAngle;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.edgeCount = playerCount * 2;
  }

  public getWallQuadrilateral(
    index: number,
  ): [Vector2, Vector2, Vector2, Vector2] {
    const a = this.vertices[(index * 2) % this.edgeCount]!;
    const b = this.vertices[(index * 2 + 1) % this.edgeCount]!;
    const shiftAtoB = b
      .subtract(a)
      .normalize()
      .scale(Math.tan(this.renderEdgeAngle) * this.wallThickness);
    return [
      a,
      b,
      b
        .add(this.normals[index * 2]!.scale(-this.wallThickness))
        .add(shiftAtoB.scale(-1)),
      a.add(this.normals[index * 2]!.scale(-this.wallThickness)).add(shiftAtoB),
    ];
  }

  private getPaddlePoints(
    index: number,
    paddle: PaddleState,
    reducedByRadius: boolean,
  ): [Vector2, Vector2] {
    const [a, b] = this.getPlayerLineSurface(index);
    const edgeLength = a.subtract(b).length();
    const paddleLength = edgeLength * paddle.edgeRatio;
    const edgeDirection = b.subtract(a).normalize();
    const center = a
      .add(b)
      .scale(0.5)
      .add(
        edgeDirection.scale(
          ((edgeLength - paddleLength) / 2) * paddle.offsetFromCenter,
        ),
      );
    const centerToPaddleSide = edgeDirection.scale(
      (paddleLength - (reducedByRadius ? this.ballRadius : 0)) / 2,
    );
    return [
      center.subtract(centerToPaddleSide),
      center.add(centerToPaddleSide),
    ];
  }

  public getWallNormal(index: number): Vector2 {
    return this.normals[index * 2]!;
  }

  public getPlayerLineNormal(index: number): Vector2 {
    return this.normals[(index * 2 + 1) % this.edgeCount]!;
  }

  public getPaddleQuadrilateral(
    index: number,
    paddle: PaddleState,
  ): [Vector2, Vector2, Vector2, Vector2] {
    const [a, b] = this.getPaddlePoints(index, paddle, true);
    const normalShift = this.normals[index * 2 + 1]!.scale(
      this.paddleThickness,
    );
    return [a, b, b.add(normalShift), a.add(normalShift)];
  }

  public getWallSurface(index: number): [Vector2, Vector2] {
    return [
      this.vertices[index * 2]!,
      this.vertices[(index * 2 + 1) % this.edgeCount]!,
    ];
  }

  public getPlayerLineSurface(index: number): [Vector2, Vector2] {
    return [
      this.vertices[(index * 2 + 1) % this.edgeCount]!,
      this.vertices[(index * 2 + 2) % this.edgeCount]!,
    ];
  }

  public getPaddleSurface(
    index: number,
    paddle: PaddleState,
  ): [Vector2, Vector2] {
    const [a, b] = this.getPaddlePoints(index, paddle, false);
    const normalShift = this.normals[index * 2 + 1]!.scale(
      this.paddleThickness,
    );
    return [a.add(normalShift), b.add(normalShift)];
  }
}

function create2PlayerCourt(
  playerZoneDepth: number,
  wallZoneDepth: number,
  ballRadius: number,
  paddleThickness: number,
  wallThickness: number,
): CourtGeometry {
  const vertices = [
    new Vector2(-playerZoneDepth, -wallZoneDepth),
    new Vector2(playerZoneDepth, -wallZoneDepth),
    new Vector2(playerZoneDepth, wallZoneDepth),
    new Vector2(-playerZoneDepth, wallZoneDepth),
  ];
  const normals = [
    new Vector2(0, 1),
    new Vector2(-1, 0),
    new Vector2(0, -1),
    new Vector2(1, 0),
  ];
  return new CourtGeometry(
    2,
    ballRadius,
    paddleThickness,
    wallThickness,
    vertices,
    normals,
    0,
    2 * playerZoneDepth,
    2 * (wallZoneDepth + wallThickness),
  );
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
      new Vector2(Math.sin(angle), -Math.cos(angle)).scale(
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
      curr.add(
        prev.subtract(curr).normalize().scale(distanceFromInnerPolygonVertex),
      ),
    );
    vertices.push(
      curr.add(
        next.subtract(curr).normalize().scale(distanceFromInnerPolygonVertex),
      ),
    );
    normals.push(
      vertices[i * 2]!.add(vertices[i * 2 + 1]!)
        .scale(-1)
        .normalize(),
    );
    normals.push(curr.add(next).scale(-1).normalize());
  }
  const outerPolygonSide =
    (playerZoneDepth + extraPlayerZoneDepth) *
    2 *
    Math.tan(Math.PI / playerCount);
  const distanceToOuterPolygonVertex =
    outerPolygonSide / (2 * Math.sin(Math.PI / playerCount));
  const width = 4 * distanceToOuterPolygonVertex;
  const height = 4 * distanceToOuterPolygonVertex;
  return new CourtGeometry(
    playerCount,
    ballRadius,
    paddleThickness,
    wallThickness,
    vertices,
    normals,
    renderEdgeAngle,
    width,
    height,
  );
}
