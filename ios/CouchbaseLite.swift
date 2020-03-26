
import Foundation

@objc(CouchbaseLite)
class CouchbaseLite: NSObject {
  @objc
  func run(
    _ obj: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    resolve(nil)
  }
}
