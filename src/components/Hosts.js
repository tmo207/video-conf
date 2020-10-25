import React from 'react';
import styled from 'styled-components/macro';
import PropTypes from 'prop-types';

import { WithBorder, borderRadius } from './helpers/sharedStyles';
import { roles } from '../constants';

const HostsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 2;
`;

const Host = styled(WithBorder)`
  background: grey;
  margin: 0 5px;
  text-align: center;

  & > div {
    ${borderRadius}

    > video {
      position: relative !important;
    }
  }
`;

const MainHost = styled(Host)`
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
`;

const { audience, host, moderator, superhost } = roles;

export const Hosts = ({ streams, role }) => (
  <HostsContainer>
    {/* {streams.map((stream) => stream.getId() === '1' && <MainHost id={superhost} />)} */}
    <CoHostsContainer>
      {streams.map((stream) => {
        const streamID = stream.getId();
        // TODO: query for superhost user id
        // if (streamID === 'superhost-userID') {
        //   return <MainHost id={superhost} />;
        // }
        return <CoHost key={streamID} id={`video-${streamID}`} />;
      })}
    </CoHostsContainer>
  </HostsContainer>
);

Hosts.defaultProps = {
  streams: [],
};

Hosts.propTypes = {
  role: PropTypes.oneOf([audience, host, moderator, superhost]).isRequired,
  streams: PropTypes.arrayOf(PropTypes.object),
};
