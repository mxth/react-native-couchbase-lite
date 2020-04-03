import Bow
import CouchbaseLiteSwift

class RNQuery {
  static func run(_ obj: SafeDictionary, _ eventEmitter: RCTEventEmitter) -> Either<String, [AnyHashable: Any]> {
    obj.tag.flatMap({
      switch $0 {
      case "Execute":
        return obj.getQuery("query").flatMap({ query in
          Try.invoke({ try query.execute() })
            .toEither()
            .mapLeft({ "query execute error: \($0.localizedDescription)" })
            .map({ writeResultSet($0) })
        })
        
      case "Explain":
        return obj.getQuery("query").flatMap({ query in
          Try.invoke({ try query.explain() })
            .toEither()
            .mapLeft({ "query explain error: \($0.localizedDescription)" })
            .map({ ["explain": $0] })
        })
        
      case "AddChangeListener":
        
      default:
        return Either.left("\($0) is not a RNQuery task")
      }
    })^
  }
  
  static func decode(_ obj: SafeDictionary) -> Either<String, Query> {
    return Either.left("invalid query")
  }
  
  static func writeResultSet(_ result: ResultSet) -> [AnyHashable: Any] {
    return ["result": result.allResults().map({ $0.toDictionary() })]
  }
}
