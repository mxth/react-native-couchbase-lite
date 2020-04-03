import * as React from 'react'
import { useState, useEffect } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import {
  Replicator,
  ReplicatorConfiguration,
  ReplicatorType,
  ReplicatorStatus,
  SelectResult, DataSource, Expression, Query, Meta, Join
} from 'react-native-couchbase-lite'
import { Input, Button, CheckBox } from 'react-native-elements'
import { pipe } from 'fp-ts/lib/pipeable'
import { ExampleApp } from './ExampleApp'
import { ZStream } from 'zio/stream'
import { Subject } from 'rxjs'
import { take } from 'rxjs/operators'
import { locallyAnnotateName, log, logEffect } from 'zio/logging'
import { flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import { ZIO } from 'zio'

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
  const [interruptLiveQuery] = useState<Subject<void>>(new Subject())

  useEffect(() => {
    pipe(Replicator.debug(), logEffectReplicator('debug'), ExampleApp.run)
  }, [])

  const addOnChange = () => {
    pipe(
      Replicator.onChange(config.database),
      ZStream.interruptWhen(pipe(interruptOnChange, take(1), _ => _.toPromise())),
      ZStream.foreach(status => pipe(
        ZIO.effectTotal(() => setStatus(status)),
        ZIO.flatMap(_ =>
          pipe(log(status), locallyAnnotateName('replicator', 'change')))
      )),
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
    Query.from(DataSource.database(config.database)),
    Query.where(
      Expression.propertyEqual('typekey', 'Redemption'),
    ),
  )
  const simpleQuery = () => pipe(
    query,
    Query.execute(t.unknown),
    ExampleApp.run
  )

  const explainQuery = () => pipe(
    query,
    Query.explain,
    ExampleApp.run
  )
  const liveQuery = () => pipe(
    query,
    Query.executeLive(t.unknown),
    ZStream.interruptWhen(pipe(interruptLiveQuery, take(1), _ => _.toPromise())),
    ZStream.foreach(_ => pipe(log(_), locallyAnnotateName('query', 'change'))),
    ExampleApp.run
  )


  const stopQuery = () => pipe(
    interruptLiveQuery.next()
  )

  const complexQuery = () => {
    const dataSourceAs = DataSource.databaseAs(config.database)
    const redemptionAlias = 'redemption'
    const pointAlias = 'point'
    const propertyFromRedemption = Expression.propertyFrom(redemptionAlias)
    const propertyFromPoint = Expression.propertyFrom(pointAlias)
    pipe(
      Query.select(
        SelectResult.expression(propertyFromRedemption('agentData')),
        SelectResult.expression(propertyFromPoint('createdDate'))
      ),
      Query.from(
        dataSourceAs(redemptionAlias),
      ),
      Query.join(pipe(
        Join.join(dataSourceAs(pointAlias)),
        Join.on(
          Expression.equal(
            Meta.idFrom(redemptionAlias),
            propertyFromPoint('rewardId'),
          )
        )
      )),
      Query.where(
        Expression.and(
          Expression.equal(propertyFromRedemption('typekey'), 'Redemption'),
          Expression.equal(propertyFromPoint('idPrefix'), 'EarnPointHistory')
        )
      ),
      Query.limitWithOffset(1, 0),
      Query.execute(t.unknown),
      ExampleApp.run
    )
  }

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
          <Button title="LIVE QUERY" onPress={liveQuery} />
          <Button title="STOP QUERY" onPress={stopQuery} />
          <Button title="EXPLAIN" onPress={explainQuery} />
          <Button title="COMPLEX" onPress={complexQuery} />
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
