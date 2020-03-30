import React from 'react';

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

import { EditorState, EditorProps } from '../interfaces/editor';

import './Editor.css';

class Editor extends React.Component<EditorProps, EditorState> implements React.ComponentLifecycle<EditorProps, EditorState> {

  render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    return (
      <>
        <div className="ide-container">
          <AceEditor
            className="editor"
            name="editor"
            mode={ this.props.mode }
            theme={ this.props.theme }
            editorProps={{ $blockScrolling: false }}
            width=""
            height=""
            fontSize={ this.props.fontSize }
            tabSize={ this.props.tabSize }
            setOptions={{
              enableBasicAutocompletion: this.props.autocomplete,
              enableLiveAutocompletion: this.props.autocomplete,
              cursorStyle: "smooth",
              fontFamily: 'source-code-pro, Menlo, Monaco, Consolas, "Courier New" monospace',
              useElasticTabstops: true,
              useWorker: false
            }}
            value={ this.props.code }
            onChange={ this.props.handleCodeChange }
            focus={ true }
          />
        </div>
      </>
    );
  }
}

export default Editor;
