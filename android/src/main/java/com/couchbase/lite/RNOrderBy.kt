package com.couchbase.lite

import arrow.core.*
import arrow.core.extensions.either.applicative.applicative
import arrow.core.extensions.list.traverse.sequence

object RNOrderBy {
  fun decode(obj: SafeReadableMap): Either<String, OrderBy> =
    obj.tag
      .filterOrElse({ it == "OrderBy" }, { "invalid OrderBy" })
      .flatMap {
        obj.getListMap("orderings").flatMap { expressions ->
          expressions.map { RNOrdering.decode(it) }
            .sequence(Either.applicative())
            .fix()
        }
      }
      .map { it.fix().toTypedArray() }
        .flatMap { orderings ->
          obj.getMap("query").flatMap { query ->
            RNFrom.decode(query).map { it.orderBy(*orderings) }
              .handleErrorWith { RNJoins.decode(query).map { it.orderBy(*orderings) } }
              .handleErrorWith { RNWhere.decode(query).map { it.orderBy(*orderings) } }
              .handleErrorWith { RNGroupBy.decode(query).map { it.orderBy(*orderings) } }
              .handleErrorWith { RNHaving.decode(query).map { it.orderBy(*orderings) } }
          }
        }
}
