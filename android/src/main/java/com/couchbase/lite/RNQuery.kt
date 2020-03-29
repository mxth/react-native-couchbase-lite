package com.couchbase.lite

import arrow.core.Either
import arrow.core.extensions.either.applicative.applicative
import arrow.core.extensions.list.traverse.sequence
import arrow.core.fix
import arrow.core.flatMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.reactnativecouchbaselite.EventEmitter
import com.reactnativecouchbaselite.RNDataSource
import com.reactnativecouchbaselite.RNExpression
import com.reactnativecouchbaselite.RNSelectResult
import org.json.JSONException
import org.json.JSONObject

object RNQuery {
  private val listenerTokens: HashMap<String, ListenerToken> = hashMapOf()

  fun run(obj: SafeReadableMap, eventEmitter: EventEmitter): Either<String, WritableMap> = RNTag.get(obj)
    .flatMap { tag -> when (tag) {
      "Execute" -> obj.getMap("query")
        .flatMap { RNQuery.decode(it) }
        .map {
          writeResultSet(it.execute())
        }

      "Explain" -> obj.getMap("query")
        .flatMap { RNQuery.decode(it) }
        .map { query ->
          val data = Arguments.createMap()
          data.putString("explain", query.explain())
          data
        }

      "AddChangeListener" -> Either.applicative<String>().tupled(
        obj.getMap("query").flatMap { RNQuery.decode(it) },
        obj.getString("queryId")
      ).fix().map { tuple ->
        val query = tuple.a
        val queryId = tuple.b
        listenerTokens[queryId] = query.addChangeListener { change ->
          eventEmitter.sendEvent("Query.Change", writeResultSet(change.results))
        }
        Arguments.createMap()
      }

      else -> Either.left("$tag is not RNQuery task")
    } }

  private fun decode(obj: SafeReadableMap): Either<String, Query> = RNTag.get(obj)
    .flatMap { tag -> when (tag) {
      "Select" -> select(obj)

      "From" -> from(obj)

      "Where" -> where(obj)

      else -> Either.left("$tag is not RNQuery")
    } }

  private fun select(obj: SafeReadableMap): Either<String, Select> =
    obj.getListMap("results")
      .flatMap { it
        .map { RNSelectResult.decode(it) }
        .sequence(Either.applicative())
        .fix()
        .map { results ->
          QueryBuilder.select(*results.fix().toTypedArray())
        }
      }

  private fun from(obj: SafeReadableMap): Either<String, From> =
    Either.applicative<String>().tupled(
      obj.getMap("query").flatMap { select(it) },
      obj.getMap("dataSource").flatMap { RNDataSource.decode(it) }
    ).fix()
      .map { it.a.from(it.b) }

  private fun where(obj: SafeReadableMap): Either<String, Where> =
    Either.applicative<String>().tupled(
      obj.getMap("query").flatMap { from(it) },
      obj.getMap("expression").flatMap { RNExpression.decode(it) }
    ).fix()
      .map { it.a.where(it.b) }

  private fun writeResultSet(a: ResultSet): WritableMap {
    val builder = GsonBuilder()
    val defaultBuilder: Gson = builder.create()

    val array: WritableArray = WritableNativeArray()

    for (result in a.allResults()) {
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
