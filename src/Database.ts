export interface Database {
  name: string
}

export namespace Database {
  export function init(name: string): Database {
    return {
      name
    }
  }
}
