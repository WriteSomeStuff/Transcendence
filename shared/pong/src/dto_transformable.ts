export abstract class DTOTransformable<T> {
  static fromDTO<U extends object, V extends DTOTransformable<U>>(
    this: new (...args: any[]) => V,
    dto: U
  ): V {
    const instance = Object.create(this.prototype);
    Object.assign(instance, dto);
    return instance;
  }

  abstract toDTO(): T;
}
