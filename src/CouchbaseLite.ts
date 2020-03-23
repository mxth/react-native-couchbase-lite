import { NativeModules, NativeEventEmitter } from 'react-native'
import { Task, ZIO } from 'zio'
import { ZStream } from 'zio/stream'
import { pipe } from 'fp-ts/lib/pipeable'
import { Observable } from 'rxjs'

type RNTask = {
  group: string
}

export interface CouchbaseLite {
  couchbase: CouchbaseLite.NativeModule
}

export namespace CouchbaseLite {
  export type NativeModule = {
    run(task: RNTask): Promise<unknown>
    replicatorDebug(): void
  }

  export const Native: Task<CouchbaseLite> = ZIO.effect(
    (): CouchbaseLite => ({
      couchbase: NativeModules.CouchbaseLite,
    })
  )

  export function run<T extends RNTask>(task: T) {
    return ZIO.accessM((_: CouchbaseLite) => ZIO.fromPromise(() => _.couchbase.run(task)))
  }

  export function onEvent(eventType: string) {
    return ZStream.bracket(
      ZIO.effect(() => new NativeEventEmitter(NativeModules.CouchbaseLite)),
      eventEmitter =>
        pipe(
          new Observable(observer => {
            eventEmitter.addListener(eventType, event => {
              observer.next(event)
            })
          }),
          ZStream.fromObservable
        ),
      eventEmitter =>
        ZIO.effect(() => {
          eventEmitter.removeCurrentListener()
        })
    )
  }
}
