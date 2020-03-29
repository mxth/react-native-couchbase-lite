import { Expression } from './Expression'

export type SelectResult =
  | SelectResult.All
  | SelectResult.SelectResultExpression
  | SelectResult.Property
  | SelectResult.From
  | SelectResult.As

export namespace SelectResult {
  export interface All {
    tag: 'All'
  }
  export function all(): All {
    return { tag: 'All' }
  }

  export interface SelectResultExpression {
    tag: 'Expression'
    expression: Expression
  }
  export function expression(expression: Expression): SelectResultExpression {
    return { tag: 'Expression', expression }
  }

  export interface Property {
    tag: 'Property'
    property: string
  }
  export function property(property: string): Property {
    return { tag: 'Property', property }
  }

  export interface From {
    tag: 'From'
    alias: string
  }
  export function allFrom(alias: string): From {
    return {
      tag: 'From',
      alias,
    }
  }

  export interface As {
    tag: 'As'
    alias: string
    selectResult: SelectResultExpression | Property
  }
  export function as(alias: string): (selectResult: Expression | Property) => As {
    return selectResult => ({
      tag: 'As',
      alias,
      selectResult
    })
  }
}
