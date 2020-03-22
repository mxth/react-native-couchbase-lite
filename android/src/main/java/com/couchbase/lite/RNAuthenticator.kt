package com.couchbase.lite

import arrow.core.Either
import arrow.core.extensions.either.applicative.applicative
import arrow.core.fix
import arrow.core.flatMap
import com.facebook.react.bridge.ReadableMap

object RNAuthenticator {
  fun decode(obj: SafeReadableMap): Either<String, Authenticator> =
    obj.getString("tag")
      .flatMap { tag -> when (tag) {
        "BasicAuthenticator" -> Either.applicative<String>().tupled(
          obj.getString("username"),
          obj.getString("password")
        ).fix().map { BasicAuthenticator(it.a, it.b) }
        "SessionAuthenticator" -> obj.getString("session")
          .map { SessionAuthenticator(it) }
        else -> Either.left("$tag is not Authenticator tag")
      } }
}
