import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import axios, { AxiosResponse } from 'axios';

import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-php';
import 'ace-builds/src-noconflict/mode-golang';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-elastic_tabstops_lite';
import 'ace-builds/src-noconflict/theme-github';

import './Editor.css';

import { Languages } from '../interfaces/languages';
import { IdeSubmissionResponse, IdeResponse } from '../interfaces/ide';
import { EditorState, EditorProps } from '../interfaces/editor';

class Editor extends React.Component<EditorProps, EditorState> implements React.ComponentLifecycle<EditorProps, EditorState> {
  selectedLangLocalstorageKey: string;

  constructor(props: Readonly<EditorProps>) {
    super(props);

    this.selectedLangLocalstorageKey = 'selected_lang';
    this.state = {
      autocomplete: true,
      fontSize: 15,
      availableLanguages: {},
      ideMode: 'text',
      theme: 'github',
      tabSize: 2,
      code: '',
      selectedLanguage: 'text',
      running: false
    };

    this.handleLanguageChange = this.handleLanguageChange.bind(this);
    this.handleCodeChange = this.handleCodeChange.bind(this);
    this.handleCodeSubmission = this.handleCodeSubmission.bind(this);
  }

  componentDidMount(): void {
    this.fetchLanguages().then(availableLanguages => this.setState({
      availableLanguages,
      selectedLanguage: this._getIdeDefaultLanguage(availableLanguages)
    }, this._updateIdeProps));

    window.addEventListener('beforeunload', this._saveCodeInLocalStorage);
  }

  _getIdeDefaultLanguage = (availableLanguages: Languages) => {
    let languageKey = localStorage.getItem(this.selectedLangLocalstorageKey);
    const availableLanguageKeys = Object.keys(availableLanguages);

    if (languageKey && availableLanguageKeys.includes(languageKey)) {
      return languageKey;
    }

    return availableLanguageKeys[0] || 'text';
  };

  _getCodeLocalstorageKey = (): string => {
    return `${this.state.selectedLanguage}_code`;
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

  _getIdeMode = (): string => {
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

  _updateIdeProps = () => {
    this.setState({
      ideMode: this._getIdeMode(),
      code: this._getDefaultCode()
    });
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

  handleLanguageChange(event: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ selectedLanguage: event.target.value }, this._updateIdeProps);
    localStorage.setItem(this.selectedLangLocalstorageKey, event.target.value);
  }

  handleCodeChange(code: string) {
    this.setState({ code });
  }

  handleCodeSubmission(event: React.MouseEvent<HTMLButtonElement>) {
    const { REACT_APP_IDE_NEW_REQUEST_API } = process.env;
    this.setState({ running: true });

    axios
      .post(REACT_APP_IDE_NEW_REQUEST_API, {
        lang: this.state.selectedLanguage,
        source: this.state.code,
        stdin: this.props.stdin || ''
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
      .then(this.props.codeExecutionSuccessHandler)
      .catch(this.props.codeExecutionErrorHandler)
      .finally(() => this.setState({ running: false }));
  }

  render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    return (
      <>
        <div className="ide-header-container">
          <div className="ide-header">
            <div className="ide-options">
              <div>
                Language <select
                  name="language"
                  style={{ display: "inline" }}
                  onChange={ this.handleLanguageChange }
                  value={ this.state.selectedLanguage }
                >
                  {Object.values(this.state.availableLanguages).map((language) =>
                    <option key={ language.key } value={ language.key }>{ language.name }</option>
                  )}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <FontAwesomeIcon icon={ faCog } size="1x" />
              </div>
            </div>

            <div>
              <button
                className="btn waves-effect waves-light btn-run"
                onClick={ this.handleCodeSubmission }
                disabled={ this.state.running }
              >Run</button>
            </div>
          </div>
        </div>

        <div className="ide-container">
          <AceEditor
            className="editor"
            name="editor"
            mode={ this.state.ideMode }
            theme={ this.state.theme }
            editorProps={{ $blockScrolling: true }}
            width=""
            height=""
            fontSize={ this.state.fontSize }
            tabSize={ this.state.tabSize }
            setOptions={{
              enableBasicAutocompletion: this.state.autocomplete,
              enableLiveAutocompletion: this.state.autocomplete,
              cursorStyle: "smooth",
              fontFamily: 'source-code-pro, Menlo, Monaco, Consolas, "Courier New" monospace',
              useElasticTabstops: true,
              useWorker: false
            }}
            value={ this.state.code }
            onChange={ this.handleCodeChange }
            focus={ true }
          />
        </div>
      </>
    );
  }
}

export default Editor;
