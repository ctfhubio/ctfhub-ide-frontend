import { EditorMode, EditorTheme } from './editor';
import { Languages, LanguageKeys } from './languages';

export interface AppState {
  editorAutocomplete: boolean
  editorFontSize: number
  editorTabSize: number
  editorMode: EditorMode
  editorTheme: EditorTheme
  availableLanguages: Languages
  selectedLanguage: LanguageKeys
  code: string
  stdin: string
  running: boolean
}

export interface AppProps {}
