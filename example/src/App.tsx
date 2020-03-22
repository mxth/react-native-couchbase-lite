import * as React from 'react'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Replicator, ReplicatorConfiguration, ReplicatorType } from 'react-native-couchbase-lite'
import { Input, Button } from 'react-native-elements'
import { pipe } from 'fp-ts/lib/pipeable'
import { ExampleApp } from './ExampleApp'
import { Option } from 'fp-ts/lib/Option'
import { ZIO } from 'zio/lib/ZIO'
import * as O from 'fp-ts/lib/Option'
import { Throwable } from 'zio'

export default function App() {
  const [config, setConfig] = useState<ReplicatorConfiguration>({
    database: 'my-database',
    target: 'wss://10.0.2.2:4984/my-database',
    continuous: true,
    replicatorType: ReplicatorType.PushAndPull,
    authenticator: null,
  })

  const [replicator, setReplicator] = useState<Option<Replicator>>(O.none)

  const getReplicator = () => pipe(
    ZIO.fromOption(replicator),
    ZIO.mapError(_ => Throwable('replicator not found')),
  )

  const initReplicator = () =>
    pipe(
      Replicator.init(config),
      ZIO.tap(replicator =>
        ZIO.effectTotal(() => {
          setReplicator(O.some(replicator))
        })
      ),
      ExampleApp.run
    )

  const startReplicator = () =>
    pipe(
      getReplicator(),
      ZIO.flatMap(Replicator.start),
      ExampleApp.run
    )

  const stopReplicator = () => pipe(
    getReplicator(),
    ZIO.flatMap(Replicator.stop),
    ExampleApp.run
  )

  return (
    <View style={styles.container}>
      <Input label="database" value={config.database} onChangeText={database => setConfig({ ...config, database })} />
      <Input label="target" value={config.target} onChangeText={target => setConfig({ ...config, target })} />
      <Button title="Init replicator" onPress={initReplicator} />
      <Button title="Start replicator" onPress={startReplicator} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
