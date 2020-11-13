import { useEffect } from 'react';
import styled from 'styled-components/macro';
import PropTypes from 'prop-types';

import {
  BORDER_RADIUS,
  HOST_VIDEO_WIDTH,
  getFullUserDetails,
  moveToHost,
  moveToMain,
  withBorder,
} from '../utils';

const Host = styled.div`
  ${withBorder}
  background: grey;
  margin: 0 5px;
  text-align: center;
  width: ${HOST_VIDEO_WIDTH};
  position: relative;
  order: 2;

  & > div {
    ${BORDER_RADIUS}

    > video {
      position: relative !important;
    }
  }
`;

const HostsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  max-width: 100vh;
`;

const HostName = styled.span`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  padding: 0.4rem 1rem;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
  min-width: 50%;
  ${BORDER_RADIUS}
  max-width: 85%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Hosts = ({ streams, currentMainId, users }) => {
  useEffect(() => {
    moveToMain(currentMainId);
    streams.map((stream) => {
      if (stream.streamId !== currentMainId) {
        moveToHost(stream.streamId);
      }
    });
  });

  return (
    <HostsContainer>
      {streams.map((stream) => {
        const { streamId } = stream;
        const name = getFullUserDetails({ ids: [streamId], users })[0].username;
        return (
          <Host key={streamId} id={`video-${streamId}`}>
            <HostName>{name}</HostName>
          </Host>
        );
      })}
    </HostsContainer>
  );
};

Hosts.defaultProps = {
  streams: [],
};

Hosts.propTypes = {
  streams: PropTypes.arrayOf(PropTypes.object),
};
