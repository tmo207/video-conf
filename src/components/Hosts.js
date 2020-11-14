import styled from 'styled-components/macro';
import PropTypes from 'prop-types';

import { BORDER_RADIUS, HOST_VIDEO_WIDTH, getFullUserDetails, withBorder } from '../utils';

const Host = styled.div`
  ${withBorder}
  margin: 0 5px;
  text-align: center;
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

const Container = styled.div.attrs((props) => ({
  className: props.isMain ? 'main' : '',
}))`
  width: ${(props) => (props.isMain ? '100%' : HOST_VIDEO_WIDTH)};
  order: ${(props) => (props.isMain ? 1 : 2)};
  max-height: ${(props) => (props.isMain ? '55vh' : '15vh')};
  display: flex;
  justify-content: center;
  margin-bottom: 5px;

  & > div {
    width: 100%;
  }
`;

export const Hosts = ({ streams, currentMainId, users }) => {
  return (
    <HostsContainer>
      {streams.map((stream) => {
        const { streamId } = stream;
        const name = getFullUserDetails({ ids: [streamId], users })[0].username;
        const isMain = currentMainId === streamId;
        return (
          <Container key={streamId} isMain={isMain} id={`container-${streamId}`}>
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
