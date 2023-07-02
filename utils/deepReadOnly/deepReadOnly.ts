export type DeepReadonly<T> = T extends (infer R)[]
  ? DeepReadonlyArray<R>
  : T extends Function
  ? T
  : T extends object
  ? DeepReadonlyObject<T>
  : T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

const dateMutatorMethodKeys = ["setDate","setFullYear","setHours","setMilliseconds","setMinutes","setMonth","setSeconds","setTime","setUTCDate","setUTCFullYear","setUTCHours","setUTCMilliseconds","setUTCMinutes","setUTCMonth","setUTCSeconds","setYear"];

type ObjectType<T> = T extends object ? T : never;

/**
 * Protect the runtime code from mutation
 * caveats: JS Dates cannot be frozen with Object.freeze but they are also not easy to accidentally
 * mutate date.setMonth() is quite deliberate
 * @param input
 * @returns
 */
export function deepReadonly<T>(input: ObjectType<T>): DeepReadonly<T> {
  if (typeof input !== "object")
    throw new Error("deepReadonly is for use with objects");
  const indexer = input as { [key: string]: unknown };

  if (input instanceof Date) {
    dateMutatorMethodKeys.forEach(key => {
      indexer[key] = function(){};
    });
    //replace all set* methods with no-op functions
    //input = immutableDate(input);
  } else {
    Object.keys(input).forEach((key) => {
      if (typeof indexer[key] === "object") {
        
        // work out how to remove these any usages later
        indexer[key] = deepReadonly(indexer[key] as object);
      }
    });
  }
  return Object.freeze(input) as DeepReadonly<T>;
}
