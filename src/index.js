import React from 'react';
import ReactDOM from 'react-dom';
import { createGlobalStyle } from 'styled-components';

import Rtm from './rtm';
import Rtc from './rtc';
import App from './App';

import { appId, channelName } from './utils';

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

 

.Toastify__toast-container {
    z-index: 10;
    -webkit-transform: translate3d(0, 0, 10px);
    position: fixed;
    width: 20vw;
    box-sizing: border-box;
    top: 1em;
    right: 1em;
    background-color: #fff;
    cursor: pointer;
    }

    .Toastify__toast-body {
    padding: 1rem;
    position: relative;
    min-height: 2rem;
    box-sizing: border-box;
    margin-bottom: 1rem;
    padding: 8px;
    border-radius: 1px;
    box-shadow: 0 1px 10px 0 rgba(0, 0, 0, .1), 0 2px 15px 0 rgba(0, 0, 0, .05);
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    direction: ltr;
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
