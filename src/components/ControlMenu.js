import styled from 'styled-components/macro';
import Switch from '@material-ui/core/Switch';

import { ReferentMenuItems } from './ReferentMenuItems';

import { ControlItem } from '../utils';

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

const RequestReferentRights = styled(ControlItem)`
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  width: fit-content;
`;

const RequestRightsText = styled.p`
  margin-right: 0.5rem;
`;

export const ControlMenu = ({
  currentMainId,
  isPlaying,
  isWaitingRoom,
  localstream,
  onRequestReferentRights,
  referentRightsRequested,
  role,
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
            role,
            rtc,
            setIsOpen,
            setModalType,
            toggleChannelOpen,
          }}
        />
      )}
      {!isPlaying && (
        <RequestReferentRights
          onClick={() => !referentRightsRequested && onRequestReferentRights()}
        >
          <Switch checked={referentRightsRequested} color="primary" />
          <RequestRightsText>
            {referentRightsRequested ? 'Teilnahme angefragt' : 'Teilnahme anfragen'}
          </RequestRightsText>
        </RequestReferentRights>
      )}
    </ControlMenuContainer>
  );
};
