import { SelectResult } from './SelectResult'
import { DataSource } from './DataSource'
import { Expression } from './Expression'
import { pipe } from 'fp-ts/lib/pipeable'
import * as O from 'fp-ts/lib/Option'
import { CouchbaseLite } from './CouchbaseLite'
import { Any, Throwable, UIO, ZIO } from 'zio'

export type Query =
  | Query.Select
  | Query.From
  | Query.Where

export interface QueryTask {
  group: 'Query',
  payload: QueryTask.Payload
}
export namespace QueryTask {
  export type Payload = Execute | Explain

  export function init(payload: Payload): QueryTask {
    return {
      group: 'Query',
      payload
    }
  }

  export interface Execute {
    tag: 'Execute'
    query: Query
  }
  export function execute(query: Query): QueryTask {
    return init({
      tag: 'Execute',
      query
    })
  }

  export interface Explain {
    tag: 'Explain'
    query: Query
  }
  export function explain(query: Query): QueryTask {
    return init({
      tag: 'Explain',
      query
    })
  }

  const queryIds = new Map<Query, string>()

  export function getQueryId(query: Query): UIO<string> {
    return pipe(
      queryIds.get(query),
      O.fromNullable,
      O.fold(
        () => pipe(
          CouchbaseLite.nextId,
          ZIO.tap(id => ZIO.effectTotal(() => {
            queryIds.set(query, id)
          }))
        ),
        ZIO.succeed
      )
    )
  }
}

export namespace Query {
  export function execute(query: Query): ZIO<CouchbaseLite, Throwable, Any> {
    return pipe(
      query,
      QueryTask.execute,
      CouchbaseLite.run
    )
  }
  export function explain(query: Query): ZIO<CouchbaseLite, Throwable, Any> {
    return pipe(
      query,
      QueryTask.explain,
      CouchbaseLite.run
    )
  }

  export interface Select {
    tag: 'Select'
    results: SelectResult[]
  }
  export function select(...results: SelectResult[]): Select {
    return { tag: 'Select', results }
  }

  export interface From {
    tag: 'From'
    dataSource: DataSource
    query: Select
  }
  export function from(dataSource: DataSource): (query: Select) => From {
    return query => ({ tag: 'From', dataSource, query })
  }

  export interface Where {
    tag: 'Where'
    expression: Expression
    query: From
  }
  export function where(expression: Expression): (query: From) => Where {
    return query => ({ tag: 'Where', expression, query })
  }
}
