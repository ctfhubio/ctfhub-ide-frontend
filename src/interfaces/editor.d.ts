import { Languages } from './languages';
import { IdeResponse } from './ide';

export interface EditorState {
  availableLanguages: Languages
  selectedLanguage: string
  tabSize: number
  fontSize: number
  theme: string
  ideMode: string
  autocomplete: boolean
  code: string
  running: boolean
}

export type SubmissionErrors = 'SUBMISSION_FAILURE' | 'SUBMISSION_API_CALL_FAILURE' | 'INVALID_API_RESPONSE' |
  'POLLING_LIMIT_REACHED' | 'POLLING_API_CALL_FAILURE' | string;

export interface EditorProps {
  stdin?: string
  codeExecutionSuccessHandler(result: IdeResponse): void
  codeExecutionErrorHandler(error: SubmissionErrors): void
}
