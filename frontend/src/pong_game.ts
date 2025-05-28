// type InteractionResult =
//   | { type: "nothing" }
//   | { type: "bounce", distance: number, newVelocity: Vector2 }
//   | { type: "missedBall" };
//
// class Ball {
//   private pos: Vector2;
//   private vel: Vector2;
//   public readonly radius: number;
//
//   constructor(pos: Vector2, vel: Vector2, radius: number) {
//     this.pos = pos;
//     this.vel = vel;
//     this.radius = radius;
//   }
//
//   public update(deltaTime: number): void {
//     this.pos = this.pos.add(this.vel.multiply(deltaTime));
//   }
//
//   public interactWithEdge(edge: CourtEdge): InteractionResult {
//     return edge.interact(this);
//   }
//
//   public getPosition(): Vector2 {
//     return this.pos;
//   }
//
//   public getVelocity(): Vector2 {
//     return this.vel;
//   }
//
//   public setVelocity(velocity: Vector2): void {
//     this.vel = velocity;
//   }
// }
//
// class Paddle {
//   private offsetFromCenter: number; // from -1 to 1
//   private direction: -1 | 0 | 1 = 0;
//   public readonly dimensions: Vector2; // x = length, y = thickness
//   private state: 'normal' | 'blocked' = 'normal';
//
//   constructor(dimensions: Vector2) {
//     this.offsetFromCenter = 0;
//     this.dimensions = dimensions;
//   }
//
//   public update(deltaTime: number): void {
//     if (this.state === 'blocked') {
//       return;
//     }
//     this.offsetFromCenter += this.direction * deltaTime;
//     this.offsetFromCenter = Math.max(-1, Math.min(this.offsetFromCenter, 1));
//   }
//
//   public move(direction: "up" | "down" | null): void {
//     if (direction === "down") {
//       this.direction = -1;
//     }
//     else if (direction === "up") {
//       this.direction = 1;
//     }
//     else {
//       this.direction = 0;
//     }
//   }
//
//   public getBounceType(ball: Ball, distance: number): 'center' | 'corner' | 'missed'  {
//     if (distance <= this.dimensions.x / 2 - ball.radius) {
//       return 'center';
//     }
//     if (distance <= this.dimensions.x / 2 + ball.radius) {
//       return 'corner';
//     }
//     return 'missed';
//   }
//
//   public getPaddlePosition(length: number, center: Vector2, direction: Vector2): Vector2 {
//     const maxDistance = (length - this.dimensions.x) / 2;
//     return center.add(direction.multiply(maxDistance * this.direction));
//   }
// }
//
// abstract class CourtEdge {
//   protected readonly length: number;
//   protected readonly angle: number; // 0 means parallel
//   protected readonly normal: Vector2;
//   protected readonly center: Vector2;
//
//   protected constructor(length: number, angle: number, normal: Vector2, center: Vector2) {
//     this.length = length;
//     this.angle = angle;
//     this.normal = normal;
//     this.center = center;
//   }
//
//   protected getInnerLineLength(distance: number): number {
//     if (this.angle === 0) {
//       return this.length;
//     }
//     const angle = (Math.PI - this.angle) / 2;
//     const distanceToCenter = this.length / 2 * Math.tan(angle);
//     return (distanceToCenter - distance) / Math.tan(angle) * 2;
//   }
//
//   abstract interact(ball: Ball): InteractionResult;
//   abstract render(ctx: CanvasRenderingContext2D): void;
// }
//
// class CourtSideline extends CourtEdge {
//   private readonly thickness: number;
//
//   constructor(length: number, angle: number, normal: Vector2, center: Vector2, thickness: number) {
//     super(length, angle, normal, center);
//     this.thickness = thickness;
//   }
//
//   public interact(ball: Ball): InteractionResult {
//     const pos = ball.getPosition();
//     const center = this.center.add(this.normal.multiply(this.thickness));
//     const distance = Math.abs(pos.subtract(center).dot(this.normal));
//
//     if (distance <= ball.radius) {
//       return {
//         type: 'bounce',
//         distance: distance,
//         newVelocity: ball.getVelocity().reflect(this.normal),
//       }
//     }
//     return { type: "nothing" };
//   }
//
//   render(ctx: CanvasRenderingContext2D): void {
//     // ctx.reset();
//     const direction = new Vector2(-this.normal.y, this.normal.x);
//     const center = this.center.add(this.normal.multiply(this.thickness));
//     const length = this.getInnerLineLength(this.length);
//     console.log("Rendering sideline");
//     // ctx.moveTo(...this.center.add(direction.multiply(this.length / 2)).toTuple());
//     console.log(...this.center.add(direction.multiply(this.length / 2)).toTuple());
//     console.log(...this.center.subtract(direction.multiply(this.length / 2)).toTuple());
//     console.log(...center.subtract(direction.multiply(length / 2)).toTuple());
//     console.log(...center.add(direction.multiply(length / 2)).toTuple());
//     ctx.beginPath();
//     ctx.moveTo(...this.center.add(direction.multiply(this.length / 2)).toTuple());
//     ctx.lineTo(...this.center.subtract(direction.multiply(this.length / 2)).toTuple());
//     ctx.lineTo(...center.subtract(direction.multiply(length / 2)).toTuple());
//     ctx.lineTo(...center.add(direction.multiply(length / 2)).toTuple());
//     ctx.closePath();
//     ctx.fillStyle = "black";
//     ctx.fill();
//   }
// }
//
// class CourtBaseline extends CourtEdge {
//   private readonly paddleOffset: number;
//   private paddle: Paddle;
//   private readonly direction: Vector2;
//
//   constructor(length: number, angle: number, normal: Vector2, center: Vector2, paddleOffset: number, paddle: Paddle, direction: Vector2) {
//     super(length, angle, normal, center);
//     this.paddleOffset = paddleOffset;
//     this.paddle = paddle;
//     this.direction = direction;
//   }
//
//   public movePaddle(direction: "up" | "down" | null): void {
//     this.paddle.move(direction);
//   }
//
//   public interact(ball: Ball): InteractionResult {
//     const pos = ball.getPosition();
//     const center = this.center.add(this.normal.multiply(this.paddleOffset));
//     const paddlePosition = this.paddle.getPaddlePosition(this.getInnerLineLength(this.paddleOffset), center, this.direction);
//     const paddleToBall = pos.subtract(paddlePosition);
//
//     if (this.center.subtract(pos).dot(this.normal) <= ball.radius) {
//       return { type: "missedBall" };
//     }
//     if (paddleToBall.dot(this.normal) > ball.radius) {
//       return { type: "nothing" };
//     }
//     if (this.paddle.getBounceType(ball, Math.abs(paddleToBall.dot(this.direction))) === 'missed') {
//       // block the paddle
//       return { type: "nothing" };
//     }
//
//     return {
//       type: "bounce",
//       distance: Math.abs(paddleToBall.dot(this.normal)),
//       newVelocity: ball.getVelocity().reflect(this.normal),
//     };
//   }
//
//   render(ctx: CanvasRenderingContext2D): void {
//     // ctx.reset();
//
//     const center = this.center.add(this.normal.multiply(this.paddleOffset));
//     const paddlePosition = this.paddle.getPaddlePosition(this.getInnerLineLength(this.paddleOffset), center, this.direction);
//     // console.log(...paddlePosition.add(this.direction.multiply(this.paddle.dimensions.x / 2)).toTuple());
//     // console.log(...paddlePosition.subtract(this.direction.multiply(this.paddle.dimensions.x / 2)).toTuple());
//     // console.log(...paddlePosition.subtract(this.normal.multiply(this.paddle.dimensions.y)).subtract(this.direction.multiply(this.paddle.dimensions.x / 2)).toTuple());
//     // console.log(...paddlePosition.subtract(this.normal.multiply(this.paddle.dimensions.y)).add(this.direction.multiply(this.paddle.dimensions.x / 2)).toTuple());
//     ctx.beginPath();
//     ctx.moveTo(...paddlePosition.add(this.direction.multiply(this.paddle.dimensions.x / 2)).toTuple());
//     ctx.lineTo(...paddlePosition.subtract(this.direction.multiply(this.paddle.dimensions.x / 2)).toTuple());
//     ctx.lineTo(...paddlePosition.subtract(this.normal.multiply(this.paddle.dimensions.y)).subtract(this.direction.multiply(this.paddle.dimensions.x / 2)).toTuple());
//     ctx.lineTo(...paddlePosition.subtract(this.normal.multiply(this.paddle.dimensions.y)).add(this.direction.multiply(this.paddle.dimensions.x / 2)).toTuple());
//     ctx.closePath();
//     ctx.fillStyle = "black";
//     ctx.fill();
//   }
// }
//
// class Court {
//   private readonly edges: CourtEdge[];
//
//   constructor() {
//     this.edges = [
//       new CourtSideline(200, 0, new Vector2(0, 1), new Vector2(100, 0), 10),
//       new CourtBaseline(100, 0, new Vector2(-1, 0), new Vector2(200, 50), 10, new Paddle(new Vector2(40, 5)), new Vector2(0, -1)),
//       new CourtSideline(200, 0, new Vector2(0, -1), new Vector2(100, 100), 10),
//       new CourtBaseline(100, 0, new Vector2(1, 0), new Vector2(0, 50), 10, new Paddle(new Vector2(40, 5)), new Vector2(0, -1)),
//     ];
//   }
//
//   public movePaddle(index: number, direction: "up" | "down" | null): void {
//     (this.edges[index * 2 + 1] as CourtBaseline).movePaddle(direction);
//   }
//
//   public render(ctx: CanvasRenderingContext2D) {
//     for (const edge of this.edges) {
//       edge.render(ctx);
//     }
//   }
//
//   public update(deltaTime: number, ball: Ball): void {
//     ball.update(deltaTime);
//
//     let closestInteraction: InteractionResult | null = null;
//     let closestDistance = Infinity;
//
//     for (const edge of this.edges) {
//       const interaction = edge.interact(ball);
//
//       if (interaction.type === "bounce" && interaction.distance < closestDistance) {
//         closestInteraction = interaction;
//         closestDistance = interaction.distance;
//       }
//
//       if (interaction.type === "missedBall") {
//         console.log("Ball missed!");
//         return;
//       }
//     }
//
//     if (closestInteraction && closestInteraction.type === "bounce") {
//       ball.setVelocity(closestInteraction.newVelocity);
//     }
//   }
// }
//
// class PongGame {
//   private ball: Ball;
//   private court: Court;
//
//   constructor(size: number) {
//     this.court = new Court();
//     this.ball = new Ball(new Vector2(100, 50), new Vector2(1, 0), 5);
//   }
//
//   public movePaddle(index: number, direction: "up" | "down" | null): void {
//     this.court.movePaddle(index, direction);
//   }
//
//   public update(deltaTime: number): void {
//     this.ball.update(deltaTime);
//     this.court.update(deltaTime, this.ball);
//   }
//
//   public render(ctx: CanvasRenderingContext2D) {
//     this.court.render(ctx);
//   }
// }
//
// export { PongGame };