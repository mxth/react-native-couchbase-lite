package com.couchbase.lite

import arrow.core.Either
import arrow.core.extensions.either.applicative.applicative
import arrow.core.fix
import arrow.core.flatMap

object RNJoin {
  fun decode(obj: SafeReadableMap): Either<String, Join> =
    obj.tag.flatMap { tag ->
      when (tag) {
        "CrossJoin" -> obj.getDataSource("dataSource")
          .map { Join.crossJoin(it) }

        "On" -> Either.applicative<String>().tupled(
          obj.getMap("join").flatMap { joinOn(it) },
          obj.getExpression("expression")
        ).fix()
          .map { it.a.on(it.b) }

        else -> joinOn(obj)
      }
    }

  private fun joinOn(obj: SafeReadableMap): Either<String, Join.On> =
    obj.tag.flatMap { tag ->
      when (tag) {
        "InnerJoin" -> obj.getDataSource("dataSource")
          .map { Join.innerJoin(it) }

        "Join" -> obj.getDataSource("dataSource")
          .map { Join.join(it) }

        "LeftJoin" -> obj.getDataSource("dataSource")
          .map { Join.leftJoin(it) }

        "LeftOuterJoin" -> obj.getDataSource("dataSource")
          .map { Join.leftOuterJoin(it) }

        else -> Either.left("$tag is not a Join")
      }
    }


}
