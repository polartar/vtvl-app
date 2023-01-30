/* Type guards */

/** Ensures **type safety** while not hindering **type inference**. Don't forget to use `as const` and `readonly` or `Readonly<T>`, although `Readonly` will not work with deep objects.
 * @example
 * is<Readonly<Option<Exclude<ChainNames, 'disconnect_action'>>[]>>()([] as const) // `Readonly<>` is important with `as const`
 *
 * const keywords = is<readonly string[]>()(['a', 'b'] as const)
 * const keywordz = is<readonly string[]>()(['a',  2 ] as const) // ERROR
 * type T1 = typeof keywords // inferred as ['a', 'b'] and not string[]
 *
 */
export const is =
  <TargetType>() =>
  <T extends TargetType>(arg: T): T =>
    arg;
