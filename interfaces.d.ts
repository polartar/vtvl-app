/**
 * Requires **only one** property to be provided. See also type `OnlyOneOrNone`.
 */
type OnlyOne<T, Keys extends keyof T = keyof T> = Normalize<
  Pick<T, Exclude<keyof T, Keys>> &
    {
      [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, never>>;
    }[Keys]
>;

type UTCString = `${number}-${number}-${number} ${number}:${number}:${number} UTC`; // e.g. 2022-06-01 16:47:55 UTC

type AnyObject<T = any> = Record<string, T>;
type AnyFunction = (...args: any[]) => any;
type AnyAsyncFunction = (...args: any[]) => Promise<any>;
