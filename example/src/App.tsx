import * as React from 'react'
import { useState, useEffect } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import {
  Replicator,
  ReplicatorConfiguration,
  ReplicatorType,
  ReplicatorStatus,
  SelectResult, DataSource, Expression
} from 'react-native-couchbase-lite'
import { Input, Button, CheckBox } from 'react-native-elements'
import { pipe } from 'fp-ts/lib/pipeable'
import { ExampleApp } from './ExampleApp'
import { ZStream } from 'zio/stream'
import { Subject } from 'rxjs'
import { take } from 'rxjs/operators'
import { locallyAnnotateName, log, logEffect } from 'zio/logging'
import { flow } from 'fp-ts/lib/function'
import { Query } from '../../src/Query'
import { Database } from '../../src/Database'

function logEffectReplicator(task: string) {
  return flow(logEffect(task), locallyAnnotateName('replicator'))
}

export default function App() {
  const [config, setConfig] = useState<ReplicatorConfiguration>({
    database: 'agentapp',
    target: 'ws://10.0.2.2:4984/agentapp',
    continuous: true,
    replicatorType: ReplicatorType.PushAndPull,
    channels: ['!']
  })

  const [status, setStatus] = useState<ReplicatorStatus | null>(null)
  const [interruptOnChange] = useState<Subject<void>>(new Subject())

  useEffect(() => {
    pipe(Replicator.debug(), logEffectReplicator('debug'), ExampleApp.run)
  }, [])

  const addOnChange = () => {
    pipe(
      Replicator.onChange(config.database),
      ZStream.tap(_ => pipe(log(_), locallyAnnotateName('replicator', 'change'))),
      ZStream.interruptWhen(pipe(interruptOnChange, take(1), _ => _.toPromise())),
      ZStream.foreachFunction(setStatus),
      ExampleApp.run
    )
  }

  const removeOnChange = () => {
    interruptOnChange.next()
  }

  const getStatus = () => pipe(Replicator.status(config.database), logEffectReplicator('status'), ExampleApp.run)

  const initReplicator = () => pipe(Replicator.init(config), logEffectReplicator('init'), ExampleApp.run)

  const startReplicator = () => pipe(Replicator.start(config.database), logEffectReplicator('start'), ExampleApp.run)

  const stopReplicator = () => pipe(Replicator.stop(config.database), logEffectReplicator('stop'), ExampleApp.run)

  const query = pipe(
    Query.select(
      SelectResult.all()
    ),
    Query.from(pipe(
      Database.init(config.database),
      DataSource.database
    )),
    Query.where(pipe(
      Expression.property('typekey'),
      Expression.equalTo('Redemption')
    )),
  )
  const simpleQuery = () => pipe(
    query,
    Query.execute,
    ExampleApp.run
  )
  const explainQuery = () => pipe(
    query,
    Query.explain,
    ExampleApp.run
  )

  return (
    <View style={styles.container}>
      <Input label="database" value={config.database} onChangeText={database => setConfig({ ...config, database })} />
      <Input label="target" value={config.target} onChangeText={target => setConfig({ ...config, target })} />
      <Input
        label="channels"
        value={config.channels?.join(',')}
        onChangeText={channels => setConfig({ ...config, channels: channels.split(',') })}
      />
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
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around' }}>
        <View>
          <Button title="INIT" onPress={initReplicator} />
          <Button title="ADD LISTENER" onPress={addOnChange} />
          <Button title="START" onPress={startReplicator} />
          <Button title="STOP" onPress={stopReplicator} />
          <Button title="REMOVE LISTENER" onPress={removeOnChange} />
          <Button title="STATUS" onPress={getStatus} />
        </View>
        <View>
          <Button title="QUERY" onPress={simpleQuery} />
          <Button title="EXPLAIN" onPress={explainQuery} />
        </View>
      </View>

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
