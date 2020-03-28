import Bow
import CouchbaseLiteSwift

import Foundation

class RNReplicator {
  static var replicators: [String: Replicator] = [:]
  static var listenerTokens: [String: ListenerToken] = [:]
  
  static func getOne(_ database: String) -> Either<String, Replicator> {
    return replicators[database].rightIfNotNull("replicator for \(database) not found")
  }
  
  static func writeActivityLevel(_ activity: Replicator.ActivityLevel) -> String {
    switch activity {
    case .stopped:
      return "STOPPED"
    case .offline:
      return "OFFLINE"
    case .connecting:
      return "CONNECTING"
    case .idle:
      return "IDLE"
    case .busy:
      return "BUSY"
    }
  }
  
  static func writeStatus(_ status: Replicator.Status) -> [AnyHashable: Any] {
    var result = SafeDictionary.empty()
    
    result["activityLevel"] = writeActivityLevel(status.activity)
    result["completed"] = status.progress.completed
    result["total"] = status.progress.total
    
    (status.error as NSError?).toOption().fold(
      { result["error"] = nil },
      { error in
        var errorMap = SafeDictionary.empty()
        errorMap["code"] = error.code
        errorMap["domain"] = error.domain
        errorMap["message"] = error.localizedDescription
        result["error"] = errorMap
      }
    )
    return result
  }
  
  static func writeStatusEvent(_ eventId: String, _ status: Replicator.Status) -> [AnyHashable: Any] {
    var result = SafeDictionary.empty()
    result["id"] = eventId
    result["status"] = writeStatus(status)
    return result
  }
  
  static func run(_ payload: SafeDictionary) -> Either<String, [AnyHashable: Any]> {
    return payload.getString("tag")
      .flatMap({ (tag) -> Either<String, [AnyHashable: Any]> in
        func getReplicator() -> Either<String, Replicator> {
          return payload.getString("database")
            .flatMap(getOne)^
        }
        
        switch tag {
        case "debug":
          Database.setLogLevel(.verbose, domain: .replicator)
          return Either.right(SafeDictionary.empty())
          
        case "init":
          return payload.getDict("config")
            .flatMap(RNReplicatorConfiguration.decode)
            .flatMap({ (config: ReplicatorConfiguration) -> Either<String, [AnyHashable: Any]> in
              let database = config.database.name
              return replicators[database]
                .rightIfNotNull("")
                .swap()
                .mapLeft({ _ in "\(config.database.name) already init" })
                .map({ (_) -> [AnyHashable: Any] in
                  let replicator = Replicator(config: config)
                  replicators[database] = replicator
                  return SafeDictionary.empty()
                })^
            })^
          
        case "start":
          return getReplicator()
            .map({ $0.start() })
            .map({ SafeDictionary.empty() })^
          
        case "stop":
          return getReplicator()
            .map({ $0.stop() })
            .map({ SafeDictionary.empty() })^

        case "status":
          return getReplicator()
            .map({ $0.status })
            .map(writeStatus)^
          
        case "addChangeListener":
          return Either<String, [AnyHashable: Any]>.map(
            getReplicator(),
            payload.getString("eventId"),
            { (replicator, eventId) in
              listenerTokens[eventId] = replicator.addChangeListener { change in
                EventEmitter.sharedInstance.dispatch(name: "Replicator.Status", body: writeStatusEvent(eventId, change.status))
              }
              return SafeDictionary.empty()
            }
          )^
          
        case "removeChangeListener":
          return Either<String, [AnyHashable: Any]>.map(
            getReplicator(),
            payload.getString("eventId"),
            { (replicator, eventId) in
              listenerTokens[eventId].rightIfNotNull("listenerToken for eventId \(eventId) not found")
                .map({ token in
                  replicator.removeChangeListener(withToken: token)
                  listenerTokens.removeValue(forKey: eventId)
                  return SafeDictionary.empty()
                })
            }
            ).flatMap({ $0 })^
        default:
          return Either.left("unknown replicator tag \(tag)")
        }
      })^
  }
}
