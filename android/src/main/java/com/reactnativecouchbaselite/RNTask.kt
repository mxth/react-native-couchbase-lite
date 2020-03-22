package com.reactnativecouchbaselite

import arrow.core.Either
import arrow.core.rightIfNotNull
import com.facebook.react.bridge.ReadableMap

data class RNTask(val group: String, val payload: ReadableMap) {
  companion object {
    fun decode(obj: ReadableMap): Either<String, RNTask> = obj
      .getString("group")
      .rightIfNotNull { "task group not found" }
      .map { RNTask(it, obj) }
  }
}
