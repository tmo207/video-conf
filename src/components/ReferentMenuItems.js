import { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import Switch from '@material-ui/core/Switch';

import { UserContext, SessionContext } from '../state';

import {
  AudioIcon,
  ControlItem,
  HANGUP,
  HangUpIcon,
  ROLES,
  SCREEN_CLIENT,
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
  rtc,
  role,
  setIsOpen,
  setModalType,
  toggleChannelOpen,
}) => {
  const { userId } = useContext(UserContext);
  const { app_id: APP_ID, channel_id: CHANNEL_ID } = useContext(SessionContext);
  const { localstream } = rtc;

  const [hasVideo, setHasVideo] = useState(localstream.hasVideo());
  const [hasAudio, setHasAudio] = useState(localstream.hasAudio());
  const [hasScreen, setHasScreen] = useState(false);

  const isMainScreen = userId === currentMainId;

  useEffect(() => {
    rtc.createClient(SCREEN_CLIENT);
    rtc[SCREEN_CLIENT].init(APP_ID, () =>
      rtc[SCREEN_CLIENT].join(rtc.rtcToken, CHANNEL_ID, SCREEN_SHARE)
    );
  }, []);

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
      rtc[SCREEN_CLIENT].unpublish(rtc[SCREEN_SHARE]);
      setHasScreen(false);
    } else {
      rtc.publishAndStartStream({
        uid: SCREEN_SHARE,
        role: SCREEN_SHARE,
        clientType: SCREEN_CLIENT,
      });
      setHasScreen(true);
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
