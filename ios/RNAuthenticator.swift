import Bow
import CouchbaseLiteSwift

class RNAuthenticator {
  static func decode(_ obj: SafeDictionary) -> Either<String, Authenticator> {
    return obj.getString("tag")
      .flatMap({ tag in
        switch tag {
        case "BasicAuthenticator":
          return Either<String, Authenticator>.map(
            obj.getString("username"),
            obj.getString("password"),
            { BasicAuthenticator(username: $0, password: $1) }
          )^
        case "SessionAuthenticator":
          return obj.getString("session")
            .map({ SessionAuthenticator(sessionID: $0) })^
        default:
          return Either.left("\(tag) is not a Authenticator tag")
        }
      })^
  }
}
