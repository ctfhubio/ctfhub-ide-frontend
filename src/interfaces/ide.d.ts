export type SubmissionErrors = 'SUBMISSION_FAILURE' | 'SUBMISSION_API_CALL_FAILURE' | 'INVALID_API_RESPONSE' |
  'POLLING_LIMIT_REACHED' | 'POLLING_API_CALL_FAILURE' | string;

interface IdeSubmissionResponseData {
  requestId: string
  callbackUrl: string
}

export interface IdeSubmissionResponse {
  status: string
  data: IdeSubmissionResponseData
}

export interface IdeResponse {
  id: string,
  stdout: string
  stderr: string
  compile_stderr: string
  time_log: string
  status: 'success' | 'pending' | 'compiling' | 'running' | 'compile-error' | 'runtime-error' | 'timeout' | 'failure' | string
}
