import { useEffect } from 'react';
import styled from 'styled-components/macro';
import PropTypes from 'prop-types';

import { WithBorder, borderRadius, hostVideoWidth, moveToHost, moveToMain } from '../utils';

const Host = styled(WithBorder)`
  background: grey;
  margin: 0 5px;
  text-align: center;
  width: ${hostVideoWidth};
  position: relative;
  order: 2;

  & > div {
    ${borderRadius}

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
