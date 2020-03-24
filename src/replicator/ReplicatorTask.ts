import { ReplicatorConfiguration } from './ReplicatorConfiguration'

interface ReplicatorTask {
  group: 'Replicator'
  payload: ReplicatorTask.Payload
}

export namespace ReplicatorTask {
  function init(payload: Payload): ReplicatorTask {
    return {
      group: 'Replicator',
      payload,
    }
  }

  export type Payload = Debug | Init | Start | Stop | Status | AddChangeListener

  export interface Debug {
    tag: 'debug'
  }
  export function Debug(): ReplicatorTask {
    return init({ tag: 'debug' })
  }

  export interface Init {
    tag: 'init'
    config: ReplicatorConfiguration
  }
  export function Init(config: ReplicatorConfiguration): ReplicatorTask {
    return init({ tag: 'init', config })
  }

  export interface Start {
    tag: 'start'
    database: string
  }
  export function Start(database: string): ReplicatorTask {
    return init({ tag: 'start', database })
  }

  export interface Stop {
    tag: 'stop'
    database: string
  }
  export function Stop(database: string): ReplicatorTask {
    return init({ tag: 'stop', database })
  }

  export interface Status {
    tag: 'status'
    database: string
  }
  export function Status(database: string): ReplicatorTask {
    return init({ tag: 'status', database })
  }

  export interface AddChangeListener {
    tag: 'addChangeListener'
    database: string
  }
  export function AddChangeListener(database: string): ReplicatorTask {
    return init({ tag: 'addChangeListener', database })
  }
}
