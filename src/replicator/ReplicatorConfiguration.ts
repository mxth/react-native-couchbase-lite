import { Authenticator } from './Authenticator'
import { ReplicatorType } from './ReplicatorType'

export interface ReplicatorConfiguration {
  database: string
  target: string
  replicatorType: ReplicatorType
  continuous: boolean
  authenticator?: Authenticator
  channels?: string[]
  headers?: Record<string, string>
}
