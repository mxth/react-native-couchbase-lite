@objc(CouchbaseLite)
class CouchbaseLite: RCTEventEmitter {
  @objc
  func run(
    _ obj: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let dict = SafeDictionary(dict: RCTConvert.nsDictionary(obj))

    RNTask.run(dict, self)
      .fold({ reject("", $0, nil) }, { resolve($0) })
  }
  
  override func supportedEvents() -> [String] {
    return [RNReplicator.StatusEventName]
  }
}
