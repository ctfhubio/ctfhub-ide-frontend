import React from 'react';
import Editor from './components/Editor';

import './App.css';

class App extends React.Component<any, any> implements React.ComponentLifecycle<any, any> {
  render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    return (
      <>
        <header>

        </header>
        <main>
          <div className="row">
            <div className="col s12 l8" style={{ padding: "0" }}>
              <Editor/>
            </div>

            <div className="col s12 m6">&nbsp;</div>
          </div>
        </main>
      </>
    );
  }
}

export default App;
