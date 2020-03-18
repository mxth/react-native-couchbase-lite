package com.reactnativecouchbaselite

import arrow.core.Either
import arrow.core.extensions.fx
import arrow.core.flatMap
import arrow.core.rightIfNotNull
import com.facebook.react.bridge.ReadableMap

data class RNObject(val tag: RNTag, val source: ReadableMap) {
  companion object {
    fun decode(obj: ReadableMap): Either<String, RNObject> = obj
      .getString("tag")
      .rightIfNotNull { "tag not found" }
      .flatMap { tag -> Either
        .fx<IllegalArgumentException, RNTag> { RNTag.valueOf(tag) }
        .mapLeft { "tag invalid: $tag" }
      }
      .map { RNObject(it, obj) }
  }
}
