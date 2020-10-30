import React from 'react';
import styled from 'styled-components/macro';
import PropTypes from 'prop-types';

import { WithBorder, borderRadius } from './helpers/sharedStyles';
import { roles } from '../constants';

const Host = styled(WithBorder)`
  background: grey;
  margin: 0 5px;
  text-align: center;
  height: 200px;
  width: 200px;
  max-width: 20%;
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
  margin-top: 20px;
  width: 100%;
`;

const { audience, host, moderator, superhost } = roles;

export const Hosts = ({ streams, currentMainId }) => {
  React.useEffect(() => {
    streams.map((stream) => {
      if (stream.streamId !== currentMainId) {
        const noHost = document.getElementById(`video-${stream.streamId}`);
        if (noHost) {
          noHost.style.maxWidth = '20%';
          noHost.style.width = '200px';
          noHost.style.order = 2;
        }
      }
    });
    const video = document.getElementById(`video-${currentMainId}`);
    if (video) {
      video.style.maxWidth = '100%';
      video.style.width = '100%';
      video.style.order = 1;
    }
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
  role: PropTypes.oneOf([audience, host, moderator, superhost]).isRequired,
  streams: PropTypes.arrayOf(PropTypes.object),
};
