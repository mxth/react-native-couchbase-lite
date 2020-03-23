package com.reactnativecouchbaselite

import arrow.core.*
import com.couchbase.lite.*
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap

object RNReplicator {
  private val replicators: HashMap<String, Replicator> = hashMapOf()

  private fun getOne(database: String) = replicators[database]
    .rightIfNotNull { "replicator for $database not found" }

  fun run(payload: SafeReadableMap): Either<String, WritableMap> = payload
    .getString("tag")
    .flatMap { tag -> when(tag) {
      "debug" -> {
        Database.setLogLevel(LogDomain.REPLICATOR, LogLevel.VERBOSE)
        Either.right(Arguments.createMap())
      }
      "init" -> payload.getMap("config")
        .flatMap { RNReplicatorConfiguration.decode(it) }
        .flatMap { config ->
          replicators[config.database.name]
            .rightIfNull { "$config.database.name already init" }
            .map {
              val replicator = Replicator(config)
              replicators[config.database.name] = replicator
              Arguments.createMap()
            }
        }

      "start" -> payload.getString("database")
        .flatMap { getOne(it) }
        .map { it.start() }
        .map { Arguments.createMap() }

      "stop" -> payload.getString("database")
        .flatMap { getOne(it) }
        .map { it.stop() }
        .map { Arguments.createMap() }

      "status" -> payload.getString("database")
        .flatMap { getOne(it) }
        .map { replicator ->
          val result = Arguments.createMap()
          val status = replicator.status
          result.putString("activityLevel", status.activityLevel.name)
          result.putInt("completed", status.progress.completed.toInt())
          result.putInt("total", status.progress.total.toInt())
          status.error.toOption().fold(
            { result.putNull("error") },
            { result.putString("error", it.toString())}
          )
          result
        }

      else -> Either.left("unknown replicator tag $tag")
    } }
}
