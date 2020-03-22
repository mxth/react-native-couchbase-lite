package com.couchbase.lite

import arrow.core.*
import arrow.core.extensions.either.applicative.applicative
import com.facebook.react.bridge.ReadableMap
import com.reactnativecouchbaselite.RNDatabase
import java.net.URI

object RNReplicatorConfiguration {
  fun decode(obj: SafeReadableMap): Either<String, ReplicatorConfiguration> = {
    return Either.applicative<String>().tupled(
      obj.getString("database"),
      obj.getString("target"),
      obj.getString("replicatorType").flatMap { TReplicatorType.decode(it) },
      obj.getMap("authenticator")
        .flatMap { o -> o.fold(
          { Either.right(null) },
          { RNAuthenticator.decode(it) }
        ) }
    ).fix().map { tuple ->
      val database = RNDatabase.get(tuple.a)
      val endpoint = URLEndpoint(URI(tuple.b))
      val config = ReplicatorConfiguration(database, endpoint)

      config.replicatorType = tuple.c
      config.isContinuous = obj.getBoolean("continuous")

      if (tuple.d != null) {
        config.authenticator = tuple.d
      }
      config
    }
  }
}
