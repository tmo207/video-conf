import ReactModal from 'react-modal';
import styled from 'styled-components/macro';

import { ControlItem, green, hangUpIcon, hangUp, red, roles, stage, videoIcon } from '../utils';

const { host } = roles;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const ModalButton = styled.button`
  background-color: ${(props) => (props.accept ? green : red)};
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
    color: 'black',
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
  currentMainId,
  isOpen,
  isWaitingRoom,
  modalType,
  rtc,
  rtm,
  setIsOpen,
  setIsPlaying,
  setMainScreenId,
  superhostId,
  userId,
}) => {
  const acceptHostInvitation = () => {
    rtm.acceptHostInvitation(userId, superhostId);
    rtc.client.setClientRole(host, (error) => {
      if (!error && isWaitingRoom) rtc.join(userId, host);
      else if (!error && !isWaitingRoom) rtc.publishAndStartStream(userId, host);
      else console.log('setHost error', error);
    });
  };

  const acceptStageInvitation = () => {
    rtm.acceptStageInvitation(userId, currentMainId);
    setMainScreenId(userId);
  };

  const acceptHangUp = () => {
    rtc.removeStream(userId);
    setIsPlaying(false);
  };

  const isHostInvitation = modalType === host;
  const isStageInvitation = modalType === stage;
  const isHangUp = modalType === hangUp;

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
            icon: videoIcon,
            headline: 'Konferenz beitreten?',
            text:
              'Der Host dieser Konferenz hat dich dazu eingeladen der Konferenz beizutreten. Hierfür werden Mikrofon und deine Kamera aktiviert. Möchtest du beitreten?',
            onAccept: acceptHostInvitation,
            onDecline: () => rtm.declineHostInvitation(userId, superhostId),
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
            onDecline: () => rtm.declineHostInvitation(userId, superhostId),
            setIsOpen,
          }}
        />
      )}
      {isHangUp && (
        <ModalContent
          {...{
            icon: hangUpIcon,
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
