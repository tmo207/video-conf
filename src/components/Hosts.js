import { useState, useEffect } from 'react';
import styled, { css } from 'styled-components/macro';
import PropTypes from 'prop-types';

import { global, SCREEN_SHARE } from '../utils/constants';
import { getUserDetails } from '../utils/requests';
import { BORDER_RADIUS, HOST_VIDEO_WIDTH, withBorder } from '../utils/styles';

const HostWithScreenShare = css`
  position: absolute;
  z-index: 1;
  bottom: 10px;
  right: 10px;
`;

const Host = styled.div`
  ${withBorder}
  margin: 0 5px;
  text-align: center;
  position: relative;
  width: ${(props) => (props.hasScreenShare ? '15%' : '100%')};
  ${(props) => props.hasScreenShare && HostWithScreenShare}

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

const HostNameWrapper = styled.span`
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

const Container = styled.div.attrs((props) => ({
  className: props.isMain ? 'main' : '',
}))`
  width: ${(props) => (props.isMain ? '100%' : HOST_VIDEO_WIDTH)};
  max-height: ${(props) => (props.isMain ? '55vh' : '15vh')};
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 5px;
`;

const HostName = ({ isMain, id }) => {
  const { channelId, eventId, token } = global;
  const [details, setDetails] = useState([]);

  useEffect(() => {
    getUserDetails({
      ids: [id],
      channelId,
      eventId,
      token,
      callback: setDetails,
    });
  }, [id]);

  if (details && details[0]) {
    const { name } = details[0];
    return <HostNameWrapper isMain={isMain}>{name}</HostNameWrapper>;
  }
  return null;
};

export const Hosts = ({ streams, currentMainId }) => {
  const mainStream = streams.filter((stream) => stream.streamId === currentMainId)[0];
  const screenStream = streams.filter((stream) => stream.streamId.includes(SCREEN_SHARE))[0];

  return (
    <HostsContainer>
      {mainStream && (
        <Container isMain key={mainStream.streamId} id={`container-${mainStream.streamId}`}>
          <Host hasScreenShare={!!screenStream} id={`video-${mainStream.streamId}`}>
            <HostName id={mainStream.streamId} />
          </Host>
          {screenStream && <Host id={`video-${screenStream.streamId}`} />}
        </Container>
      )}
      {streams.map((stream) => {
        const { streamId } = stream;
        const isReferent = currentMainId !== streamId && streamId !== SCREEN_SHARE;
        if (isReferent) {
          return (
            <Container key={streamId} id={`container-${streamId}`}>
              <Host id={`video-${streamId}`}>
                <HostName id={streamId} />
              </Host>
            </Container>
          );
        }
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
