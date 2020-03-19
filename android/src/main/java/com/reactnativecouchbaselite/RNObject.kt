package com.reactnativecouchbaselite

import arrow.core.Either
import arrow.core.rightIfNotNull
import com.facebook.react.bridge.ReadableMap

data class RNObject(val tag: String, val source: ReadableMap) {
  companion object {
    fun decode(obj: ReadableMap): Either<String, RNObject> = obj
      .getString("tag")
      .rightIfNotNull { "tag not found" }
      .map { RNObject(it, obj) }
  }
}
