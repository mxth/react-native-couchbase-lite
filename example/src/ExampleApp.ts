import { CouchbaseLite } from 'react-native-couchbase-lite'
import { Logging } from 'zio/logging'
import { pipe } from 'fp-ts/lib/pipeable'
import { Throwable, ZIO } from 'zio'
import { Alert } from 'react-native'

export type ExampleApp = CouchbaseLite & Logging

export namespace ExampleApp {
  const Live = pipe(
    ZIO.zip(Logging.console((_, i) => i), CouchbaseLite.live),
    ZIO.map(
      ([logging, couchbase]): ExampleApp => ({
        ...logging,
        ...couchbase
      })
    )
  )

  export function run<A>(zio: ZIO<ExampleApp, Throwable, A>) {
    return pipe(
      zio,
      ZIO.provideM(Live),
      ZIO.foldM(
        error => ZIO.effectTotal(() => Alert.alert('Error', error.message)),
        success => ZIO.effectTotal(() => Alert.alert('Success', JSON.stringify(success)))
      ),
      ZIO.run({})
    )
  }
}
