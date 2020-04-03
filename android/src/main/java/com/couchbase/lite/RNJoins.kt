package com.couchbase.lite

import arrow.core.Either
import arrow.core.extensions.either.applicative.applicative
import arrow.core.extensions.list.traverse.sequence
import arrow.core.filterOrElse
import arrow.core.fix
import arrow.core.flatMap

object RNJoins {
  fun decode(obj: SafeReadableMap): Either<String, Joins> =
    obj.tag
      .filterOrElse({ it == "Joins" }, { "invalid Joins" })
      .flatMap {
        Either.applicative<String>().tupled(
          obj.getMap("query").flatMap { RNFrom.decode(it) },
          obj.getListMap("joins").flatMap { joins ->
            joins.map { RNJoin.decode(it) }
              .sequence(Either.applicative())
              .fix()
          }
        ).fix()
      }
      .map { it.a.join(*it.b.fix().toTypedArray()) }
}
