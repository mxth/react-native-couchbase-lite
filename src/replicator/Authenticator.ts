export type Authenticator =
  | {
      tag: 'BasicAuthenticator'
      username: string
      password: string
    }
  | {
      tag: 'SessionAuthenticator'
      session: string
    }
