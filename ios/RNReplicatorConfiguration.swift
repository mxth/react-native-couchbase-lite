import Bow
import CouchbaseLiteSwift

class RNReplicatorConfiguration {
  static func decode(_ obj: SafeDictionary) -> Either<String, ReplicatorConfiguration> {
    return Either<String, ReplicatorConfiguration>.map(
      obj.getString("database").map(RNDatabase.get),
      obj.getString("target")
        .flatMap({ URL(string: $0).rightIfNotNull("target URL invalid") })
        .map({ URLEndpoint(url: $0) }),
      obj.getString("replicatorType")
        .flatMap(RNReplicatorType.decode)^,
      obj.getDict("authenticator").fold(
        { _ in Either.right(Option.none()) },
        { RNAuthenticator.decode($0).map(Option.some) }
      ),
      { (database, target, replicatorType, authenticator) in
        let config = ReplicatorConfiguration(database: database, target: target)
        
        config.replicatorType = replicatorType
        config.continuous = obj.getBool("continuous")
        
        obj.getArrayString("channels").map({
          config.channels = $0
        })
        
        authenticator.map({
          config.authenticator = $0
        })
        return config
      }
    )^
  }
}
