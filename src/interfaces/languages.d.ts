export type LanguageKeys = 'c' | 'cpp' | 'python2' | 'python3' | 'golang' | 'php' | 'java' | 'nodejs' | string

export interface Language {
  key: string
  name: string
  code?: string // Default code
}

export interface Languages {
  [key: string]: Language
}
