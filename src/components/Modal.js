import { useContext } from 'react';
import ReactModal from 'react-modal';
import styled from 'styled-components/macro';

import { UserContext, SessionContext } from '../state';

import {
  ControlItem,
  GREEN,
  HANGUP,
  MESSAGES,
  RED,
  ROLES,
  HangUpIcon,
  VideoIcon,
  modalStyle,
} from '../utils';

const { HOST } = ROLES;
const {
  HOST_INVITE_ACCEPTED,
  HOST_INVITE_DECLINED,
  MAIN_SCREEN_UPDATED,
  NO_MAIN_SCREEN,
} = MESSAGES;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const ModalButton = styled.button.attrs((props) => ({
  className: props.accept ? 'accept' : 'decline',
}))`
  background-color: ${(props) => (props.accept ? GREEN : RED)};
  border: none;
  border-radius: 20px;
  color: white;
  padding: 8px 30px;
  margin: 0 8px;

  &:hover {
    cursor: pointer;
  }
`;

const ModalIcon = styled(ControlItem).attrs((props) => ({
  className: props.isActive ? 'active' : '',
}))`
  margin: 0 auto;
`;

export const Modal = ({
  adminId,
  currentMainId,
  isOpen,
  isWaitingRoom,
  modalType,
  rtc,
  rtm,
  setIsOpen,
  setIsPlaying,
  setLocalWaitingRoom,
  setRole,
}) => {
  const { channel_id: channelId, event_id: eventId, token } = useContext(SessionContext);
  const { userId } = useContext(UserContext);

  const acceptHostInvitation = () => {
    setRole(HOST);
    rtc.publishAndStartStream(userId, HOST);
    rtm.sendPeerMessage({ to: adminId, from: userId, subject: HOST_INVITE_ACCEPTED });
    if (isWaitingRoom) setLocalWaitingRoom(false);
  };

  const acceptHangUp = () => {
    if (userId === currentMainId) {
      rtc
        .setMainScreen({ mainscreen: null, channelId, eventId, token })
        .then(() => rtc.removeStream(userId));
      rtm.sendChannelMessage(NO_MAIN_SCREEN, MAIN_SCREEN_UPDATED);
    } else {
      rtc.removeStream(userId);
    }
    setIsPlaying(false);
    rtc.client.unpublish(rtc.localstream);
  };

  const isHostInvitation = modalType === HOST;
  const isHangUp = modalType === HANGUP;

  return (
    <ReactModal
      isOpen={isOpen}
      style={modalStyle}
      contentLabel="Call-to-Action Modal"
      ariaHideApp={false}
    >
      {isHostInvitation && (
        <ModalContent
          {...{
            icon: VideoIcon,
            headline: 'Konferenz beitreten?',
            text:
              'Der Host dieser Konferenz hat dich dazu eingeladen der Konferenz beizutreten. Hierfür werden Mikrofon und deine Kamera aktiviert. Möchtest du beitreten?',
            onAccept: acceptHostInvitation,
            onDecline: () =>
              rtm.sendPeerMessage({ from: userId, to: adminId, subjectt: HOST_INVITE_DECLINED }),
            setIsOpen,
          }}
        />
      )}
      {isHangUp && (
        <ModalContent
          {...{
            icon: HangUpIcon,
            iconRed: true,
            headline: 'Bist du dir sicher?',
            text:
              'Willst du wirklich aus der Videokonferenz austreten? Dein Platz wird eventuell neu besetzt.',
            onAccept: acceptHangUp,
            setIsOpen,
          }}
        />
      )}
    </ReactModal>
  );
};

const ModalContent = ({ icon, iconRed, headline, text, onAccept, onDecline, setIsOpen }) => (
  <>
    {icon && (
      <ModalIcon red={iconRed} isActive>
        {icon}
      </ModalIcon>
    )}
    {headline && <h1>{headline}</h1>}
    {text && <p>{text}</p>}
    <ButtonContainer>
      <ModalButton
        type="button"
        onClick={() => {
          if (onDecline) onDecline();
          setIsOpen(false);
        }}
      >
        Ablehnen
      </ModalButton>
      <ModalButton
        accept
        type="button"
        onClick={() => {
          onAccept();
          setIsOpen(false);
        }}
      >
        Akzeptieren
      </ModalButton>
    </ButtonContainer>
  </>
);
