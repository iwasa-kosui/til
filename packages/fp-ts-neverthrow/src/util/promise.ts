import * as T from "fp-ts/Task";
import { ResultAsync } from "neverthrow";

type TaskFn<T> = T extends (...args: infer A) => Promise<infer R>
  ? (...args: A) => T.Task<R>
  : never;

type ResultAsyncFn<T> = T extends (...args: infer A) => Promise<infer R>
  ? (...args: A) => ResultAsync<R, never>
  : never;

type AsTask<T> = {
  [K in keyof T]: TaskFn<T[K]>;
}

type AsResultAsync<T> = {
  [K in keyof T]: ResultAsyncFn<T[K]>;
}

export {
  AsTask,
  AsResultAsync,
}