import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components/macro';

import { UserContext } from '../state';

import { MESSAGES, ROLES, SCREEN_SHARE, global } from '../utils/constants';
import { makeCancelable } from '../utils/helpers';
import { CloseIcon, MenuIcon, MinusIcon, PlusIcon, StageIcon } from '../utils/icons';
import { getMainScreen, getUserDetails } from '../utils/requests';
import { BLACK, CONTENT_MARGIN, ControlItem, GREEN, GridItemSmall } from '../utils/styles';

const {
  HOST_INVITE,
  NO_MAIN_SCREEN,
  MAIN_SCREEN_UPDATED,
  HOST_REQUEST_ACCEPTED,
  HOST_REQUEST_DECLINED,
} = MESSAGES;

const isOdd = (num) => num % 2 === 1;
const { AUDIENCE, HOST, SUPERHOST } = ROLES;

const UserListContainer = styled(GridItemSmall)`
  position: fixed;
  z-index: 10;
  top: ${CONTENT_MARGIN};
`;

const Wrapper = styled.div`
  position: relative;
`;

const MenuToggle = styled(ControlItem)`
  z-index: 2;
  margin-top: -20px;
  position: absolute;
`;

const Content = styled.div`
  position: absolute;
  background-color: white;
  border-radius: 10px;
  height: calc(100vh - ${CONTENT_MARGIN});
  z-index: 1;
  max-width: 100vw;
`;

const ListTypeContainer = styled.div`
  display: flex;
  padding-top: 44px;
  padding-bottom: 25px;
  justify-content: space-around;
`;

const ListType = styled.p.attrs((props) => ({
  className: props.isActive ? 'active' : '',
}))`
  color: ${(props) => (props.isActive ? GREEN : BLACK)};
  margin: 1rem 2rem;

  &:hover {
    cursor: pointer;
  }
`;

const UserSearchInput = styled.input`
  margin: 0 0 15px 3px;
  border: none;
  border-bottom: 2px solid ${BLACK};
  color: BLACK;
  width: 90%;

  ::placeholder {
    color: BLACK:
  }
`;

const UserContainer = styled.div`
  background-color: ${(props) => (isOdd(props.index) ? 'white' : 'grey')};
  display: flex;
  justify-content: space-between;
  overflow-y: scroll;
`;

const UserName = styled.p`
  width: 80%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 10px;
`;

const UserActionContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 20%;
  margin-right: 10px;
`;

const UserActionItem = styled.button.attrs((props) => ({
  className: props.isActive ? 'active' : '',
}))`
  border: none;
  background-color: transparent;

  &:hover {
    cursor: pointer;
  }
