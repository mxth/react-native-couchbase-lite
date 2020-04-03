package com.reactnativecouchbaselite

import arrow.core.Either
import arrow.core.extensions.either.applicative.applicative
import arrow.core.fix
import arrow.core.flatMap
import com.couchbase.lite.DataSource
import com.couchbase.lite.Database
import com.couchbase.lite.SafeReadableMap

object RNDataSource {
  private val databaseCache: MutableMap<String, Database> = hashMapOf()

  fun get(name: String): Database =
    databaseCache.getOrElse(name, {
      val db = Database(name)
      databaseCache[name] = db
      db
    })

  fun decode(obj: SafeReadableMap) =
    obj.tag.flatMap { tag -> when (tag) {
      "Init" -> init(obj)

      "As" -> Either.applicative<String>().tupled(
        obj.getMap("dataSource").flatMap { init(it) },
        obj.getString("alias")
      ).fix().map { it.a.`as`(it.b) }

      else -> Either.left("$tag is not RNDataSource")
    } }

  private fun init(obj: SafeReadableMap): Either<String, DataSource.As> = obj.getMap("database")
    .flatMap { RNDatabase.decode(it) }
    .map { DataSource.database(it) }
}
