import React from 'react';
import Editor from './components/Editor';

import './App.css';

import { IdeResponse } from './interfaces/ide';
import { SubmissionErrors } from './interfaces/editor';

class App extends React.Component<any, any> implements React.ComponentLifecycle<any, any> {

  constructor(props: any) {
    super(props);

    this.state = {};

    this.codeExecutionSuccessHandler = this.codeExecutionSuccessHandler.bind(this);
    this.codeExecutionErrorHandler = this.codeExecutionErrorHandler.bind(this);
  }

  codeExecutionSuccessHandler(result: IdeResponse) {
  }

  codeExecutionErrorHandler(error: SubmissionErrors) {
  }

  render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    return (
      <>
        <header>

        </header>
        <main>
          <div className="row">
            <div className="col s12 l8" style={{ padding: "0" }}>
              <Editor
                codeExecutionSuccessHandler={ this.codeExecutionSuccessHandler }
                codeExecutionErrorHandler={ this.codeExecutionErrorHandler }
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
