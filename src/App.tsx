import React from 'react';
import Header from './components/Header';
import Editor from './components/Editor';
import axios, { AxiosResponse } from 'axios';

import { AppState, AppProps } from './interfaces/app';
import { EditorMode } from './interfaces/editor';
import { IdeResponse, IdeSubmissionResponse } from './interfaces/ide';
import { SubmissionErrors } from './interfaces/ide';
import { LanguageKeys, Languages } from './interfaces/languages';

import './App.css';

class App extends React.Component<AppProps, AppState> implements React.ComponentLifecycle<AppProps, AppState> {

  selectedLangLocalstorageKey: string;

  constructor(props: Readonly<AppProps>) {
    super(props);

    this.selectedLangLocalstorageKey = 'selected_lang';
    this.state = {
      editorAutocomplete: true,
      editorFontSize: 15,
      availableLanguages: {},
      editorMode: 'text',
      editorTheme: 'github',
      editorTabSize: 2,
      code: '',
      stdin: '',
      selectedLanguage: 'text',
      running: false
    };

    this.codeExecutionSuccessHandler = this.codeExecutionSuccessHandler.bind(this);
    this.codeExecutionErrorHandler = this.codeExecutionErrorHandler.bind(this);
    this.handleLanguageChange = this.handleLanguageChange.bind(this);
    this.handleCodeChange = this.handleCodeChange.bind(this);
    this.handleThemeChange = this.handleThemeChange.bind(this);
    this.handleFontSizeChange = this.handleFontSizeChange.bind(this);
    this.handleTabSizeChange = this.handleTabSizeChange.bind(this);
    this.handleAutocompletionModeChange = this.handleAutocompletionModeChange.bind(this);
    this.handleCodeSubmission = this.handleCodeSubmission.bind(this);
  }

  componentDidMount(): void {
    this.fetchLanguages()
      .then(availableLanguages =>
        this.setState({ availableLanguages }, () => {
          const selectedLanguage = this._getIdeDefaultLanguage(this.state.availableLanguages);
          this.setState({ selectedLanguage }, this._updateIdeCodeAndMode);
        })
      );

    window.addEventListener('beforeunload', this._saveCodeInLocalStorage);
  }

  _checkCodeExecutionStatus = async (callbackUrl: string): Promise<AxiosResponse> => {
    return new Promise(((resolve, reject) => {
      setTimeout(() => {
        axios.get(callbackUrl)
          .then(resolve)
          .catch(reject)
      }, 1000);
    }))
  };

  _pollForCodeResponse = async (callbackUrl: string): Promise<IdeResponse> => {
    try {
      for (let pollingLimit = 0; pollingLimit < 20; ++pollingLimit) {
        const statusResponse = await this._checkCodeExecutionStatus(callbackUrl);
        const status = statusResponse.data['status'];

        if (!status) {
          return Promise.reject('INVALID_API_RESPONSE');
        }

        if (status !== 'pending') {
          return statusResponse.data;
        }
      }

      return Promise.reject('POLLING_LIMIT_REACHED');
    } catch (e) {
      return Promise.reject('POLLING_API_CALL_FAILURE')
    }
  };

  _getIdeDefaultLanguage = (availableLanguages: Languages) => {
    let languageKey = localStorage.getItem(this.selectedLangLocalstorageKey);
    const availableLanguageKeys = Object.keys(availableLanguages);

    if (languageKey && availableLanguageKeys.includes(languageKey)) {
      return languageKey;
    }

    return availableLanguageKeys[0] || 'text';
  };

  _getIdeMode = (): EditorMode => {
    switch (this.state.selectedLanguage) {
      case 'c':
      case 'cpp':
        return 'c_cpp';

      case 'python2':
      case 'python3':
        return 'python';

      case 'nodejs':
        return 'javascript';

      case 'php':
      case 'golang':
      case 'java':
        return this.state.selectedLanguage;

      default:
        return 'text';
    }
  };

  _getDefaultCode = (): string => {
    const key = this.state.selectedLanguage;
    let code: string = localStorage.getItem(this._getCodeLocalstorageKey()) || '';

    if (!code && (
      this.state.availableLanguages &&
      this.state.availableLanguages[key]
    )) {
      return this.state.availableLanguages[key].code || '';
    }

    return code;
  };

