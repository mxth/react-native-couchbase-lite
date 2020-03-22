package com.reactnativecouchbaselite

import arrow.core.Either
import arrow.core.rightIfNotNull
import arrow.core.rightIfNull
import com.couchbase.lite.Replicator
import com.couchbase.lite.ReplicatorConfiguration

object RNReplicator {
  private val replicators: HashMap<String, Replicator> = hashMapOf()

  private fun getOne(database: String) = replicators[database]
    .rightIfNotNull { "replicator for $database not found" }

  fun init(config: ReplicatorConfiguration): Either<String, Replicator> =
    replicators[config.database.name]
      .rightIfNull { "$config.database.name already init" }
      .map {
        val replicator = Replicator(config)
        replicators[config.database.name] = replicator
        replicator
      }

  fun start(database: String): Either<String, Unit> =
    getOne(database)
      .map { it.start() }

  fun stop(database: String): Either<String, Unit> =
    getOne(database)
      .map { it.stop() }
}
