package com.reactnativecouchbaselite

import arrow.core.Either
import arrow.core.flatMap
import com.couchbase.lite.SafeReadableMap
import com.couchbase.lite.SelectResult

object RNSelectResult {
  fun decode(obj: SafeReadableMap): Either<String, SelectResult> =
    obj.tag.flatMap { tag -> when (tag) {
      "All" -> Either.right(SelectResult.all())

      "Expression" -> obj.getMap("expression")
        .flatMap { RNExpression.decode(it) }
        .map { SelectResult.expression(it) }

      "Property" -> obj.getString("property")
        .map { SelectResult.property(it) }

      "From" -> obj.getString("alias").map { SelectResult.all().from(it) }

      else -> Either.left("$tag is not a RNSelectResult")
    } }
}
