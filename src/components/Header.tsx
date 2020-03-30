import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

import { HeaderProps, HeaderState } from '../interfaces/header';

import './Header.css';

class Header extends React.Component<HeaderProps, HeaderState> implements React.ComponentLifecycle<HeaderProps, HeaderState> {

  render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    return (
      <div className="ide-header-container">
        <div className="ide-header">
          <div className="ide-options">
            <div>
              Language <select
                name="language"
                style={{ display: "inline" }}
                onChange={ this.props.onLanguageChange }
                value={ this.props.selectedLanguage }
              >
                {Object.values(this.props.availableLanguages).map((language) =>
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
              onClick={ this.props.onCodeSubmission }
              disabled={ this.props.isCodeRunning }
            >Run</button>
          </div>
        </div>
      </div>
    );
  }
}

export default Header;
