package com.couchbase.lite

import arrow.core.*
import arrow.core.extensions.either.applicative.applicative
import arrow.core.extensions.list.traverse.sequence
import com.reactnativecouchbaselite.RNExpression

object RNGroupBy {
  fun decode(obj: SafeReadableMap): Either<String, GroupBy> =
    obj.tag
      .filterOrElse({ it == "GroupBy" }, { "invalid GroupBy" })
      .flatMap {
        obj.getListMap("expressions").flatMap { expressions ->
          expressions.map { RNExpression.decode(it) }
            .sequence(Either.applicative())
            .fix()
        }
      }
      .map { it.fix().toTypedArray() }
      .flatMap { expressions ->
        obj.getMap("query").flatMap { query ->
          RNFrom.decode(query).map { it.groupBy(*expressions) }
            .handleErrorWith { RNWhere.decode(query).map { it.groupBy(*expressions) } }
        }
      }

}
