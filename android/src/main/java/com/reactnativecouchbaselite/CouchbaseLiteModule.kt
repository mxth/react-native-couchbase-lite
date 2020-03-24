package com.reactnativecouchbaselite

import com.couchbase.lite.*
import com.facebook.react.bridge.*

class CouchbaseLiteModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String {
    return "CouchbaseLite"
  }

  init {
    CouchbaseLite.init(reactContext)
  }

  val eventEmitter = EventEmitter(reactContext)
  // Example method
  // See https://facebook.github.io/react-native/docs/native-modules-android
  @ReactMethod
  fun run(obj: ReadableMap, promise: Promise) {
    RNTask.run(SafeReadableMap(obj), eventEmitter).fold(
      { promise.reject(it, it) },
      { promise.resolve(it) }
    )
  }
}
