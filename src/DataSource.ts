import { Database } from './Database'

export type DataSource = DataSource.Init | DataSource.As

export namespace DataSource {
  export interface Init {
    tag: 'Init'
    database: Database
  }
  export function database(name: string): Init {
    return {
      tag: 'Init',
      database: Database.init(name)
    }
  }

  export interface As {
    tag: 'As'
    dataSource: Init
    alias: string
  }
  export function as(alias: string): (dataSource: Init) => As {
    return dataSource => ({
      tag: 'As',
      dataSource,
      alias
    })
  }
}
