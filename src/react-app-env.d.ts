/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_IDE_NEW_REQUEST_API: string
  }

  // interface ReactEnv extends ProcessEnv {
  //   NODE_ENV: 'development' | 'production' | 'test'
  //   PUBLIC_URL: string
  // }
  //
  // interface Process {
  //   env: ReactEnv;
  // }
}
