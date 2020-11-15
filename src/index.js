import React, { useContext } from 'react';
import ReactDOM from 'react-dom';
import { createGlobalStyle } from 'styled-components';

import Rtm from './rtm';
import Rtc from './rtc';
import App from './App';

import { defaultSessionContext, useUser, UserContext, SessionContext } from './state';

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
`;

const Context = ({ children }) => {
  const userId = useUser();
  return (
    <SessionContext.Provider value={window.XC_AGORA_DATA || defaultSessionContext}>
      <UserContext.Provider value={userId}>{children}</UserContext.Provider>
    </SessionContext.Provider>
  );
};

const Agora = () => {
  const { app_id: APP_ID, channel_id: CHANNEL_ID, event_id: EVENT_ID, token } = useContext(
    SessionContext
  );

  const rtc = new Rtc({ APP_ID, CHANNEL_ID, EVENT_ID, USER_TOKEN: token });
  const rtm = new Rtm({ APP_ID, CHANNEL_ID });
  return <App rtc={rtc} rtm={rtm} />;
};

ReactDOM.render(
  <React.StrictMode>
    <GlobalStyle />
    <Context>
      <Agora />
    </Context>
  </React.StrictMode>,
  document.getElementById('root')
);
