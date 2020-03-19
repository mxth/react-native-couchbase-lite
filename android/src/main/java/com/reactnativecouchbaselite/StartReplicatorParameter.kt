package com.reactnativecouchbaselite

import arrow.core.None
import arrow.core.Option
import com.facebook.react.bridge.ReadableMap

abstract class Read<A> {

  abstract fun read(s: String): Option<A>

  companion object {

    val stringRead: Read<String> =
      object: Read<String>() {
        override fun read(s: String): Option<String> = Option(s)
      }

    val intRead: Read<Int> =
      object: Read<Int>() {
        override fun read(s: String): Option<Int> =
          if (s.matches(Regex("-?[0-9]+"))) Option(s.toInt()) else None
      }
  }
}

data class StartReplicatorParameter(val map: ReadableMap) {
  val valid = parallelValidate
}
