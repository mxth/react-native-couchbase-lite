import { SelectResult } from './SelectResult'
import { DataSource } from './DataSource'
import { Expression } from './Expression'
import { pipe } from 'fp-ts/lib/pipeable'
import { CouchbaseLite } from './CouchbaseLite'
import { Any, decode, Throwable, ZIO } from 'zio'
import { ZStream } from 'zio/stream'
import { Observable } from 'rxjs'
import * as E from 'fp-ts/lib/Either'
import * as t from 'io-ts'
import { Logging } from 'zio/logging'
import { Join } from './Join'
import { Ordering } from './Ordering'

export type Query =
  | Query.Select
  | Query.From
  | Query.Joins
  | Query.Where
  | Query.GroupBy
  | Query.Having
  | Query.OrderBy
  | Query.Limit

export interface QueryTask {
  group: 'Query'
  payload: QueryTask.Payload
}
export namespace QueryTask {
  export type Payload = Execute | Explain | AddChangeListener | RemoveChangeListener

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

  export interface AddChangeListener {
    tag: 'AddChangeListener'
    query: Query
    listenerId: string
  }
  export function addChangeListener(query: Query, listenerId: string): QueryTask {
    return init({
      tag: 'AddChangeListener',
      query,
      listenerId
    })
  }

  export interface RemoveChangeListener {
    tag: 'RemoveChangeListener'
    listenerId: string
  }
  export function removeChangeListener(listenerId: string): QueryTask {
    return init({
      tag: 'RemoveChangeListener',
      listenerId
    })
  }
}

export function QueryResult<C extends t.Mixed>(codec: C) {
  return t.type({
    result: t.array(codec)
  })
}
export interface QueryResult<A> {
  result: Array<A>
}

export namespace Query {
  export function execute<C extends t.Mixed>(
    codec: C
  ): (query: Query) => ZIO<CouchbaseLite, Throwable, Array<t.TypeOf<C>>> {
    return query =>
      pipe(
        query,
        QueryTask.execute,
        CouchbaseLite.apply,
        ZIO.flatMap(result => pipe(
          result,
          ZIO.decode(QueryResult(codec)),
          ZIO.bimap(error => Throwable(`query result decode error: ${error.paths} ${JSON.stringify(error.input)}`), _ => _.result)
        )),
      )
  }

  export function explain(query: Query): ZIO<CouchbaseLite, Throwable, Any> {
    return pipe(
      query,
      QueryTask.explain,
      CouchbaseLite.apply
    )
  }

  export function executeLive<C extends t.Mixed>(
    codec: C
  ): (query: Query) => ZStream<CouchbaseLite & Logging, Throwable, Array<t.TypeOf<C>>> {
    return query => pipe(
      ZIO.zip(CouchbaseLite.eventEmitter, CouchbaseLite.nextId),
      ZStream.fromEffect,
      ZStream.flatMap(([eventEmitter, listenerId]) =>
        pipe(
          new Observable<E.Either<Throwable, QueryResult<t.TypeOf<C>>>>(observer => {
            const subscription = eventEmitter.addListener('Query.Change', event =>
              pipe(
                event,
                decode(t.type({ listenerId: t.string })),
                E.fold(
                  error => {
                    observer.next(
                      E.left(Throwable(`query change listenerId decode error: ${error.paths} ${JSON.stringify(error.input)}`))
                    )
                  },
                  success => {
                    if (success.listenerId === listenerId) {
                      pipe(
                        event,
                        decode(QueryResult(codec)),
                        E.fold(
                          error => {
                            observer.next(
                              E.left(Throwable(`query change decode error: ${error.paths} ${JSON.stringify(error.input)}`))
                            )
                          },
                          success => {
                            observer.next(E.right(success))
                          }
                        )
                      )
                    }
                  }
                )
              )
            )

            pipe(
              QueryTask.addChangeListener(query, listenerId),
              CouchbaseLite.apply,
              ZIO.provideM(CouchbaseLite.live),
              ZIO.run({})
            )

            return () => {
              pipe(
                QueryTask.removeChangeListener(listenerId),
                CouchbaseLite.apply,
                ZIO.flatMap(_ => ZIO.effect(() => subscription.remove())),
                ZIO.provideM(CouchbaseLite.live),
                ZIO.run({})
              )
            }
          }),
          ZStream.fromObservableEither,
          ZStream.map(_ => _.result)
        )
      )
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
    query: Select
    dataSource: DataSource
  }
  export function from(dataSource: DataSource): (query: Select) => From {
    return query => ({ tag: 'From', query, dataSource })
  }

  export type JoinRouter = From
  export interface Joins {
    tag: 'Joins'
    query: JoinRouter
    joins: Join[]
  }
  export function join(...joins: Join[]): (query: JoinRouter) => Joins {
    return query => ({ tag: 'Joins', query, joins })
  }

  export type WhereRouter = From | Joins
  export interface Where {
    tag: 'Where'
    query: WhereRouter
    expression: Expression
  }
  export function where(expression: Expression): (query: WhereRouter) => Where {
    return query => ({ tag: 'Where', query, expression })
  }

  export type GroupByRouter = From | Where
  export interface GroupBy {
    tag: 'GroupBy'
    query: GroupByRouter
    expressions: Expression[]
  }
  export function groupBy(...expressions: Expression[]): (query: GroupByRouter) => GroupBy {
    return query => ({ tag: 'GroupBy', query, expressions })
  }

  export type OrderByRouter = From | Joins | Where | GroupBy | Having
  export interface OrderBy {
    tag: 'OrderBy'
    query: OrderByRouter
    orderings: Ordering[]
  }
  export function orderBy(...orderings: Ordering[]): (query: OrderByRouter) => OrderBy {
    return query => ({ tag: 'OrderBy', query, orderings })
  }

  export type CanLimit = From | Joins | Where | GroupBy | Having | OrderBy
  export type Limit = Limit.Limit | Limit.LimitWithOffset
  export namespace Limit {
    export interface Limit {
      tag: 'Limit'
      query: CanLimit
      expression: Expression
    }
    export interface LimitWithOffset {
      tag: 'LimitWithOffset'
      query: CanLimit
      expression: Expression
      offset: Expression
    }
  }
  export function limit(value: number): (query: CanLimit) => Limit.Limit {
    return query => ({
      tag: 'Limit',
      query,
      expression: Expression.number(value)
    })
  }
  export function limitWithOffset(value: number, offset: number): (query: CanLimit) => Limit.LimitWithOffset {
    return query => ({
      tag: 'LimitWithOffset',
      query,
      expression: Expression.number(value),
      offset: Expression.number(offset),
    })
  }

  export type HavingRouter = GroupBy
  export interface Having {
    tag: 'Having'
    query: HavingRouter
    expression: Expression
  }
  export function having(expression: Expression): (query: HavingRouter) => Having {
    return query => ({
      tag: 'Having',
      query,
      expression
    })
  }
}
