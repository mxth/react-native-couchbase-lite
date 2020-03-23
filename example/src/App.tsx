import * as React from 'react'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Replicator, ReplicatorConfiguration, ReplicatorType } from 'react-native-couchbase-lite'
import { Input, Button, CheckBox } from 'react-native-elements'
import { pipe } from 'fp-ts/lib/pipeable'
import { ExampleApp } from './ExampleApp'

export default function App() {
  const [config, setConfig] = useState<ReplicatorConfiguration>({
    database: 'my-database',
    target: 'wss://10.0.2.2:4984/my-database',
    continuous: true,
    replicatorType: ReplicatorType.PushAndPull,
    authenticator: null,
  })

  const debug = () =>
    pipe(
      Replicator.debug(),
      ExampleApp.run
    )

  const status = () =>
    pipe(
      Replicator.status(config.database),
      ExampleApp.run
    )

  const initReplicator = () =>
    pipe(
      Replicator.init(config),
      ExampleApp.run
    )

  const startReplicator = () =>
    pipe(
      Replicator.start(config.database),
      ExampleApp.run
    )

  const stopReplicator = () => pipe(
    Replicator.stop(config.database),
    ExampleApp.run
  )

  return (
    <View style={styles.container}>
      <Input label="database" value={config.database} onChangeText={database => setConfig({ ...config, database })} />
      <Input label="target" value={config.target} onChangeText={target => setConfig({ ...config, target })} />
      <CheckBox
        title="continuous"
        checked={config.continuous}
        onPress={() => setConfig({ ...config, continuous: !config.continuous })}
      />
      <Button title="Debug replicator" onPress={debug} />
      <Button title="Init replicator" onPress={initReplicator} />
      <Button title="Status replicator" onPress={status} />
      <Button title="Start replicator" onPress={startReplicator} />
      <Button title="Stop replicator" onPress={stopReplicator} />
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
