import { pipe } from 'fp-ts/lib/pipeable'
import { Expression } from './Expression'

export type MetaExpression =
  | Meta.Deleted
  | Meta.Expiration
  | Meta.Id
  | Meta.Sequence

export namespace Meta {
  export interface Deleted {
    tag: 'Meta.deleted'
  }
  export const deleted: Deleted = {
    tag: 'Meta.deleted'
  }

  export interface Expiration {
    tag: 'Meta.expiration'
  }
  export const expiration: Expiration = {
    tag: 'Meta.expiration'
  }

  export interface Id {
    tag: 'Meta.id'
  }
  export const id: Id = {
    tag: 'Meta.id'
  }
  export function idFrom(from: string): Expression.From {
    return pipe(
      Meta.id,
      Expression.from(from)
    )
  }

  export interface Sequence {
    tag: 'Meta.sequence'
  }
  export const sequence: Sequence = {
    tag: 'Meta.sequence'
  }
}
