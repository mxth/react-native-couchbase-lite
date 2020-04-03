package com.couchbase.lite

import arrow.core.Either
import arrow.core.extensions.either.applicative.applicative
import arrow.core.extensions.list.traverse.sequence
import arrow.core.filterOrElse
import arrow.core.fix
import arrow.core.flatMap
import com.reactnativecouchbaselite.RNSelectResult

object RNSelect {
  fun decode(obj: SafeReadableMap): Either<String, Select> =
    obj.tag
      .filterOrElse({ it == "Select" }, { "invalid Select" })
      .flatMap { obj.getListMap("results") }
      .flatMap { it
        .map { RNSelectResult.decode(it) }
        .sequence(Either.applicative())
        .fix()
        .map { results ->
          QueryBuilder.select(*results.fix().toTypedArray())
        }
      }
}
