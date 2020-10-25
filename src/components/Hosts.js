import React from 'react';
import styled from 'styled-components/macro';
import PropTypes from 'prop-types';

import { WithBorder, borderRadius } from './helpers/sharedStyles';

const HostsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 2;
`;

const Host = styled(WithBorder)`
  background: grey;
  margin: 0 5px;
  text-align: center;
`;

const MainHost = styled(Host)`
  background: blue;
  height: 300px;
`;

const CoHostsContainer = styled.div`
  display: flex;
  margin-top: 20px;
`;

const CoHost = styled(Host)`
  height: 200px;
  width: 200px;
  position: relative;

  & > div {
    ${borderRadius}

    > video {
      position: relative !important;
    }
  }
`;

export const Hosts = ({ streams }) => (
  <HostsContainer>
    <MainHost id="host">Host</MainHost>
    <CoHostsContainer>
      {streams.map((stream) => {
        const streamId = stream.getId();
        return <CoHost key={streamId} id={`video-${streamId}`} />;
      })}
    </CoHostsContainer>
  </HostsContainer>
);

Hosts.defaultProps = {
  streams: [],
};

Hosts.propTypes = {
  streams: PropTypes.arrayOf(PropTypes.object),
};
