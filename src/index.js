import React from 'react';
import ReactDOM from 'react-dom';
import { createGlobalStyle } from 'styled-components';

import Rtm from './rtm';
import Rtc from './rtc';
import App from './App';

import { appId, channelName } from './constants';

const GlobalStyle = createGlobalStyle`
* {
  &:focus {
    outline:none;
  }
}

  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
    color: #000000;
    font-family: Roboto;
    font-size: 14px;
    line-height: 16px;
  }

  html {
    background-image: url(/background.jpg);
  }
`;

const rtc = new Rtc();
const rtm = new Rtm({ appId, channelName, uid: 333 });

ReactDOM.render(
  <React.StrictMode>
    <GlobalStyle />
    <App rtc={rtc} rtm={rtm} />
  </React.StrictMode>,
  document.getElementById('root')
);
