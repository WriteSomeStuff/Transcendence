import { Vector2 } from "./vector2.ts";
import { PaddleState } from "./paddle_state.js";

export class CourtGeometry {
  public readonly size: number;
  public readonly ballRadius: number;
  public readonly sidelineAngle: number; // 0 - parallel
  public readonly sidelineThickness: number;
  public readonly paddleThickness: number;
  public readonly width: number;
  public readonly height: number;
  private readonly edgeCount: number;
  private readonly vertices: Vector2[];
  private readonly normals: Vector2[];

  constructor(
    playersCount: number,
    distanceToBaseline: number,
    distanceToSideline: number,
    paddleThickness: number,
    sidelineThickness: number,
    ballRadius: number,
  ) {
    this.size = playersCount;
    this.edgeCount = playersCount * 2;
    this.ballRadius = ballRadius;
    this.paddleThickness = paddleThickness;
    this.sidelineThickness = sidelineThickness;
    if (!Number.isInteger(playersCount) || playersCount < 2) {
      throw new Error("Invalid playersCount");
    }
    if (playersCount == 2) {
      this.sidelineAngle = 0;
      this.vertices = [
        new Vector2(-distanceToBaseline, -distanceToSideline),
        new Vector2(distanceToBaseline, -distanceToSideline),
        new Vector2(distanceToBaseline, distanceToSideline),
        new Vector2(-distanceToBaseline, distanceToSideline),
      ];
      this.normals = [
        new Vector2(0, 1),
        new Vector2(-1, 0),
        new Vector2(0, -1),
        new Vector2(1, 0),
      ];
      this.width = 2 * distanceToBaseline;
      this.height = 2 * (distanceToSideline + this.sidelineThickness);
    } else {
      this.sidelineAngle = Math.PI - Math.PI / playersCount;
      const extraBaselineDistance =
        sidelineThickness / Math.cos(this.sidelineAngle);
      const innerPolygonSide =
        distanceToBaseline * 2 * Math.tan(Math.PI / playersCount);
      const distanceToInnerPolygonVertex =
        innerPolygonSide / (2 * Math.sin(Math.PI / playersCount));
      const distanceFromInnerPolygonVertex =
        (distanceToInnerPolygonVertex - distanceToSideline) /
        Math.cos(((playersCount - 2) * Math.PI) / playersCount / 2);
      let innerPolygonVertices: Vector2[] = [];
      for (let i = 0; i < playersCount; i++) {
        const angle = ((2 * Math.PI) / playersCount) * i;
        innerPolygonVertices.push(
          new Vector2(Math.sin(angle), -Math.cos(angle)).scale(
            distanceToInnerPolygonVertex,
          ),
        );
      }
      this.vertices = [];
      this.normals = [];
      for (let i = 0; i < playersCount; i++) {
        const prev =
          innerPolygonVertices[(playersCount + i - 1) % playersCount]!;
        const next =
          innerPolygonVertices[(playersCount + i + 1) % playersCount]!;
        const curr = innerPolygonVertices[i]!;
        this.vertices.push(
          curr.add(
            prev
              .subtract(curr)
              .normalize()
              .scale(distanceFromInnerPolygonVertex),
          ),
        );
        this.vertices.push(
          curr.add(
            next
              .subtract(curr)
              .normalize()
              .scale(distanceFromInnerPolygonVertex),
          ),
        );
        this.normals.push(
          this.vertices[i * 2]!.add(this.vertices[i * 2 + 1]!)
            .scale(-1)
            .normalize(),
        );
        this.normals.push(curr.add(next).scale(-1).normalize());
      }
      const outerPolygonSide =
        (distanceToBaseline + extraBaselineDistance) *
        2 *
        Math.tan(Math.PI / playersCount);
      const distanceToOuterPolygonVertex =
        outerPolygonSide / (2 * Math.sin(Math.PI / playersCount));
      this.width = 4 * distanceToOuterPolygonVertex;
      this.height = 4 * distanceToOuterPolygonVertex;
    }
  }

  public getSidelineQuadrilateral(
    index: number,
  ): [Vector2, Vector2, Vector2, Vector2] {
    const a = this.vertices[(index * 2) % this.edgeCount]!;
    const b = this.vertices[(index * 2 + 1) % this.edgeCount]!;
    const shiftAtoB = b
      .subtract(a)
      .normalize()
      .scale(Math.tan(this.sidelineAngle) * this.sidelineThickness);
    return [
      a,
      b,
      b
        .add(this.normals[index * 2]!.scale(-this.sidelineThickness))
        .add(shiftAtoB.scale(-1)),
      a
        .add(this.normals[index * 2]!.scale(-this.sidelineThickness))
        .add(shiftAtoB),
    ];
  }

  private getPaddleBaselinePoints(
    index: number,
    paddle: PaddleState,
    reducedByRadius: boolean,
  ): [Vector2, Vector2] {
    const [a, b] = this.getBaselineSurface(index);
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

  public getSidelineNormal(index: number): Vector2 {
    return this.normals[index * 2]!;
  }

  public getBaselineNormal(index: number): Vector2 {
    return this.normals[(index * 2 + 1) % this.edgeCount]!;
  }

  public getBaselinePaddleQuadrilateral(
    index: number,
    paddle: PaddleState,
  ): [Vector2, Vector2, Vector2, Vector2] {
    const [a, b] = this.getPaddleBaselinePoints(index, paddle, true);
    const normalShift = this.normals[index * 2 + 1]!.scale(
      this.paddleThickness,
    );
    return [a, b, b.add(normalShift), a.add(normalShift)];
  }

  public getSidelineSurface(index: number): [Vector2, Vector2] {
    return [
      this.vertices[index * 2]!,
      this.vertices[(index * 2 + 1) % this.edgeCount]!,
    ];
  }

  public getBaselineSurface(index: number): [Vector2, Vector2] {
    return [
      this.vertices[(index * 2 + 1) % this.edgeCount]!,
      this.vertices[(index * 2 + 2) % this.edgeCount]!,
    ];
  }

  public getPaddleSurface(
    index: number,
    paddle: PaddleState,
  ): [Vector2, Vector2] {
    const [a, b] = this.getPaddleBaselinePoints(index, paddle, false);
    const normalShift = this.normals[index * 2 + 1]!.scale(
      this.paddleThickness,
    );
    return [a.add(normalShift), b.add(normalShift)];
  }
}
