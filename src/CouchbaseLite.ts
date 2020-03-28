import { NativeModules, NativeEventEmitter, Platform } from 'react-native'
import { Task, ZIO } from 'zio'
import { ZStream } from 'zio/stream'
import { pipe } from 'fp-ts/lib/pipeable'
import { Observable } from 'rxjs'

type RNTask = {
  group: string
}

export interface CouchbaseLite {
  couchbase: CouchbaseLite.Service
}

export namespace CouchbaseLite {
  export interface Service {
    nativeModule: NativeModule
    eventEmitter: Task<NativeEventEmitter>
  }

  export type NativeModule = {
    run(task: RNTask): Promise<unknown>
    replicatorDebug(): void
  }

  export const live: Task<CouchbaseLite> = ZIO.effect(
    (): CouchbaseLite => ({
      couchbase: {
        nativeModule: NativeModules.CouchbaseLite,
        eventEmitter: ZIO.effect(() => {
          switch (Platform.OS) {
            case 'ios': {
              return new NativeEventEmitter(NativeModules.ReactNativeEventEmitter)
            }
            case 'android': {
              return new NativeEventEmitter(NativeModules.CouchbaseLite)
            }
            default:
              throw new Error(`unsupported platform: ${Platform.OS}`)
          }
        })
      }
    })
  )

  export function run<T extends RNTask>(task: T) {
    return ZIO.accessM((_: CouchbaseLite) => ZIO.fromPromise(() => _.couchbase.nativeModule.run(task)))
  }

  export const eventEmitter = ZIO.accessM((_: CouchbaseLite) => _.couchbase.eventEmitter)

  let counter = 0
  export const nextCounter = ZIO.effectTotal(() => counter++)
  export const nextId = pipe(
    nextCounter,
    ZIO.map(_ => _.toString())
  )

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
