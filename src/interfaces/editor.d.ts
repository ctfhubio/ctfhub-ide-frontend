export interface EditorState {}

export type EditorMode = 'c_cpp' | 'python' | 'javascript' | 'php' | 'golang' | 'java' | 'text';
export type EditorTheme = 'github';

export interface EditorProps {
  mode: EditorMode
  theme: EditorTheme
  fontSize: number
  tabSize: number
  autocomplete: boolean
  code: string
  handleCodeChange(code: string): void
}
