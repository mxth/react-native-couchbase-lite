import * as React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { CouchbaseLite, Database } from 'react-native-couchbase-lite'
import { pipe } from 'fp-ts/lib/pipeable'

export default function App() {
  const [deviceName] = React.useState('')

  React.useEffect(() => {
    pipe(new Database('my-database'), CouchbaseLite._eval)()
  }, [])

  return (
    <View style={styles.container}>
      <Text>Device name: {deviceName}</Text>
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
