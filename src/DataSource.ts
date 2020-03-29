import { Database } from './Database'

export type DataSource = DataSource.Init | DataSource.As

export namespace DataSource {
  export interface Init {
    tag: 'Init'
    database: Database
  }
  export function database(database: Database): Init {
    return {
      tag: 'Init',
      database
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
