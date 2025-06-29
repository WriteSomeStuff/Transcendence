import type { z, ZodObject, ZodRawShape } from "zod";

export function createDtoTransformable<
  Shape extends ZodRawShape,
  Schema extends ZodObject<Shape>,
>(schema: Schema) {
  type Dto = z.infer<typeof schema>;
  type Constructor<T> = new (...args: never[]) => T;

  return class DtoClass {
    protected static readonly schema = schema;

    public static fromDTO<T extends DtoClass>(
      this: Constructor<T>,
      data: Dto,
    ): T {
      // biome-ignore lint/complexity/noThisInStatic:
      const instance = Object.create(this.prototype);
      for (const [key, value] of Object.entries(data)) {
        const nestedClass = schema.shape[key]?._def.dtoTransformClass;
        const arrayItemClass =
          schema.shape[key]?._def?.type?._def?.dtoTransformClass;
        if (nestedClass) {
          instance[key] = nestedClass.fromDTO(value);
        } else if (arrayItemClass && Array.isArray(value)) {
          instance[key] = value.map((v) => arrayItemClass.fromDTO(v));
        } else {
          instance[key] = value;
        }
      }
      return instance;
    }

    public toDTO(): Dto {
      return schema.parse(this);
    }

    public static getSchema<T extends DtoClass>(this: Constructor<T>): Schema {
      (schema as any)._def.dtoTransformClass = this;
      return schema;
    }
  };
}
