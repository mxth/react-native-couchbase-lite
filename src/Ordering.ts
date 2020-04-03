import { Expression } from './Expression'

export type Ordering =
  | Ordering.Ascending
  | Ordering.Descending

export type SortOder =
  | Ordering.OrderingExpression
  | Ordering.Property

export namespace Ordering {
  export interface OrderingExpression {
    tag: 'OrderingExpression'
    expression: Expression
  }
  export function expression(expression: Expression): OrderingExpression {
    return {
      tag: 'OrderingExpression',
      expression
    }
  }

  export interface Property {
    tag: 'Property'
    property: string
  }
  export function property(property: string): Property {
    return {
      tag: 'Property',
      property
    }
  }

  export interface Ascending {
    tag: 'Ascending'
    ordering: SortOder
  }
  export function ascending(ordering: SortOder): Ascending {
    return {
      tag: 'Ascending',
      ordering
    }
  }

  export interface Descending {
    tag: 'Descending'
    ordering: SortOder
  }
  export function descending(ordering: SortOder): Descending {
    return {
      tag: 'Descending',
      ordering
    }
  }
}
