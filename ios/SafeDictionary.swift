import Bow

class SafeDictionary {
  static func empty() -> [AnyHashable: Any] {
    return [:]
  }

  let dict: [AnyHashable: Any]

  init(dict: [AnyHashable: Any]) {
    self.dict = dict
  }
  func getString(_ name: String) -> Either<String, String> {
    return RCTConvert.nsString(dict[name])
      .rightIfNotNull("\(name) is null")
  }
  
  func getDict(_ name: String) -> Either<String, SafeDictionary> {
    print(name)
    return dict[name]
      .rightIfNotNull("\(name) is null")
      .filterOrElse({ !($0 is NSNull) }, "\(name) is null")
      .flatMap({
        RCTConvert.nsDictionary($0).rightIfNotNull("\(name) is not nsDictionary")
      })
      .map({ SafeDictionary(dict: $0) })^
  }
  
  func getBool(_ name: String) -> Bool {
    return RCTConvert.bool(dict[name])
  }
  
  func getArray(_ name: String) -> Either<String, [Any]> {
    return RCTConvert.nsArray(dict[name])
      .rightIfNotNull("\(name) is null")
  }
  
  func getArrayString(_ name: String) -> Either<String, [String]> {
    return RCTConvert.nsStringArray(dict[name])
      .rightIfNotNull("\(name) is null")
  }

}
