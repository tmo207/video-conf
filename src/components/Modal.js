import { useContext } from 'react';
import ReactModal from 'react-modal';
import styled from 'styled-components/macro';

import { UserContext } from '../state';

import {
  ControlItem,
  GREEN,
  HANGUP,
  NO_CURRENT_MAIN_ID,
  RED,
  ROLES,
  STAGE,
  HangUpIcon,
  VideoIcon,
} from '../utils';

const { HOST } = ROLES;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const ModalButton = styled.button`
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

const ModalIcon = styled(ControlItem)`
  margin: 0 auto;
`;

const modalStyle = {
  content: {
    color: 'BLACK',
    textAlign: 'center',
    maxWidth: '90vw',
    width: '300px',
    height: 'fit-content',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '20px',
  },
};

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
  setIsWaitingRoom,
}) => {
  const { userId } = useContext(UserContext);

  const acceptHostInvitation = () => {
    if (isWaitingRoom) setIsWaitingRoom(false);
    rtc.publishAndStartStream(userId, HOST);
    rtm.acceptHostInvitation(userId, adminId);
  };

  const acceptStageInvitation = () => {
    rtc.setMainScreen(userId);
    rtm.updateMainScreen(userId);
  };

  const acceptHangUp = () => {
    if (userId === currentMainId) {
      rtc.setMainScreen(NO_CURRENT_MAIN_ID).then(() => rtc.removeStream(userId));
      rtm.updateMainScreen(NO_CURRENT_MAIN_ID);
    } else {
      rtc.removeStream(userId);
    }
    setIsPlaying(false);
    rtc.client.unpublish(rtc.localstream);
  };

  const isHostInvitation = modalType === HOST;
  const isStageInvitation = modalType === STAGE;
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
            onDecline: () => rtm.declineHostInvitation(userId, adminId),
            setIsOpen,
          }}
        />
      )}
      {isStageInvitation && (
        <ModalContent
          {...{
            headline: 'Bühne betreten?',
            text:
              'Der Host dieser Konferenz hat dich dazu eingeladen die Bühne zu betreten. Möchtest du das?',
            onAccept: acceptStageInvitation,
            onDecline: () => rtm.declineHostInvitation(userId, adminId),
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
