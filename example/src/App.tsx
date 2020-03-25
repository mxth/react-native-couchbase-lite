import * as React from 'react'
import { useState, useEffect } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { Replicator, ReplicatorConfiguration, ReplicatorType, ReplicatorStatus } from 'react-native-couchbase-lite'
import { Input, Button, CheckBox } from 'react-native-elements'
import { pipe } from 'fp-ts/lib/pipeable'
import { ExampleApp } from './ExampleApp'
import { ZStream } from 'zio/stream'
import { Subject } from 'rxjs'
import { take } from 'rxjs/operators'

export default function App() {
  const [config, setConfig] = useState<ReplicatorConfiguration>({
    database: 'my-database',
    target: 'wss://10.0.2.2:4984/my-database',
    continuous: true,
    replicatorType: ReplicatorType.PushAndPull,
    authenticator: null,
  })

  const [status, setStatus] = useState<ReplicatorStatus | null>(null)
  const [interruptOnChange] = useState<Subject<void>>(new Subject())

  useEffect(() => {
    pipe(Replicator.debug(), ExampleApp.run)
  }, [])

  const addOnChange = () => {
    pipe(
      Replicator.onChange(config.database),
      ZStream.interruptWhen(pipe(interruptOnChange, take(1), _ => _.toPromise())),
      ZStream.foreachFunction(setStatus),
      ExampleApp.run
    )
  }

  const removeOnChange = () => {
    interruptOnChange.next()
  }

  const getStatus = () => pipe(Replicator.status(config.database), ExampleApp.run)

  const initReplicator = () => pipe(Replicator.init(config), ExampleApp.run)

  const startReplicator = () => pipe(Replicator.start(config.database), ExampleApp.run)

  const stopReplicator = () => pipe(Replicator.stop(config.database), ExampleApp.run)

  return (
    <View style={styles.container}>
      <Input label="database" value={config.database} onChangeText={database => setConfig({ ...config, database })} />
      <Input label="target" value={config.target} onChangeText={target => setConfig({ ...config, target })} />
      <CheckBox
        title="continuous"
        checked={config.continuous}
        onPress={() => setConfig({ ...config, continuous: !config.continuous })}
      />
      {status && (
        <View>
          <Text>activityLevel: {status.activityLevel}</Text>
          <Text>completed: {status.completed}</Text>
          <Text>total: {status.total}</Text>
        </View>
      )}
      <Button title="Init replicator" onPress={initReplicator} />
      <Button title="addOnChange" onPress={addOnChange} />
      <Button title="removeOnChange" onPress={removeOnChange} />
      <Button title="Get status replicator" onPress={getStatus} />
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
