package com.reactnativecouchbaselite

import arrow.core.*
import arrow.core.extensions.either.applicative.applicative
import com.couchbase.lite.*
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap

object RNReplicator {
  private val replicators: HashMap<String, Replicator> = hashMapOf()
  private val listenerTokens: HashMap<String, ListenerToken> = hashMapOf()

  private fun getOne(database: String) = replicators[database]
    .rightIfNotNull { "replicator for $database not found" }

  private fun writeStatus(status: AbstractReplicator.Status): WritableMap {
    val result = Arguments.createMap()
    result.putString("activityLevel", status.activityLevel.name)
    result.putInt("completed", status.progress.completed.toInt())
    result.putInt("total", status.progress.total.toInt())
    status.error.toOption().fold(
      { result.putNull("error") },
      { result.putString("error", it.toString())}
    )
    return result
  }

  fun run(payload: SafeReadableMap, eventEmitter: EventEmitter): Either<String, WritableMap> = payload
    .getString("tag")
    .flatMap { tag ->
      fun getReplicator() = payload.getString("database")
        .flatMap { getOne(it) }
      when(tag) {
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

        "start" -> getReplicator()
          .map { it.start() }
          .map { Arguments.createMap() }

        "stop" -> getReplicator()
          .map { it.stop() }
          .map { Arguments.createMap() }

        "status" -> getReplicator()
          .map { writeStatus(it.status) }

        "addChangeListener" -> Either.applicative<String>().tupled(
          getReplicator(),
          payload.getString("eventId")
        ).fix()
          .map { tuple ->
            val replicator = tuple.a
            val eventId = tuple.b
            listenerTokens[eventId] = replicator.addChangeListener { change ->
              eventEmitter.sendEvent(eventId, writeStatus(change.status))
            }
            Arguments.createMap()
          }

        "removeChangeListener" -> Either.applicative<String>().tupled(
          getReplicator(),
          payload.getString("eventId").flatMap { eventId ->
            listenerTokens[eventId].rightIfNotNull {
              "listenerToken for eventId $eventId not found"
            }
          }
        ).fix()
          .map { tuple ->
            val replicator = tuple.a
            val token = tuple.b
            replicator.removeChangeListener(token)
            Arguments.createMap()
          }

        else -> Either.left("unknown replicator tag $tag")
      }
    }
}