/* eslint-disable camelcase */
import React from 'react';
import ReactDOM from 'react-dom';
import { createGlobalStyle } from 'styled-components';

import Rtm from './rtm';
import Rtc from './rtc';
import App from './App';

import { useUser, UserContext } from './state';
import { global, defaultSessionContext } from './utils/constants';

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
  return <UserContext.Provider value={userId}>{children}</UserContext.Provider>;
};

const Agora = () => {
  const { app_id, channel_id, channel_typ, event_id, token } =
    window.XC_AGORA_DATA || defaultSessionContext;
  global.appId = app_id;
  global.channelId = channel_id;
  global.channelType = channel_typ;
  global.eventId = event_id;
  global.token = token;

  const rtc = new Rtc({
    appId: app_id,
    channelId: channel_id,
    eventId: event_id,
    userToken: token,
  });
  const rtm = new Rtm({ appId: app_id, channelId: channel_id });
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
