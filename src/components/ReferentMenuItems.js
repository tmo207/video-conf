import { useState, useContext } from 'react';
import styled from 'styled-components';
import Switch from '@material-ui/core/Switch';

import { Modal } from './Modal';

import { UserContext } from '../state';

import { ROLES, SCREEN_CLIENT, SCREEN_SHARE, MESSAGES, global } from '../utils/constants';
import { AudioIcon, HangUpIcon, ScreenIcon, VideoIcon } from '../utils/icons';
import { ControlItem } from '../utils/styles';

const { SUPERHOST } = ROLES;
const { NO_MAIN_SCREEN, MAIN_SCREEN_UPDATED } = MESSAGES;

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
  rtm,
  userRole,
  toggleChannelOpen,
}) => {
  const { userId } = useContext(UserContext);
  const { localstream } = rtc;
  const { channelId, eventId, token } = global;

  const [hasVideo, setHasVideo] = useState(localstream && localstream.hasVideo());
  const [hasAudio, setHasAudio] = useState(localstream && localstream.hasAudio());
  const [hasScreen, setHasScreen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const isMainScreen = userId === currentMainId;

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

  const onHangUp = () => {
    setIsOpen(true);
  };

  const acceptHangUp = () => {
    setIsOpen(false);
    if (userId === currentMainId) {
      rtc
        .setMainScreen({ mainscreen: null, channelId, eventId, token })
        .then(() => rtc.removeStream(userId));
      rtm.sendChannelMessage(NO_MAIN_SCREEN, MAIN_SCREEN_UPDATED);
    } else {
      rtc.removeStream(userId);
    }
    rtc.unpublishAll();
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
      {userRole === SUPERHOST && (
        <OpenChannel isActive={!isWaitingRoom} onClick={toggleChannelOpen}>
          <Switch checked={!isWaitingRoom} color="primary" />
          <OpenChannelText>{isWaitingRoom ? 'Privat' : 'Live'}</OpenChannelText>
        </OpenChannel>
      )}
      {isOpen && (
        <Modal
          {...{
            icon: HangUpIcon,
            headline: 'Bist du dir sicher?',
            text:
              'Willst du wirklich aus der Videokonferenz austreten? Dein Platz wird eventuell neu besetzt.',
            onAccept: acceptHangUp,
            isOpen,
            setIsOpen,
          }}
        />
      )}
    </>
  );
};
