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
  | Expression.Between
  | Expression.Divide
  | Expression.EqualTo
  | Expression.GreaterThan
  | Expression.GreaterThanOrEqualTo
  | Expression.IsNot
  | Expression.IsNullOrMissing
  | Expression.LessThan
  | Expression.LessThanOrEqualTo
  | Expression.Like
  | Expression.Modulo
  | Expression.Multiply
  | Expression.NotEqualTo
  | Expression.NotNullOrMissing
  | Expression.Or
  | Expression.Subtract

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

  export interface BooleanValue {
    tag: 'BooleanValue'
    value: boolean
  }
  export function booleanValue(value: boolean): BooleanValue {
    return { tag: 'BooleanValue', value }
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
  export function propertyFrom(source: string): (property: string) => From {
    return property => pipe(
      Expression.property(property),
      Expression.from(source)
    )
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

  export type Add = BinaryExpression<'Add'>

  export const add = BinaryExpression('Add')

  export interface Between {
    tag: 'Between'
    expression: Expression
    min: Expression
    max: Expression
  }
  export function between(min: Expression, max: Expression): (expression: Expression) => Between {
    return expression => ({ tag: 'Between', expression, min, max })
  }

  export type And = BinaryExpression<'And'>
  export const and = BinaryExpression('And')

  export type Divide = BinaryExpression<'Divide'>
  export const divide = BinaryExpression('Divide')

  export type EqualTo = BinaryExpression<'EqualTo'>
  export const equal = BinaryExpression('EqualTo')

  export function propertyEqual(property: string, value: ExpressionInput): EqualTo {
    return equal(
      Expression.property(property),
      decode(value)
    )
  }

  export type GreaterThan = BinaryExpression<'GreaterThan'>
  export const greaterThan = BinaryExpression('GreaterThan')

  export type GreaterThanOrEqualTo = BinaryExpression<'GreaterThanOrEqualTo'>
  export const greaterThanOrEqualTo = BinaryExpression('GreaterThanOrEqualTo')

  export type Is = BinaryExpression<'Is'>
  export const is = BinaryExpression('Is')

  export type IsNot = BinaryExpression<'IsNot'>
  export const isNot = BinaryExpression('IsNot')

  export interface IsNullOrMissing {
    tag: 'IsNullOrMissing'
    expression: Expression
  }
  export function isNullOrMissing(expression: Expression): IsNullOrMissing {
    return { tag: 'IsNullOrMissing', expression }
  }

  export type LessThan = BinaryExpression<'LessThan'>
  export const lessThan = BinaryExpression('LessThan')

  export type LessThanOrEqualTo = BinaryExpression<'LessThanOrEqualTo'>
  export const lessThanOrEqualTo = BinaryExpression('LessThanOrEqualTo')

  export type Like = BinaryExpression<'Like'>
  export const like = BinaryExpression('Like')

  export type Modulo = BinaryExpression<'Modulo'>
  export const modulo = BinaryExpression('Modulo')

  export type Multiply = BinaryExpression<'Multiply'>
  export const multiply = BinaryExpression('Multiply')

  export type NotEqualTo = BinaryExpression<'NotEqualTo'>
  export const notEqualTo = BinaryExpression('NotEqualTo')

  export interface NotNullOrMissing {
    tag: 'NotNullOrMissing'
    expression: Expression
  }
  export function notNullOrMissing(expression: Expression): NotNullOrMissing {
    return { tag: 'NotNullOrMissing', expression }
  }

  export type Or = BinaryExpression<'Or'>
  export const or = BinaryExpression('Or')

  export type Subtract = BinaryExpression<'Subtract'>
  export const subtract = BinaryExpression('Subtract')

  type BinaryExpression<T extends string> = {
    tag: T
    a: Expression
    b: Expression
  }

  function BinaryExpression<T extends string>(tag: T) {
    return (a: ExpressionInput, b: ExpressionInput): BinaryExpression<T> => ({
      tag,
      a: decode(a),
      b: decode(b)
    })
  }

  type ExpressionInput = string | number | Date | Expression

  export function decode(value: ExpressionInput) {
    if (typeof value === 'string') {
      return Expression.string(value)
    }
    if (typeof value === 'number') {
      return Expression.number(value)
    }
    if (value instanceof Date) {
      return Expression.date(value)
    }
    return value
  }
}
