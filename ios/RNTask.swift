import Bow

class RNTask {
  static func run(_ obj: SafeDictionary) -> Either<String, [AnyHashable: Any]> {
    return obj.getString("group")
    .flatMap({ group in
      func getPayload() -> Either<String, SafeDictionary> {
        return obj.getDict("payload")
      }
      switch group {
      case "Replicator":
        return getPayload().flatMap({ RNReplicator.run($0) })
      default:
        return Either.left("unknown task group \(group)")
      }
    })^
  }
}
