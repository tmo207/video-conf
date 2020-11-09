import React from 'react';
import ReactDOM from 'react-dom';
import { createGlobalStyle } from 'styled-components';

import Rtm from './rtm';
import Rtc from './rtc';
import App from './App';

import { useUser, UserContext } from './state';
import { APP_ID, CHANNEL_NAME } from './utils';

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
const rtm = new Rtm({ APP_ID, CHANNEL_NAME, uid: '333' });

const Context = ({ children }) => {
  const userId = useUser();
  return <UserContext.Provider value={userId}>{children}</UserContext.Provider>;
};

ReactDOM.render(
  <React.StrictMode>
    <GlobalStyle />
    <Context>
      <App rtc={rtc} rtm={rtm} />
    </Context>
  </React.StrictMode>,
  document.getElementById('root')
);