`;

export const UserList = ({ currentMainId, rtc, rtm, streams }) => {
  const { userId } = useContext(UserContext);
  const { channelId, eventId, token } = global;

  // showUsersWithRole types = audience | host;
  const [showUsersWithRole, setShowUsersWithRole] = useState(AUDIENCE);
  const [referentRequests, setReferentRequests] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [usersInList, setUsersInList] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => rtm.addRequestsHandler(setReferentRequests), []);

  useEffect(() => {
    const currentHostIds = streams
      .map((stream) => stream.streamId)
      .filter((streamId) => streamId !== SCREEN_SHARE);
    getUserDetails({ ids: currentHostIds, channelId, eventId, token }).then((response) =>
      setHosts(response)
    );
  }, [streams]);

  const promoteUserToHost = (peerId) => {
    const isYourself = peerId === userId;
    const promoteYourselfToHost = ({ mainscreen }) => {
      if (!mainscreen) {
        rtc.setMainScreen(userId);
        rtm.sendChannelMessage(userId, MAIN_SCREEN_UPDATED);
      }
      rtc.publishAndStartStream({ uid: userId, role: SUPERHOST });
    };

    if (isYourself) getMainScreen({ callback: promoteYourselfToHost, token, channelId, eventId });
    else rtm.sendPeerMessage({ to: peerId, from: userId, subject: HOST_INVITE });
  };

  const promoteHostOnStage = (hostId) => {
    rtc.setMainScreen(hostId);
    rtm.sendChannelMessage(hostId, MAIN_SCREEN_UPDATED);
  };

  const degradeMainToHost = () => {
    rtc.setMainScreen(null);
    rtm.sendChannelMessage(NO_MAIN_SCREEN, MAIN_SCREEN_UPDATED);
  };

  const removeHost = (hostId) => {
    rtm.removeHost(hostId);
    if (currentMainId === hostId) {
      rtc.setMainScreen(null);
      rtm.sendChannelMessage(NO_MAIN_SCREEN, MAIN_SCREEN_UPDATED);
    }
  };

  const getMembers = () => {
    rtm.getMembers().then((members) => {
      getUserDetails({ ids: members, channelId, eventId, token }).then((response) =>
        setUsersInList(response)
      );
    });
  };

  const toggleList = () => {
    rtm.subscribeChannelEvents(getMembers);
    getMembers();
    setShow((prevShow) => !prevShow);
  };

  const onChange = (e) => {
    setSearchValue(e.target.value.toLowerCase());
  };

  const showAudience = showUsersWithRole === AUDIENCE;
  const showHosts = showUsersWithRole === HOST;

  const inSearchResults = (user) => user.includes(searchValue) || searchValue === '';

  return (
    <UserListContainer>
      <Wrapper>
        <MenuToggle isActive type="button" onClick={toggleList}>
          {show ? CloseIcon : MenuIcon}
        </MenuToggle>
        {show && (
          <Content>
            <ListTypeContainer>
              <ListType
                isActive={showAudience}
                onClick={() => {
                  setShowUsersWithRole(AUDIENCE);
                }}
              >
                Zuschauer
              </ListType>
              <ListType isActive={showHosts} onClick={() => setShowUsersWithRole(HOST)}>
                Teilnehmer
              </ListType>
            </ListTypeContainer>
            <UserSearchInput type="text" placeholder="Suchen..." onChange={onChange} />
            {showAudience &&
              usersInList &&
              usersInList.map((user, index) => {
                const { name, id } = user;
                const isYourself = id === userId;
                const isAudience = !hosts || (hosts && !hosts.some((host) => host.id === id));
                if (isAudience && inSearchResults(name)) {
                  return (
                    <UserContainer index={index} key={id}>
                      <UserName>
                        {name}
                        {isYourself && ' (du)'}
                      </UserName>
                      <UserActionContainer>
                        <UserActionItem
                          className="promoteUser"
                          type="button"
                          onClick={() => promoteUserToHost(id)}
                        >
                          {PlusIcon}
                        </UserActionItem>
                      </UserActionContainer>
                    </UserContainer>
                  );
                }
              })}
            {showHosts && (
              <>
                {hosts &&
                  hosts.map((host, index) => {
                    console.log({ host });
                    const { name, id } = host;
                    const isCurrentMain = id === currentMainId;
                    const isYourself = id === userId;
                    if (inSearchResults(name)) {
                      return (
                        <UserContainer index={index} key={id}>
                          <UserName>
                            {name}
                            {isYourself && ' (du)'}
                          </UserName>
                          <UserActionContainer>
                            <UserActionItem
                              className="onStage"
                              isActive={isCurrentMain}
                              type="button"
                              onClick={() => {
                                if (isCurrentMain) degradeMainToHost();
                                else promoteHostOnStage(id);
                              }}
                            >
                              <StageIcon isActive={isCurrentMain} />
                            </UserActionItem>
                            {!isYourself && (
                              <UserActionItem
                                className="removeHost"
                                type="button"
                                onClick={() => removeHost(id)}
                              >
                                {MinusIcon}
                              </UserActionItem>
                            )}
                          </UserActionContainer>
                        </UserContainer>
                      );
                    }
                  })}
                {!!referentRequests.length && (
                  <>
                    <h2 className="RequestsHeadline">Referent-Anfragen</h2>
                    {referentRequests.map((user, index) => {
                      const { name, id } = user;
                      return (
                        <UserContainer index={index} key={id}>
                          <UserName>{name}</UserName>
                          <UserActionContainer>
                            <UserActionItem
                              className="acceptRequest"
                              type="button"
                              onClick={() => {
                                const newRefs = referentRequests.filter(
                                  (referent) => referent !== user
                                );
                                setReferentRequests(newRefs);
                                rtm.sendPeerMessage({
                                  to: id,
                                  from: userId,
                                  subject: HOST_REQUEST_ACCEPTED,
                                });
                              }}
                            >
                              {PlusIcon}
                            </UserActionItem>
                            <UserActionItem
                              className="declineRequest"
                              type="button"
                              onClick={() => {
                                const newRefs = referentRequests.filter(
                                  (referent) => referent !== user
                                );
                                setReferentRequests(newRefs);
                                rtm.sendPeerMessage({
                                  to: id,
                                  from: userId,
                                  subject: HOST_REQUEST_DECLINED,
                                });
                              }}
                            >
                              {MinusIcon}
                            </UserActionItem>
                          </UserActionContainer>
                        </UserContainer>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </Content>
        )}
      </Wrapper>
    </UserListContainer>
  );
};

UserList.defaultProps = {
  users: [],
};

UserList.propTypes = {
  // users: PropTypes.arrayOf(
  //   PropTypes.shape({
  //     name: PropTypes.string.isRequired,
  //     role: PropTypes.string.isRequired,
  //     id: PropTypes.number.isRequired,
  //   })
  // ),
};
