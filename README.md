# react-native-couchbase-lite

React Native Couchbase Lite

## Installation

```sh
npm install react-native-couchbase-lite

maven { url "https://mobile.maven.couchbase.com/maven2/dev/" }
maven { url "https://dl.bintray.com/arrow-kt/arrow-kt/" }

minSdkVersion = 21
```

## Usage

```js
import CouchbaseLite from "react-native-couchbase-lite";

// ...

const deviceName = await CouchbaseLite.getDeviceName();
```

## Replication

Server offline
```
  LOG  2020-03-25T14:50:08.908Z INFO replicator.init.success | {}
  LOG  2020-03-25T14:50:12.931Z INFO acquire.success | [{"_subscriber": {"_currentSubscription": null, "_subscriptionsForType": [Object]}}, "0"]
  LOG  2020-03-25T14:50:15.911Z INFO replicator.status.success | {"activityLevel": "IDLE", "completed": 0, "error": null, "total": 0}
  LOG  2020-03-25T14:50:23.957Z INFO replicator.start.success | {}
  LOG  2020-03-25T14:50:23.988Z INFO replicator.change | {"activityLevel": "CONNECTING", "completed": 0, "error": null, "total": 0}
  LOG  2020-03-25T14:51:38.765Z INFO replicator.change | {"activityLevel": "OFFLINE", "completed": 0, "error": {"code": 111, "domain": "POSIXErrorDomain", "message": "Connection refused"}, "total": 0}
  LOG  2020-03-25T14:51:38.830Z INFO replicator.change | {"activityLevel": "CONNECTING", "completed": 0, "error": null, "total": 0}
  LOG  2020-03-25T14:52:54.006Z INFO replicator.change | {"activityLevel": "OFFLINE", "completed": 0, "error": {"code": 111, "domain": "POSIXErrorDomain", "message": "Connection refused"}, "total": 0}
  LOG  2020-03-25T14:52:56.012Z INFO replicator.change | {"activityLevel": "CONNECTING", "completed": 0, "error": null, "total": 0}
  LOG  2020-03-25T14:54:11.165Z INFO replicator.change | {"activityLevel": "OFFLINE", "completed": 0, "error": {"code": 111, "domain": "POSIXErrorDomain", "message": "Connection refused"}, "total": 0}
  LOG  2020-03-25T14:54:15.172Z INFO replicator.change | {"activityLevel": "CONNECTING", "completed": 0, "error": null, "total": 0}
  LOG  2020-03-25T14:55:30.291Z INFO replicator.change | {"activityLevel": "OFFLINE", "completed": 0, "error": {"code": 111, "domain": "POSIXErrorDomain", "message": "Connection refused"}, "total": 0}
  LOG  2020-03-25T14:55:38.298Z INFO replicator.change | {"activityLevel": "CONNECTING", "completed": 0, "error": null, "total": 0}
  LOG  2020-03-25T14:56:53.011Z INFO replicator.change | {"activityLevel": "OFFLINE", "completed": 0, "error": {"code": 111, "domain": "POSIXErrorDomain", "message": "Connection refused"}, "total": 0}
  LOG  2020-03-25T14:57:09.018Z INFO replicator.change | {"activityLevel": "CONNECTING", "completed": 0, "error": null, "total": 0}
  LOG  2020-03-25T14:58:24.191Z INFO replicator.change | {"activityLevel": "OFFLINE", "completed": 0, "error": {"code": 111, "domain": "POSIXErrorDomain", "message": "Connection refused"}, "total": 0}
  LOG  2020-03-25T14:58:52.598Z INFO replicator.stop.success | {}
  LOG  2020-03-25T14:58:52.641Z INFO replicator.change | {"activityLevel": "STOPPED", "completed": 0, "error": null, "total": 0}
```

SSL error
```
 LOG  2020-03-25T15:40:11.910Z INFO replicator.change | {"activityLevel": "CONNECTING", "completed": 0, "error": null, "total": 0}
 LOG  2020-03-25T15:40:12.102Z INFO replicator.change | {"activityLevel": "OFFLINE", "completed": 0, "error": {"code": 11001, "domain": "CouchbaseLite", "message": "WebSocket connection closed by peer"}, "total": 0}
```

Missing authorization
```
 LOG  2020-03-25T15:41:46.635Z INFO replicator.change | {"activityLevel": "CONNECTING", "completed": 0, "error": null, "total": 0}
 LOG  2020-03-25T15:41:46.818Z INFO replicator.change | {"activityLevel": "STOPPED", "completed": 0, "error": {"code": 10401, "domain": "CouchbaseLite", "message": "Unauthorized"}, "total": 0}
```
## License

MIT
