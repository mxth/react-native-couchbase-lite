package com.couchbase.lite

import arrow.core.*
import arrow.core.extensions.either.applicative.applicative
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.reactnativecouchbaselite.EventEmitter
import org.json.JSONException
import org.json.JSONObject

object RNQuery {
  private val listenerTokens: HashMap<String, ListenerToken> = hashMapOf()
  private val listenedQueries: HashMap<String, Query> = hashMapOf()

  fun run(obj: SafeReadableMap, eventEmitter: EventEmitter): Either<String, WritableMap> =
    obj.tag.flatMap { tag -> when (tag) {
      "Execute" -> obj.getQuery("query")
        .map {
          writeResultSet(it.execute())
        }

      "Explain" -> obj.getQuery("query")
        .map { query ->
          val data = Arguments.createMap()
          data.putString("explain", query.explain())
          data
        }

      "AddChangeListener" -> Either.applicative<String>().tupled(
        obj.getQuery("query"),
        obj.getString("listenerId")
      ).fix().map { tuple ->
        val query = tuple.a
        val listenerId = tuple.b
        listenedQueries[listenerId] = query
        listenerTokens[listenerId] = query.addChangeListener { change ->
          val result = writeResultSet(change.results)
          result.putString("listenerId", listenerId)
          eventEmitter.sendEvent("Query.Change", result)
        }
        query.execute()
        Arguments.createMap()
      }

      "RemoveChangeListener" -> obj.getString("listenerId")
        .flatMap { listenerId ->
          Either.applicative<String>().tupled(
            listenedQueries[listenerId].rightIfNotNull { "query not found with listenerId $listenerId" },
            listenerTokens[listenerId].rightIfNotNull { "listener token not found with listenerId $listenerId" }
          ).fix()
        }.map { tuple ->
          val query = tuple.a
          val token = tuple.b
          query.removeChangeListener(token)

          Arguments.createMap()
        }

      else -> Either.left("$tag is not RNQuery task")
    } }

  fun decode(obj: SafeReadableMap): Either<String, Query> =
    RNSelect.decode(obj)
      .handleErrorWith { RNFrom.decode(obj) }
      .handleErrorWith { RNJoins.decode(obj) }
      .handleErrorWith { RNWhere.decode(obj) }
      .handleErrorWith { RNGroupBy.decode(obj) }
      .handleErrorWith { RNHaving.decode(obj) }
      .handleErrorWith { RNOrderBy.decode(obj) }
      .handleErrorWith { RNLimit.decode(obj) }
      .handleErrorWith { RNLimit.decodeOffset(obj) }
      .mapLeft { "invalid Query $it ${obj.map}" }

  private fun writeResultSet(resultSet: ResultSet): WritableMap {
    val builder = GsonBuilder()
    val defaultBuilder: Gson = builder.create()

    val array: WritableArray = WritableNativeArray()

    for (result in resultSet.allResults()) {
      var resultMap: WritableMap
      try {
        resultMap = ReactNativeJson.convertJsonToMap(JSONObject(defaultBuilder.toJson(result.toMap())))
        array.pushMap(resultMap)
      } catch (e: JSONException) {
        e.printStackTrace()
      }
    }

    val map = Arguments.createMap()
    map.putArray("result", array)
    return map
  }
}
