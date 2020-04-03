package com.couchbase.lite

import arrow.core.Either
import arrow.core.extensions.either.applicative.applicative
import arrow.core.filterOrElse
import arrow.core.fix
import arrow.core.flatMap

object RNHaving {
  fun decode(obj: SafeReadableMap): Either<String, Having> =
    obj.tag
      .filterOrElse({ it == "Having" }, { "invalid Having" })
      .flatMap {
        Either.applicative<String>().tupled(
          obj.getMap("query").flatMap { RNGroupBy.decode(it) },
          obj.getExpression("expression")
        ).fix()
      }
      .map { it.a.having(it.b) }
}
