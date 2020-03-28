import { Languages } from "./languages";

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
