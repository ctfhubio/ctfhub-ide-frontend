import { LanguageKeys, Languages } from './languages';
import { ChangeEvent } from 'react';

export interface HeaderProps {
  availableLanguages: Languages
  selectedLanguage: LanguageKeys
  isCodeRunning: boolean
  onLanguageChange(event: ChangeEvent<HTMLSelectElement>): void
  onThemeChange(): void
  onFontSizeChange(): void
  onTabSizeChange(): void
  onAutocompletionModeChange(): void
  onCodeSubmission(event: MouseEvent<HTMLButtonElement>): void
}

export interface HeaderState {}
