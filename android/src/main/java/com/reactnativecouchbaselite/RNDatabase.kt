package com.reactnativecouchbaselite

import arrow.core.Either
import arrow.core.rightIfNotNull
import com.facebook.react.bridge.ReadableMap
import com.couchbase.lite.Database

data class RNDatabase(val name: String) {
  companion object {
    private val databaseCache: MutableMap<String, Database> = hashMapOf()

    fun decode(obj: ReadableMap): Either<String, Database> = obj
      .getString("name")
      .rightIfNotNull { "database name not found" }
      .map { name ->
        databaseCache.getOrElse(name, {
          val db = Database(name)
          databaseCache[name] = Database(name)
          db
        })
      }
  }
}
