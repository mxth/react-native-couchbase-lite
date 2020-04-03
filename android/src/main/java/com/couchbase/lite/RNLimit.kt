package com.couchbase.lite

import arrow.core.*
import arrow.core.extensions.either.applicative.applicative

object RNLimit {
  fun decode(obj: SafeReadableMap): Either<String, Limit> =
    obj.tag
      .filterOrElse({ it == "Limit" }, { "invalid Limit" })
      .flatMap { obj.getExpression("expression") }
      .flatMap { expression ->
        obj.getMap("query").flatMap { query ->
          RNFrom.decode(query).map { it.limit(expression) }
            .handleErrorWith { RNJoins.decode(query).map { it.limit(expression) } }
            .handleErrorWith { RNWhere.decode(query).map { it.limit(expression) } }
            .handleErrorWith { RNGroupBy.decode(query).map { it.limit(expression) } }
            .handleErrorWith { RNHaving.decode(query).map { it.limit(expression) } }
            .handleErrorWith { RNOrderBy.decode(query).map { it.limit(expression) } }
        }
      }

  fun decodeOffset(obj: SafeReadableMap): Either<String, Limit> =
    obj.tag
      .filterOrElse({ it == "LimitWithOffset" }, { "invalid LimitWithOffset" })
      .flatMap {
        Either.applicative<String>().tupled(
          obj.getExpression("expression"),
          obj.getExpression("offset")
        ).fix()
      }
      .flatMap { tuple ->
        obj.getMap("query").flatMap { query ->
          RNFrom.decode(query).map { it.limit(tuple.a, tuple.b) }
            .handleErrorWith { RNJoins.decode(query).map { it.limit(tuple.a, tuple.b) } }
            .handleErrorWith { RNWhere.decode(query).map { it.limit(tuple.a, tuple.b) } }
            .handleErrorWith { RNGroupBy.decode(query).map { it.limit(tuple.a, tuple.b) } }
            .handleErrorWith { RNHaving.decode(query).map { it.limit(tuple.a, tuple.b) } }
            .handleErrorWith { RNOrderBy.decode(query).map { it.limit(tuple.a, tuple.b) } }
        }
      }
}
