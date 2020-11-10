import { useState } from 'react';
import styled from 'styled-components/macro';

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

const ControlMenuContainer = styled.div`
  z-index: 1000;
  position: fixed;
  top: 0;
  left: 50%;
  width: 250px;
  height: 80px;
  padding: 0 10px;
  background-color: grey;
  transform: translateX(-50%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px;
`;

export const ControlMenu = ({
  currentMainId,
  localstream,
  rtc,
  setModalType,
  setIsOpen,
  userId,
}) => {
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
      const newStream = rtc.createStream(userId, ROLES.SUPERHOST);
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
    <ControlMenuContainer>
      <ControlItem red onClick={onHangUp}>
        {HangUpIcon}
      </ControlItem>
      <ControlItem onClick={onVideo} isActive={hasVideo}>
        {VideoIcon}
      </ControlItem>
      <ControlItem onClick={onAudio} isActive={hasAudio}>
        {AudioIcon}
      </ControlItem>
      {isMainScreen && (
        <ControlItem onClick={onScreen} isActive={hasScreen}>
          {ScreenIcon}
        </ControlItem>
      )}
    </ControlMenuContainer>
  );
};
