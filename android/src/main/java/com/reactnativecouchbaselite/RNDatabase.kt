package com.reactnativecouchbaselite

import com.couchbase.lite.Database

object RNDatabase {
  private val databaseCache: MutableMap<String, Database> = hashMapOf()

  fun get(name: String) =
    databaseCache.getOrElse(name, {
      val db = Database(name)
      databaseCache[name] = Database(name)
      db
    })
}
