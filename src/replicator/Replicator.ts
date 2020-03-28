import { ReplicatorConfiguration } from './ReplicatorConfiguration'
import { CouchbaseLite } from '../CouchbaseLite'
import { pipe } from 'fp-ts/lib/pipeable'
import { ReplicatorTask } from './ReplicatorTask'
import * as t from 'io-ts'
import { ActivityLevel } from './ActivityLevel'
import { enumC } from '../enumC'
import { ZStream } from 'zio/stream'
import { decode, Throwable, ZIO } from 'zio'
import { Observable } from 'rxjs'
import * as E from 'fp-ts/lib/Either'
import { Logging, logEffect } from 'zio/logging'

export interface Replicator {
  config: ReplicatorConfiguration
}

export const ReplicatorStatus = t.strict({
  activityLevel: enumC(ActivityLevel),
  completed: t.number,
  total: t.number,
  error: t.union([
    t.type({
      code: t.number,
      domain: t.string,
      message: t.string
    }),
    t.null
  ])
})
export type ReplicatorStatus = t.TypeOf<typeof ReplicatorStatus>

export namespace Replicator {
  export function debug() {
    return pipe(
      ReplicatorTask.Debug(),
      CouchbaseLite.run
    )
  }
  export function init(config: ReplicatorConfiguration) {
    return pipe(
      ReplicatorTask.Init(config),
      CouchbaseLite.run
    )
  }
  export function start(database: string) {
    return pipe(
      ReplicatorTask.Start(database),
      CouchbaseLite.run
    )
  }
  export function stop(database: string) {
    return pipe(
      ReplicatorTask.Stop(database),
      CouchbaseLite.run
    )
  }
  export function status(database: string) {
    return pipe(
      ReplicatorTask.Status(database),
      CouchbaseLite.run
    )
  }
  export function onChange(database: string): ZStream<CouchbaseLite & Logging, Throwable, ReplicatorStatus> {
    return ZStream.bracket(
      pipe(
        ZIO.zip(CouchbaseLite.eventEmitter, CouchbaseLite.nextId),
        ZIO.tap(([_, eventId]) =>
          pipe(
            ReplicatorTask.AddChangeListener(database, eventId),
            CouchbaseLite.run
          )
        ),
        logEffect('acquire')
      ),
      ([eventEmitter, eventId]) =>
        pipe(
          new Observable<E.Either<Throwable, ReplicatorStatus>>(observer => {
            eventEmitter.addListener(eventId, event =>
              pipe(
                event,
                decode(ReplicatorStatus),
                E.fold(
                  error => {
                    observer.next(
                      E.left(Throwable(`replicator status decode error: ${error.paths} ${JSON.stringify(error.input)}`))
                    )
                  },
                  success => {
                    observer.next(E.right(success))
                  }
                )
              )
            )
          }),
          ZStream.fromObservableEither
        ),
      ([eventEmitter, eventId]) =>
        pipe(
          ReplicatorTask.RemoveChangeListener(database, eventId),
          CouchbaseLite.run,
          ZIO.flatMap(_ =>
            ZIO.effect(() => {
              eventEmitter.removeAllListeners(eventId)
            })
          ),
          logEffect('release')
        )
    )
  }
}
