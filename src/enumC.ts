import * as t from 'io-ts'

export class EnumType<A> extends t.Type<A> {
  public readonly _tag: 'EnumType' = 'EnumType'
  constructor(name: string, is: EnumType<A>['is'], validate: EnumType<A>['validate'], encode: EnumType<A>['encode']) {
    super(name, is, validate, encode)
  }
}

export function enumC<E>(e: { [key: string]: E }, name: string = 'Enum'): EnumType<E> {
  const is = (u: unknown): u is E => Object.keys(e).some(k => e[k] === u)
  return new EnumType<E>(name, is, (u, c) => (is(u) ? t.success(u) : t.failure(u, c)), t.identity)
}
