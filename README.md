# react-native-couchbase-lite

React Native Couchbase Lite

## Installation

```sh
npm install react-native-couchbase-lite

maven { url "https://mobile.maven.couchbase.com/maven2/dev/" }
maven { url "https://dl.bintray.com/arrow-kt/arrow-kt/" }

minSdkVersion = 19
```

## Usage

```js
import CouchbaseLite from "react-native-couchbase-lite";

// ...

const deviceName = await CouchbaseLite.getDeviceName();
```

## License

MIT
