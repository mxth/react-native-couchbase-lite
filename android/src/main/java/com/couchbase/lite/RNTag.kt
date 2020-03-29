package com.couchbase.lite

object RNTag {
  fun get(obj: SafeReadableMap) = obj.getString("tag")
}
