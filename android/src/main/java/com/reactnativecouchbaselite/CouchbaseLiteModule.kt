package com.reactnativecouchbaselite

import arrow.core.Either
import arrow.core.flatMap
import com.couchbase.lite.CouchbaseLite
import com.couchbase.lite.Replicator
import com.couchbase.lite.TReplicatorType
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap

class CouchbaseLiteModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  companion object {
    val replicators: HashMap<String, Replicator> = hashMapOf()
  }
  override fun getName(): String {
    return "CouchbaseLite"
  }

  init {
    CouchbaseLite.init(reactContext)
  }

  // Example method
  // See https://facebook.github.io/react-native/docs/native-modules-android
  @ReactMethod
  fun getDeviceName(promise: Promise) {
    promise.resolve(android.os.Build.MODEL)
  }

  @ReactMethod
  fun startReplication(param: ReadableMap) {
    Either.
  }

}
