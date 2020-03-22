import { NativeModules } from 'react-native'
import { ReplicatorConfiguration } from './Replicator'
import { Task, ZIO } from 'zio'

interface ReplicatorTask {
  group: 'Replicator'
  payload:
    | {
        tag: 'debug'
      }
    | {
        tag: 'init'
        config: ReplicatorConfiguration
      }
    | {
        tag: 'start'
        database: string
      }
    | {
        tag: 'stop'
        database: string
      }
}

type RNTask = ReplicatorTask

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
}
