import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import Switch from '@material-ui/core/Switch';

import { ReferentMenuItems } from './ReferentMenuItems';

import { UserContext } from '../state';

import { MESSAGES, ROLES } from '../utils/constants';
import { ControlItem } from '../utils/styles';

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

const { HOST, SUPERHOST } = ROLES;

export const ControlMenu = ({ adminId, rtc, rtm, userRole, ...restProps }) => {
  const { userId } = useContext(UserContext);
  const [hasRequested, setHasRequested] = useState(false);

  const isHost = userRole === SUPERHOST || userRole === HOST;

  useEffect(() => rtm.addHasRequestedHandler(setHasRequested), []);

  const onSendRequest = () => {
    setHasRequested((rights) => !rights);
    rtm.sendPeerMessage({ to: adminId, from: userId, subject: MESSAGES.ASK_STAGE_ACCESS });
  };

  return (
    <ControlMenuContainer>
      {isHost && (
        <ReferentMenuItems
          {...{
            userRole,
            rtc,
            rtm,
            ...restProps,
          }}
        />
      )}
      {!isHost && (
        <RequestReferentRights onClick={() => !hasRequested && onSendRequest()}>
          <Switch checked={hasRequested} color="primary" />
          <RequestRightsText>
            {hasRequested ? 'Teilnahme angefragt' : 'Teilnahme anfragen'}
          </RequestRightsText>
        </RequestReferentRights>
      )}
    </ControlMenuContainer>
  );
};
