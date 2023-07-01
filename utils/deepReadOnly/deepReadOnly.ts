export type DeepReadonly<T> =
    T extends (infer R)[] ? DeepReadonlyArray<R> :
    T extends Function ? T :
    T extends object ? DeepReadonlyObject<T> :
    T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
    readonly [P in keyof T]: DeepReadonly<T[P]>;
};

/**
 * Protect the runtime code from mutation
 * @param input 
 * @returns 
 */
export function deepReadonly<T extends object>(input: T): DeepReadonly<T> {
    if (typeof input !== 'object') throw new Error('deepReadonly is for use with objects');

    Object.keys(input).forEach((value) => {
        const key: string & keyof typeof input = value as string & keyof typeof input;
        if (typeof input[key] === 'object') {
            // work out how to remove these any usages later
            (input[key] as any) = deepReadonly(input[key] as any);
        }
    });
    return Object.freeze(input) as DeepReadonly<T>;
}

