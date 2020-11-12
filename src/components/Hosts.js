import { useEffect } from 'react';
import styled from 'styled-components/macro';
import PropTypes from 'prop-types';

import { BORDER_RADIUS, HOST_VIDEO_WIDTH, moveToHost, moveToMain, withBorder } from '../utils';

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
  width: 80%;
  max-width: 58vw;
`;

export const Hosts = ({ streams, currentMainId }) => {
  console.log({ streams });
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
        return <Host key={streamId} id={`video-${streamId}`} />;
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
