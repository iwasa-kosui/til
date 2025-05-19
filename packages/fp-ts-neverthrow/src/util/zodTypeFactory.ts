import { err, ok, type Result } from 'neverthrow';
import { z } from 'zod';

export type ZodTypeFactory<T extends z.ZodType> = Readonly<{
  zodType: T;
  parse: <TInput>(input: TInput) => Result<z.infer<T>, z.ZodError>;
  unsafeParse: <TInput>(input: TInput) => z.infer<T>;
}>;

export const ZodTypeFactory = {
  from: <T extends z.ZodType>(zodType: T): ZodTypeFactory<T> => {
    const parse = <TInput>(input: TInput): Result<z.infer<T>, z.ZodError> => {
      try {
        return ok(zodType.parse(input));
      } catch (error) {
        if (error instanceof z.ZodError) {
          return err(error);
        }
        throw error;
      }
    };

    const unsafeParse = <TInput>(input: TInput): z.infer<T> => {
      return zodType.parse(input);
    };

    return { zodType, parse, unsafeParse };
  },
} as const;

type ZodTypeEnumFactory<T extends z.EnumLike> =
  & Readonly<{
    zodType: z.ZodNativeEnum<T>;
    parse: <TInput>(input: TInput) => Result<z.infer<z.ZodNativeEnum<T>>, z.ZodError>;
    unsafeParse: <TInput>(input: TInput) => z.infer<z.ZodNativeEnum<T>>;
  }>
  & Readonly<T>;

export const ZodTypeEnumFactory = {
  from: <T extends z.EnumLike>(enumLike: T): ZodTypeEnumFactory<T> => {
    const zodType = z.nativeEnum(enumLike);

    const parse = <TInput>(input: TInput): Result<z.infer<z.ZodNativeEnum<T>>, z.ZodError> => {
      try {
        return ok(zodType.parse(input));
      } catch (error) {
        if (error instanceof z.ZodError) {
          return err(error);
        }
        throw error;
      }
    };

    const unsafeParse = <TInput>(input: TInput): z.infer<z.ZodNativeEnum<T>> => {
      return zodType.parse(input);
    };

    return { zodType, parse, unsafeParse, ...enumLike };
  },
} as const;
