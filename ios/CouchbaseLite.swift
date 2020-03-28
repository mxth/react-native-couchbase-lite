@objc(CouchbaseLite)
class CouchbaseLite: NSObject {
  @objc
  func run(
    _ obj: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let dict = SafeDictionary(dict: RCTConvert.nsDictionary(obj))

    RNTask.run(dict)
      .fold({ reject("", $0, nil) }, { resolve($0) })
  }
}
