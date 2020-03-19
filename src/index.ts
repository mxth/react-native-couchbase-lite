import { NativeModules } from 'react-native'
import { Task } from 'fp-ts/lib/Task'

enum RNTag {
  Database = 'Database',
}

export class RNObject {
  constructor(public tag: RNTag) {}
}

export class Database extends RNObject {
  constructor(public name: string) {
    super(RNTag.Database)
  }
}

export namespace CouchbaseLite {
  export interface Service {}
}

type CouchbaseLiteNative = {
  getDeviceName(): Promise<string>
  eval(obj: RNObject): Promise<unknown>
}

export interface CouchbaseLite {}

export namespace CouchbaseLite {
  const native: CouchbaseLiteNative = NativeModules.CouchbaseLite

  export function _eval<A extends RNObject>(obj: A): Task<unknown> {
    return () => native.eval(obj)
  }
}
