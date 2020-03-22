package com.couchbase.lite

import arrow.core.Either

object TReplicatorType {
  internal fun decode(str: String) = when (str) {
    "Pull" -> Either.right(AbstractReplicatorConfiguration.ReplicatorType.PULL)
    "Push" -> Either.right(AbstractReplicatorConfiguration.ReplicatorType.PUSH)
    "PushAndPull" -> Either.right(AbstractReplicatorConfiguration.ReplicatorType.PUSH_AND_PULL)
    else -> Either.left("$str is not a valid ReplicatorType")
  }
}
