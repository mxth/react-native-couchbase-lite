package com.couchbase.lite

import arrow.core.Either
import arrow.core.flatMap

object RNOrdering {
  fun decode(obj: SafeReadableMap): Either<String, Ordering> =
    obj.tag.flatMap { tag ->
      when (tag) {
        "Ascending" -> obj.getMap("ordering")
          .flatMap { sortOrder(it) }
          .map { it.ascending() }

        "Descending" -> obj.getMap("ordering")
          .flatMap { sortOrder(it) }
          .map { it.descending() }

        else -> sortOrder(obj)
      }
    }

  private fun sortOrder(obj: SafeReadableMap): Either<String, Ordering.SortOrder> =
    obj.tag.flatMap { tag ->
      when (tag) {
        "OrderingExpression" -> obj.getExpression("expression")
          .map { Ordering.expression(it) }

        "Property" -> obj.getString("property")
          .map { Ordering.property(it) }

        else -> Either.left("$tag is not Ordering")
      }
    }
}
