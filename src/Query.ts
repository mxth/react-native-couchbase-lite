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

export type Query = Query.Select | Query.From | Query.Where

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
        CouchbaseLite.run,
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
      CouchbaseLite.run
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
              CouchbaseLite.run,
              ZIO.provideM(CouchbaseLite.live),
              ZIO.run({})
            )

            return () => {
              pipe(
                QueryTask.removeChangeListener(listenerId),
                CouchbaseLite.run,
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