  _updateIdeCodeAndMode = () => {
    this.setState({
      code: this._getDefaultCode(),
      editorMode: this._getIdeMode()
    })
  };

  _getCodeLocalstorageKey = (): string => {
    return `${this.state.selectedLanguage}_code`;
  };

  _saveCodeInLocalStorage = () => {
    localStorage.setItem(this._getCodeLocalstorageKey(), this.state.code)
  };

  async fetchLanguages(): Promise<Languages> {
    return {
      'c': {
        name: 'C',
        key: 'c',
        code: '#include <stdio.h>\n\nint main() {\n\tprintf("Hello, world!\\n");\n\treturn 0;\n}\n'
      },
      'cpp': {
        name: 'C++',
        key: 'cpp',
        code: '#include <iostream>\n\nint main() {\n\tstd::cout << "Hello, world!\\n";\n\treturn 0;\n}\n'
      },
      'python2': { name: 'Python 2', key: 'python2', code: 'print "Hello, world!\\n"\n' },
      'python3': { name: 'Python 3', key: 'python3', code: 'print("Hello, world!\\n")\n' },
      'nodejs': { name: 'Node.js', key: 'nodejs', code: 'console.log("Hello, world!\\n")\n' },
    };
  }

  codeExecutionSuccessHandler(result: IdeResponse) {
  }

  codeExecutionErrorHandler(error: SubmissionErrors) {
  }

  handleLanguageChange(event: React.ChangeEvent<HTMLSelectElement>) {
    this._saveCodeInLocalStorage();

    const selectedLanguage = event.target.value as LanguageKeys;
    this.setState({ selectedLanguage }, this._updateIdeCodeAndMode);
    localStorage.setItem(this.selectedLangLocalstorageKey, selectedLanguage);
  }

  handleCodeChange(code: string) {
    this.setState({ code });
  }

  handleThemeChange() {
  }

  handleFontSizeChange() {
  }

  handleTabSizeChange() {
  }

  handleAutocompletionModeChange() {
  }

  handleCodeSubmission(event: React.MouseEvent<HTMLButtonElement>) {
    const { REACT_APP_IDE_NEW_REQUEST_API } = process.env;
    this.setState({ running: true });

    axios
      .post(REACT_APP_IDE_NEW_REQUEST_API, {
        lang: this.state.selectedLanguage,
        source: this.state.code,
        stdin: this.state.stdin || ''
      })
      .catch(() => Promise.reject('SUBMISSION_API_CALL_FAILURE'))
      .then(async response => {
        const body = (response.data || {}) as IdeSubmissionResponse;
        const callbackUrl = body.data.callbackUrl;

        if (! (response.status === 202 && body.status === 'success' && body.data && callbackUrl)) {
          return Promise.reject('SUBMISSION_FAILURE');
        }

        return callbackUrl;
      })
      .then(this._pollForCodeResponse)
      .then(this.codeExecutionSuccessHandler)
      .catch(this.codeExecutionErrorHandler)
      .finally(() => this.setState({ running: false }));
  }

  render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    return (
      <>
        <header>
          <Header
            availableLanguages={ this.state.availableLanguages }
            selectedLanguage={ this.state.selectedLanguage }
            isCodeRunning={ this.state.running }
            onLanguageChange={ this.handleLanguageChange }
            onThemeChange={ this.handleThemeChange }
            onFontSizeChange={ this.handleFontSizeChange }
            onTabSizeChange={ this.handleTabSizeChange }
            onAutocompletionModeChange={ this.handleAutocompletionModeChange }
            onCodeSubmission={ this.handleCodeSubmission }
          />
        </header>
        <main>
          <div className="row">
            <div className="col s12 l8" style={{ padding: "0" }}>
              <Editor
                mode={ this.state.editorMode }
                theme={ this.state.editorTheme }
                fontSize={ this.state.editorFontSize }
                tabSize={ this.state.editorTabSize }
                autocomplete={ this.state.editorAutocomplete }
                code={ this.state.code }
                handleCodeChange={ this.handleCodeChange }
              />
            </div>

            <div className="col s12 m6">&nbsp;</div>
          </div>
        </main>
      </>
    );
  }
}

export default App;
