/**
 * Requires **only one** property to be provided. See also type `OnlyOneOrNone`.
 */
type OnlyOne<T, Keys extends keyof T = keyof T> = Normalize<
  Pick<T, Exclude<keyof T, Keys>> &
    {
      [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, never>>;
    }[Keys]
>;
