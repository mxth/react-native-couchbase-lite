export type Expression =
  | PropertyExpression
  | Expression.DateE
  | Expression.Not
  | Expression.Number
  | Expression.String
  | Expression.PropertyFrom
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

  export interface PropertyFrom {
    tag: 'PropertyFrom'
    alias: string
    expression: PropertyExpression
  }
  export function from(alias: string): (expression: PropertyExpression) => PropertyFrom {
    return expression => ({
      tag: 'PropertyFrom',
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
  export function equalTo(b: string | number | Date): (a: Expression) => EqualTo {
    function mapExpr() {
      if (typeof b === 'string') {
        return Expression.string(b)
      }
      if (typeof b === 'number') {
        return Expression.number(b)
      }
      return Expression.date(b)
    }
    return a => ({ tag: 'EqualTo', a, b: mapExpr() })
  }
}
