package com.couchbase.lite

import arrow.core.*
import arrow.core.extensions.either.applicative.applicative
import arrow.core.extensions.list.traverse.sequence
import com.facebook.react.bridge.ReadableArray

class SafeReadableArray(private val arr: ReadableArray) {
  fun getString(index: Int): Either<String, String> =
    arr.getString(index).rightIfNotNull { "$index is null" }

  fun toStringList(): Either<String, ListK<String>> {
    val list = arrayListOf<Either<String, String>>()
    for (index in 0 until arr.size()) {
      list.add(getString(index))
    }
    return list.sequence(Either.applicative()).fix()
      .map { it.fix() }
  }
}
