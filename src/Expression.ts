import { MetaExpression } from './Meta'
import { pipe } from 'fp-ts/lib/pipeable'

export type Expression =
  | MetaExpression
  | PropertyExpression
  | Expression.DateE
  | Expression.Not
  | Expression.Number
  | Expression.String
  | Expression.From
  | Expression.Add
  | Expression.And
  | Expression.EqualTo

export type PropertyExpression =
  | Expression.All
  | Expression.Property

export namespace Expression {
  export interface All {
    tag: 'All'
  }
  export function all(): All {
    return { tag: 'All' }
  }

  export interface DateE {
    tag: 'Date'
    value: string
  }
  export function date(value: Date): DateE {
    return { tag: 'Date', value: value.toISOString() }
  }

  export interface Not {
    tag: 'Not'
    expression: Expression
  }
  export function not(expression: Expression): Not {
    return { tag: 'Not', expression }
  }

  export interface Number {
    tag: 'Number'
    value: number
  }
  export function number(value: number): Number {
    return { tag: 'Number', value }
  }

  export interface Property {
    tag: 'Property'
    property: string
  }
  export function property(property: string): Property {
    return { tag: 'Property', property }
  }

  export type FromRouter =  PropertyExpression | MetaExpression
  export interface From {
    tag: 'From'
    alias: string
    expression: FromRouter
  }
  export function from(alias: string): (expression: FromRouter) => From {
    return expression => ({
      tag: 'From',
      alias,
      expression
    })
  }

  export interface String {
    tag: 'String'
    value: string
  }
  export function string(value: string): String {
    return {
      tag: 'String',
      value,
    }
  }

  export interface Add {
    tag: 'Add'
    a: Expression
    b: Expression
  }
  export function add(b: Expression): (a: Expression) => Add {
    return a => ({ tag: 'Add', a, b })
  }

  export interface And {
    tag: 'And'
    a: Expression
    b: Expression
  }
  export function and(b: Expression): (a: Expression) => And {
    return a => ({ tag: 'And', a, b })
  }

  export interface EqualTo {
    tag: 'EqualTo'
    a: Expression
    b: Expression
  }
  export function equalTo(b: Expression): (a: Expression) => EqualTo {
    return a => ({ tag: 'EqualTo', a, b })
  }

  export function propertyEqual(property: string, value: DecodeValue): EqualTo {
    return pipe(
      Expression.property(property),
      Expression.equalTo(decode(value))
    )
  }

  export function propertyFromEqual([property, from]: [string, string], value: DecodeValue): EqualTo {
    return pipe(
      Expression.property(property),
      Expression.from(from),
      Expression.equalTo(decode(value))
    )
  }

  type DecodeValue = string | number | Date

  export function decode(value: string | number | Date) {
    if (typeof value === 'string') {
      return Expression.string(value)
    }
    if (typeof value === 'number') {
      return Expression.number(value)
    }
    return Expression.date(value)
  }
}
