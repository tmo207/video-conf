import { useContext, useState } from 'react';
import styled from 'styled-components';
import Switch from '@material-ui/core/Switch';

import { UserContext } from '../state';

import {
  AudioIcon,
  ControlItem,
  HANGUP,
  HangUpIcon,
  ROLES,
  SCREEN_SHARE,
  ScreenIcon,
  VideoIcon,
} from '../utils';

const { SUPERHOST } = ROLES;

const OpenChannel = styled(ControlItem)`
  width: fit-content;
`;

const OpenChannelText = styled.p`
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  min-width: 3rem;
`;

export const ReferentMenuItems = ({
  currentMainId,
  isWaitingRoom,
  localstream,
  rtc,
  role,
  setIsOpen,
  setModalType,
  toggleChannelOpen,
}) => {
  const { userId } = useContext(UserContext);
  const [hasVideo, setHasVideo] = useState(localstream.hasVideo());
  const [hasAudio, setHasAudio] = useState(localstream.hasAudio());
  const [hasScreen, setHasScreen] = useState(false);

  const isMainScreen = userId === currentMainId;

  const onHangUp = () => {
    setModalType(HANGUP);
    setIsOpen(true);
  };

  const onVideo = () => {
    if (hasVideo) {
      localstream.muteVideo();
      setHasVideo(false);
    } else {
      localstream.enableVideo();
      setHasVideo(true);
    }
  };

  const onAudio = () => {
    if (hasAudio) {
      localstream.muteAudio();
      setHasAudio(false);
    } else {
      localstream.enableAudio();
      setHasAudio(true);
    }
  };

  const onScreen = () => {
    if (hasScreen) {
      const newStream = rtc.createStream(userId, SUPERHOST);
      newStream.init(() => {
        const newVideoTrack = newStream.getVideoTrack();
        localstream.replaceTrack(newVideoTrack);
        setHasScreen(false);
      });
    } else {
      const newStream = rtc.createStream(userId, SCREEN_SHARE);
      newStream.init(() => {
        const newVideoTrack = newStream.getVideoTrack();
        localstream.replaceTrack(newVideoTrack);
        setHasScreen(true);
      });
    }
  };

  return (
    <>
      <ControlItem className="hangup" red onClick={onHangUp}>
        {HangUpIcon}
      </ControlItem>
      <ControlItem className="video" onClick={onVideo} isActive={hasVideo}>
        {VideoIcon}
      </ControlItem>
      <ControlItem className="audio" onClick={onAudio} isActive={hasAudio}>
        {AudioIcon}
      </ControlItem>
      {isMainScreen && (
        <ControlItem className="screen" onClick={onScreen} isActive={hasScreen}>
          {ScreenIcon}
        </ControlItem>
      )}
      {role === SUPERHOST && (
        <OpenChannel isActive={!isWaitingRoom} onClick={toggleChannelOpen}>
          <Switch checked={!isWaitingRoom} color="primary" />
          <OpenChannelText>{isWaitingRoom ? 'Privat' : 'Live'}</OpenChannelText>
        </OpenChannel>
      )}
    </>
  );
};
