package com.couchbase.lite

import arrow.core.Either
import arrow.core.extensions.fx
import arrow.core.flatMap
import arrow.core.rightIfNotNull
import com.facebook.react.bridge.NoSuchKeyException
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.reactnativecouchbaselite.RNDataSource
import com.reactnativecouchbaselite.RNExpression
import java.lang.Exception

class SafeReadableMap(val map: ReadableMap) {
  val tag = getString("tag")

  fun getString(name: String): Either<String, String> =
    try {
      map.getString(name).rightIfNotNull { "$name is null" }
    } catch (e: NoSuchKeyException) {
      Either.left("$name is undefined")
    }

  fun getNumber(name: String): Either<String, Number> =
    try {
      map.getDouble(name).rightIfNotNull { "$name is null" }
    } catch (e: NoSuchKeyException) {
      Either.left("$name is undefined")
    }

  fun getMap(name: String): Either<String, SafeReadableMap> =
    try {
      map.getMap(name).rightIfNotNull { "$name is null" }
        .map { SafeReadableMap(it) }
    } catch (e: NoSuchKeyException) {
      Either.left("$name is undefined")
    }

  fun getBoolean(name: String): Boolean = map.getBoolean(name)

  fun getArray(name: String): Either<String, SafeReadableArray> =
    try {
      map.getArray(name)
        .rightIfNotNull { "$name is null" }
        .map { SafeReadableArray(it) }
    } catch (e: NoSuchKeyException) {
      Either.left("$name is undefined")
    }

  fun getListString(name: String) = getArray(name).flatMap { it.toListString() }

  fun getListMap(name: String) = getArray(name).flatMap { it.toListMap() }


  fun getDataSource(name: String) = getMap(name).flatMap { RNDataSource.decode(it) }

  fun getExpression(name: String) = getMap(name).flatMap { RNExpression.decode(it) }

  fun getQuery(name: String) = getMap(name).flatMap { RNQuery.decode(it) }
}
