import { ReplicatorConfiguration } from './ReplicatorConfiguration'
import { CouchbaseLite } from '../CouchbaseLite'
import { pipe } from 'fp-ts/lib/pipeable'
import { ReplicatorTask } from './ReplicatorTask'
import * as t from 'io-ts'
import {ActivityLevel} from "./ActivityLevel";
import {enumC} from "../enumC";
import {ZStream} from "zio/stream";

export interface Replicator {
  config: ReplicatorConfiguration
}

export const ReplicatorStatus = t.strict({
  activityLevel: enumC(ActivityLevel),
  completed: t.number,
  total: t.number,
  error: t.union([t.string, t.null]),
})
export type ReplicatorStatus = t.TypeOf<typeof ReplicatorStatus>

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
  export function onChange(database: string) {
    return ZStream.bracket(

    )
  }
}
