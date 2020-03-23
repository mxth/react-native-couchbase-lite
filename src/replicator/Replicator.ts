import { ReplicatorConfiguration } from './ReplicatorConfiguration'
import { CouchbaseLite } from '../CouchbaseLite'
import { pipe } from 'fp-ts/lib/pipeable'
import { ReplicatorTask } from './ReplicatorTask'

export interface Replicator {
  config: ReplicatorConfiguration
}

export namespace Replicator {
  export function debug() {
    return pipe(ReplicatorTask.Debug(), CouchbaseLite.run)
  }
  export function init(config: ReplicatorConfiguration) {
    return pipe(ReplicatorTask.Init(config), CouchbaseLite.run)
  }
  export function start(database: string) {
    return pipe(ReplicatorTask.Start(database), CouchbaseLite.run)
  }
  export function stop(database: string) {
    return pipe(ReplicatorTask.Stop(database), CouchbaseLite.run)
  }
  export function status(database: string) {
    return pipe(
      ReplicatorTask.Status(database),
      CouchbaseLite.run,
    )
  }
}
