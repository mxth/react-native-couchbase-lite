#import <React/RCTBridgeModule.h>
#import <React/RCTConvert.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(CouchbaseLite, RCTEventEmitter)

RCT_EXTERN_METHOD(
                  run: (NSDictionary *)obj
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject
                  )

RCT_EXTERN_METHOD(supportedEvents)

@end
