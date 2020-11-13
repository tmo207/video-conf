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
  margin: 0 5px;
  text-align: center;
  width: ${HOST_VIDEO_WIDTH};
  position: relative;

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
  justify-content: center;
  width: 100%;
  max-width: calc(133vh - 400px);
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
  max-width: ${(props) => (props.isMain ? '85%' : '60%')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 350px), (max-height: 900px) {
    ${(props) => !props.isMain && 'display: none'};
  }
`;

const Container = styled.div`
  width: 100%;
  order: 2;
  display: flex;
  justify-content: center;

  & > div {
    width: 100%;
  }
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
        const isMain = currentMainId === streamId;
        return (
          <Container key={streamId} id={`container-${streamId}`}>
            <Host id={`video-${streamId}`}>
              <HostName isMain={isMain}>{name}</HostName>
            </Host>
          </Container>
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
