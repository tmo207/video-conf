import React from 'react';
import styled from 'styled-components';

const HostsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 2;
`;

const Host = styled.div`
  background: grey;
  border-radius: 20px;
  margin: 0 10px;
`;

const MainHost = styled(Host)`
  background: blue;
`;

const CoHostsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const CoHost = styled(Host)`
  flex-grow: 1;
`;

export const Hosts = () => (
  <HostsContainer>
    <MainHost>Main</MainHost>
    <CoHostsContainer>
      <CoHost>Co-Host</CoHost>
      <CoHost>Co-Host</CoHost>
      <CoHost>Co-Host</CoHost>
      <CoHost>Co-Host</CoHost>
      <CoHost>Co-Host</CoHost>
    </CoHostsContainer>
  </HostsContainer>
);
