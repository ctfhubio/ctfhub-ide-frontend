export interface Language {
  key: string
  name: string
  code?: string // Default code
}

export interface Languages {
  [key: string]: Language
}
