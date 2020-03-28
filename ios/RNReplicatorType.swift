import Bow
import CouchbaseLiteSwift

class RNReplicatorType {
  static func decode(_ str: String) -> Either<String, ReplicatorType> {
    switch str {
    case "Pull":
      return Either.right(ReplicatorType.pull)
    case "Push":
      return Either.right(ReplicatorType.push)
    case "PushAndPull":
      return Either.right(ReplicatorType.pushAndPull)
    default:
      return Either.left("\(str) is not a valid ReplicatorType")
    }
  }
}
