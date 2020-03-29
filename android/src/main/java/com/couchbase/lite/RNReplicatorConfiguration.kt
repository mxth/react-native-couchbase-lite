package com.couchbase.lite

import arrow.core.*
import arrow.core.extensions.either.applicative.applicative
import com.reactnativecouchbaselite.RNDatabase
import java.net.URI

object RNReplicatorConfiguration {
  fun decode(obj: SafeReadableMap): Either<String, ReplicatorConfiguration> =
    Either.applicative<String>().tupled(
      obj.getString("database"),
      obj.getString("target"),
      obj.getString("replicatorType").flatMap { TReplicatorType.decode(it) },
      obj.getMap("authenticator").fold(
        { Either.right(null) },
        { RNAuthenticator.decode(it) }
      ),
      obj.getArray("channels").fold(
        { Either.right(null) },
        { it.toListString() }
      )
    ).fix().map { tuple ->
      val database = RNDatabase.get(tuple.a)
      val endpoint = URLEndpoint(URI(tuple.b))
      val replicatorType = tuple.c
      val authenticator = tuple.d
      val channels = tuple.e

      val config = ReplicatorConfiguration(database, endpoint)

      config.replicatorType = replicatorType
      config.isContinuous = obj.getBoolean("continuous")

      if (channels != null) {
        config.channels = channels
      }

      if (authenticator != null) {
        config.authenticator = authenticator
      }
      config
    }
  }

