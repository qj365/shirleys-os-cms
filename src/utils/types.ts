/* eslint-disable @typescript-eslint/no-explicit-any */
/** Get extracted type from an Array Type */
export type Unpacked<T> = T extends (infer U)[] ? U : T;

/** Type for Object with unknown value type */
export type ObjectType = Record<string, any>;

/** Get type that would ensure such member will be added using Strictly Union */
type UnionKeys<T> = T extends T ? keyof T : never;
type StrictUnionHelper<T, TAll> = T extends any
  ? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, undefined>>
  : never;
export type StrictUnion<T> = StrictUnionHelper<T, T>;

/** Convert a type with deeply nested type into partial/optional */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type TPageInfo = {
  pageTitle: string;
};
