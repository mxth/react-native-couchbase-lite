package com.couchbase.lite

import arrow.core.Either
import arrow.core.filterOrElse
import arrow.core.flatMap
import arrow.core.handleErrorWith

object RNWhere {
  fun decode(obj: SafeReadableMap): Either<String, Where> =
    obj.tag
      .filterOrElse({ it == "Where" }, { "invalid Where" })
      .flatMap { obj.getExpression("expression") }
      .flatMap { expression ->
        obj.getMap("query").flatMap { query ->
          RNFrom.decode(query).map { it.where(expression) }
            .handleErrorWith { RNJoins.decode(query).map { it.where(expression) } }
        }
      }
}
