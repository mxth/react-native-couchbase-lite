package com.couchbase.lite

import arrow.core.Either
import arrow.core.extensions.either.applicative.applicative
import arrow.core.filterOrElse
import arrow.core.fix
import arrow.core.flatMap

object RNFrom {
  fun decode(obj: SafeReadableMap): Either<String, From> =
    obj.tag
      .filterOrElse({ it == "From" }, { "invalid From" })
      .flatMap {
        Either.applicative<String>().tupled(
          obj.getMap("query").flatMap { RNSelect.decode(it) },
          obj.getDataSource("dataSource")
        ).fix()
      }
      .map { it.a.from(it.b) }
}
