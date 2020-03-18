import { NativeModules } from 'react-native';

type CouchbaseLiteType = {
  getDeviceName(): Promise<string>;
};

const { CouchbaseLite } = NativeModules;

export default CouchbaseLite as CouchbaseLiteType;
