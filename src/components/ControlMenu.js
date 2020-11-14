import styled from 'styled-components/macro';

import { ReferentMenuItems } from './ReferentMenuItems';

const ControlMenuContainer = styled.div`
  z-index: 1000;
  position: fixed;
  top: 0;
  left: 50%;
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
  isPlaying,
  isWaitingRoom,
  localstream,
  rtc,
  setIsOpen,
  setModalType,
  toggleChannelOpen,
}) => {
  return (
    <ControlMenuContainer>
      {isPlaying && (
        <ReferentMenuItems
          {...{
            currentMainId,
            isWaitingRoom,
            localstream,
            rtc,
            setIsOpen,
            setModalType,
            toggleChannelOpen,
          }}
        />
      )}
      {/* <ControlItem className="muteAudio" onClick={onMutePageAudio}>
        {MuteAudioIcon}
      </ControlItem> */}
    </ControlMenuContainer>
  );
};
