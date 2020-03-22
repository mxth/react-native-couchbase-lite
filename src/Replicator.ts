import { ZIO } from 'zio'
import { CouchbaseLite } from './CouchbaseLite'
import { pipe } from 'fp-ts/lib/pipeable'

export interface Replicator {
  config: ReplicatorConfiguration
}

export interface ReplicatorConfiguration {
  database: string
  target: string
  replicatorType: ReplicatorType
  continuous: boolean
  authenticator: Authenticator | null
  channels?: string[]
  headers?: Record<string, string>
}

export enum ReplicatorType {
  Pull = 'Pull',
  Push = 'Push',
  PushAndPull = 'PushAndPull',
}

type Authenticator =
  | {
      tag: 'BasicAuthenticator'
      username: string
      password: string
    }
  | {
      tag: 'SessionAuthenticator'
      session: string
    }

export namespace Replicator {
  export function init(config: ReplicatorConfiguration) {
    return ZIO.accessM((_: CouchbaseLite) =>
      pipe(
        ZIO.fromPromise(() => _.couchbase.replicatorInit(config)),
        ZIO.map((): Replicator => ({ config }))
      )
    )
  }
  export function start(replicator: Replicator) {
    return ZIO.accessM((_: CouchbaseLite) =>
      ZIO.fromPromise(() =>
        _.couchbase.replicatorStart(replicator.config.database)
      )
    )
  }
  export function stop(replicator: Replicator) {
    return ZIO.accessM((_: CouchbaseLite) =>
      ZIO.fromPromise(() =>
        _.couchbase.replicatorStop(replicator.config.database)
      )
    )
  }
}
