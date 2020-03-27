import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-elastic_tabstops_lite';
import 'ace-builds/src-noconflict/theme-github';

import './Editor.css';

import { Languages } from '../interfaces/languages';
import { EditorState } from '../interfaces/editor';

class Editor extends React.Component<any, EditorState> implements React.ComponentLifecycle<any, EditorState> {
  selectedLangLocalstorageKey: string;

  constructor(props: any) {
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
      selectedLanguage: 'text'
    };

    this.handleLanguageChange = this.handleLanguageChange.bind(this);
    this.handleCodeChange = this.handleCodeChange.bind(this);
  }

  componentDidMount(): void {
    this.fetchLanguages().then(availableLanguages => this.setState({
      tabSize: 2,
      fontSize: 15,
      theme: 'github',
      autocomplete: true,
      availableLanguages,
      selectedLanguage: this.getDefaultLanguage(availableLanguages)
    }, this.updateIdeProps));
  }

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

  updateIdeProps() {
    this.setState({
      ideMode: this.getIdeMode(),
      code: this.getCode()
    })
  }

  getDefaultLanguage(availableLanguages: Languages) {
    let languageKey = localStorage.getItem(this.selectedLangLocalstorageKey);
    const availableLanguageKeys = Object.keys(availableLanguages);

    if (languageKey && availableLanguageKeys.includes(languageKey)) {
      return languageKey;
    }

    return availableLanguageKeys[0] || 'text';
  }

  getCode(): string {
    const key = this.state.selectedLanguage;
    let code: string = localStorage.getItem(this.getCodeLocalstorageKey()) || '';

    if (!code && (
      this.state.availableLanguages &&
      this.state.availableLanguages[key]
    )) {
      return this.state.availableLanguages[key].code || '';
    }

    return code;
  }

  getCodeLocalstorageKey(): string {
    return `${this.state.selectedLanguage}_code`;
  }

  getIdeMode(): string {
    switch (this.state.selectedLanguage) {
      case 'c':
      case 'cpp':
        return 'c_cpp';

      case 'python2':
      case 'python3':
        return 'python';

      case 'nodejs':
        return 'javascript';

      default:
        return 'text';
    }
  }

  handleCodeSubmission(event: React.MouseEvent<HTMLButtonElement>) {
    // TODO: Implement method.
  }

  handleLanguageChange(event: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ selectedLanguage: event.target.value }, this.updateIdeProps);
    localStorage.setItem(this.selectedLangLocalstorageKey, event.target.value);
  }

  handleCodeChange(code: string) {
    this.setState({ code }, this.saveCodeInLocalStorage);
  }

  saveCodeInLocalStorage() {
    localStorage.setItem(this.getCodeLocalstorageKey(), this.state.code)
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
              <button className="btn waves-effect waves-light btn-run" onClick={ this.handleCodeSubmission }>Run</button>
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
              useElasticTabstops: true
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
