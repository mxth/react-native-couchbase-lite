package com.reactnativecouchbaselite

import arrow.core.Either
import arrow.core.flatMap
import arrow.core.rightIfNotNull
import com.couchbase.lite.SafeReadableMap
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap

data class RNTask(val group: String, val payload: ReadableMap) {
  companion object {
    fun run(obj: SafeReadableMap): Either<String, WritableMap> = obj
      .getString("group")
      .flatMap { group ->
        fun getPayload() = obj.getMap("payload")
        when (group) {
          "Replicator" -> getPayload().flatMap {
            RNReplicator.run(it)
          }
          else -> Either.left("unknown task group $group")
        }
      }
  }
}
