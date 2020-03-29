package com.couchbase.lite

import arrow.core.*
import arrow.core.extensions.either.applicative.applicative
import arrow.core.extensions.list.traverse.sequence
import com.facebook.react.bridge.ReadableArray

class SafeReadableArray(private val arr: ReadableArray) {
  fun getString(index: Int): Either<String, String> =
    arr.getString(index).rightIfNotNull { "$index is null" }

  fun getMap(index: Int): Either<String, SafeReadableMap> =
    arr.getMap(index).rightIfNotNull { "$index is null" }
      .map { SafeReadableMap(it) }

  fun toListString(): Either<String, ListK<String>> {
    val list = arrayListOf<Either<String, String>>()
    for (index in 0 until arr.size()) {
      list.add(getString(index))
    }
    return list.sequence(Either.applicative()).fix()
      .map { it.fix() }
  }

  fun toListMap(): Either<String, ListK<SafeReadableMap>> {
    val list = arrayListOf<Either<String, SafeReadableMap>>()
    for (index in 0 until arr.size()) {
      list.add(getMap(index))
    }
    return list.sequence(Either.applicative()).fix()
      .map { it.fix() }
  }
}
