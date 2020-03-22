package com.reactnativecouchbaselite

import arrow.core.Either
import arrow.core.extensions.either.foldable.fold
import arrow.core.flatMap
import com.couchbase.lite.*
import com.facebook.react.bridge.*

private fun <A> Either<String, A>.foldUnit(promise: Promise): Unit =
  this.fold(
    { promise.reject(it, it) },
    { promise.resolve(null) }
  )

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
  fun run(promise: Promise) {
    promise.resolve(android.os.Build.MODEL)
  }

  @ReactMethod
  fun replicatorDebug(): Unit {
    Database.setLogLevel(LogDomain.REPLICATOR, LogLevel.VERBOSE)
  }

  @ReactMethod
  fun replicatorInit(obj: ReadableMap, promise: Promise): Unit =
    RNReplicatorConfiguration.decode(obj)
      .flatMap { RNReplicator.init(it) }
      .foldUnit(promise)

  @ReactMethod
  fun replicatorStart(database: String, promise: Promise): Unit =
    RNReplicator.start(database)
      .foldUnit(promise)

  @ReactMethod
  fun replicatorStop(database: String, promise: Promise): Unit =
    RNReplicator.stop(database)
      .foldUnit(promise)
}
