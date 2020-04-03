import { DataSource } from './DataSource'
import { Expression } from './Expression'

export type Join =
  | JoinOn
  | Join.CrossJoin
  | Join.On

export type JoinOn =
  | Join.InnerJoin
  | Join.Join
  | Join.LeftJoin
  | Join.LeftOuterJoin

export namespace Join {
  export interface CrossJoin {
    tag: 'CrossJoin'
    dataSource: DataSource
  }
  export function crossJoin(dataSource: DataSource): CrossJoin {
    return {
      tag: 'CrossJoin',
      dataSource
    }
  }


  export interface On {
    tag: 'On'
    join: JoinOn
    expression: Expression
  }
  export function on(expression: Expression): (join: JoinOn) => On {
    return join => ({
      tag: 'On',
      join,
      expression,
    })
  }

  export interface InnerJoin {
    tag: 'InnerJoin'
    dataSource: DataSource
  }
  export function innerJoin(dataSource: DataSource): InnerJoin {
    return {
      tag: 'InnerJoin',
      dataSource
    }
  }

  export interface Join {
    tag: 'Join'
    dataSource: DataSource
  }
  export function join(dataSource: DataSource): Join {
    return {
      tag: 'Join',
      dataSource
    }
  }

  export interface LeftJoin {
    tag: 'LeftJoin'
    dataSource: DataSource
  }
  export function leftJoin(dataSource: DataSource): LeftJoin {
    return {
      tag: 'LeftJoin',
      dataSource
    }
  }

  export interface LeftOuterJoin {
    tag: 'LeftOuterJoin'
    dataSource: DataSource
  }
  export function leftOuterJoin(dataSource: DataSource): LeftOuterJoin {
    return {
      tag: 'LeftOuterJoin',
      dataSource
    }
  }
}
