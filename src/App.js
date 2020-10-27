import React, { useEffect } from 'react';

import Content from './Content';

const App = ({ rtc, rtm }) => {
  useEffect(() => {
    rtc.createClient();
    rtc.initClient();
  }, []);

  return <Content rtc={rtc} rtm={rtm} />;
};

export default App;
