package com.reactnativecouchbaselite

import arrow.core.flatMap
import com.couchbase.lite.CouchbaseLite
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap

class CouchbaseLiteModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

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
  fun eval(obj: ReadableMap, promise: Promise) {
    RNObject.decode(obj)
      .flatMap { when (it.tag) {
        RNTag.Database -> RNDatabase.decode(it.source)
      } }
  }
}
