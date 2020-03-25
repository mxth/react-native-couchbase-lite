package com.couchbase.lite

import arrow.core.Either
import arrow.core.flatMap
import arrow.core.rightIfNotNull
import com.facebook.react.bridge.ReadableMap

class SafeReadableMap(private val map: ReadableMap) {
  fun getString( name: String): Either<String, String> =
    map.getString(name).rightIfNotNull { "$name is null" }
  fun getMap(name: String): Either<String, SafeReadableMap> =
    map.getMap(name).rightIfNotNull { "$name is null" }
      .map { SafeReadableMap(it) }
  fun getBoolean(name: String): Boolean = map.getBoolean(name)

  fun getArray(name: String) = map.getArray(name).rightIfNotNull { "$name is null" }
    .map { SafeReadableArray(it) }

  fun getListString(name: String) = getArray(name).flatMap { it.toStringList() }
}
