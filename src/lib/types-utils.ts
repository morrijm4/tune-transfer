export type MethodNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

export type Methods<T> = Pick<T, MethodNames<T>>;
