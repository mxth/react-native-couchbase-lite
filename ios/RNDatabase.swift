import Bow
import CouchbaseLiteSwift

class RNDatabase {
  static var databaseCache: [String: Database] = [:]
  
  static func get(_ name: String) -> Database {
    databaseCache[name].toOption().getOrElse({
      let db = try! Database(name: name)
      databaseCache[name] = db
      return db
    })
  }
}
	
