package com.reactnativecouchbaselite

import arrow.core.*
import arrow.core.extensions.either.applicative.applicative
import com.couchbase.lite.*
import java.text.SimpleDateFormat
import java.util.*

object RNExpression {

  private fun toDate(str: String): Either<String, Date> =
    SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'").parse(str)
      .rightIfNotNull { "$str is not a ISO string" }

  private fun propertyExpression(obj: SafeReadableMap): Either<String, PropertyExpression> =
    obj.tag.flatMap { tag -> when (tag) {
      "All" -> Either.right(Expression.all())
      "Property" -> obj.getString("property")
        .map { Expression.property(it) }
      else -> Either.left("$tag is not a valid PropertyExpression")
    } }

  fun decode(obj: SafeReadableMap): Either<String, Expression> =
    obj.tag.flatMap { tag -> when (tag) {
      "Date" -> obj.getString("value")
        .flatMap { toDate(it) }
        .map { Expression.date(it) }

      "Not" -> obj.getMap("expression")
        .flatMap { decode(it) }
        .map { Expression.not(it) }

      "Number" -> obj.getNumber("value")
        .map { Expression.number(it) }

      "String" -> obj.getString("value")
        .map { Expression.string(it) }

      "From" -> obj.getString("alias")
        .flatMap { alias ->
          obj.getMap("expression").flatMap { expr ->
            propertyExpression(expr).map { it.from(alias) }
              .handleErrorWith {
                metaExpression(expr).map { it.from(alias) }
              }
          }
        }

      "Add" -> getBinaryOperands(obj).map { it.a.add(it.b) }

      "And" -> getBinaryOperands(obj).map { it.a.and(it.b) }

      "Between" -> Either.applicative<String>()
        .tupled(
          obj.getMap("expression").flatMap { decode(it) },
          obj.getMap("min").flatMap { decode(it) },
          obj.getMap("max").flatMap { decode(it) }
        )
        .fix()
        .map { it.a.between(it.a, it.b) }

      "Divide" -> getBinaryOperands(obj).map { it.a.divide(it.b) }

      "EqualTo" -> getBinaryOperands(obj).map { it.a.equalTo(it.b) }

      "GreaterThan" -> getBinaryOperands(obj).map { it.a.greaterThan(it.b) }

      "GreaterThanOrEqualTo" -> getBinaryOperands(obj).map { it.a.greaterThanOrEqualTo(it.b) }

      "IsNot" -> getBinaryOperands(obj).map { it.a.isNot(it.b) }

      "IsNullOrMissing" ->obj.getExpression("expression").map { it.isNullOrMissing() }

      "LessThan" -> getBinaryOperands(obj).map { it.a.lessThan(it.b) }

      "LessThanOrEqualTo" -> getBinaryOperands(obj).map { it.a.lessThanOrEqualTo(it.b) }

      "Like" -> getBinaryOperands(obj).map { it.a.like(it.b) }

      "Modulo" -> getBinaryOperands(obj).map { it.a.modulo(it.b) }

      "Multiply" -> getBinaryOperands(obj).map { it.a.multiply(it.b) }

      "NotEqualTo" -> getBinaryOperands(obj).map { it.a.notEqualTo(it.b) }

      "NotNullOrMissing" -> obj.getExpression("expression").map { it.notNullOrMissing() }

      "Or" -> getBinaryOperands(obj).map { it.a.or(it.b) }

      "Subtract" -> getBinaryOperands(obj).map { it.a.subtract(it.b) }

      else -> propertyExpression(obj)
        .handleErrorWith { metaExpression(obj) }
    } }

  private fun getBinaryOperands(obj: SafeReadableMap) = Either.applicative<String>()
    .tupled(
      obj.getMap("a").flatMap { decode(it) },
      obj.getMap("b").flatMap { decode(it) }
    )
    .fix()

  private fun metaExpression(obj: SafeReadableMap): Either<String, MetaExpression> =
    obj.tag.flatMap { tag ->
      when (tag) {
        "Meta.deleted" -> Either.right(Meta.deleted)
        "Meta.expiration" -> Either.right(Meta.expiration)
        "Meta.id" -> Either.right(Meta.id)
        "Meta.sequence" -> Either.right(Meta.sequence)
        else -> Either.left("$tag is not a valid MetaExpression")
      }
    }
}
