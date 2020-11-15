import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components/macro';

import { UserContext, SessionContext } from '../state';

import {
  BLACK,
  CONTENT_MARGIN,
  CloseIcon,
  ControlItem,
  GREEN,
  GridItemSmall,
  MESSAGES,
  MenuIcon,
  MinusIcon,
  PlusIcon,
  ROLES,
  StageIcon,
  getFullUserDetails,
  getMainScreen,
} from '../utils';

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

export const UserList = ({
  currentMainId,
  referentRequests,
  rtc,
  rtm,
  setReferentRequests,
  streams,
  users,
}) => {
  const { channel_id: channelId, event_id: eventId, token } = useContext(SessionContext);
  const { userId } = useContext(UserContext);

  // showUsersWithRole types = audience | host;
  const [showUsersWithRole, setShowUsersWithRole] = useState(AUDIENCE);
  const [searchValue, setSearchValue] = useState('');
  const [usersInList, setUsersInList] = useState([]);
  const [show, setShow] = useState(false);
  const [hosts, setHosts] = useState([]);

  useEffect(() => {
    const currentHostIds = streams.map((stream) => stream.streamId);
    const hostsWithName = getFullUserDetails({ ids: currentHostIds, users });
    setHosts(hostsWithName);
  }, [streams]);

  const promoteUserToHost = (peerId) => {
    const isYourself = peerId === userId;
    const promoteYourselfToHost = (currentMainScreen) => {
      if (!currentMainScreen) {
        rtc.setMainScreen({ mainscreen: userId, channelId, eventId, token });
        rtm.sendChannelMessage(userId, MAIN_SCREEN_UPDATED);
      }
      rtc.publishAndStartStream(userId, SUPERHOST);
    };

    if (isYourself) getMainScreen({ callback: promoteYourselfToHost, token, channelId, eventId });
    else rtm.sendPeerMessage({ to: peerId, from: userId, subject: HOST_INVITE });
  };

  const promoteHostOnStage = (hostId) => {
    rtc.setMainScreen({ mainscreen: hostId, channelId, eventId, token });
    rtm.sendChannelMessage(hostId, MAIN_SCREEN_UPDATED);
  };

  const degradeMainToHost = () => {
    rtc.setMainScreen({ mainscreen: null, channelId, eventId, token });
    rtm.sendChannelMessage(NO_MAIN_SCREEN, MAIN_SCREEN_UPDATED);
  };

  const removeHost = (hostId) => {
    rtm.removeHost(hostId);
    if (currentMainId === hostId) {
      rtc.setMainScreen({ mainscreen: null, channelId, eventId, token });
      rtm.sendChannelMessage(NO_MAIN_SCREEN, MAIN_SCREEN_UPDATED);
    }
  };

  const getMembers = () => {
    rtm.getMembers().then((members) => {
      const usersWithName = getFullUserDetails({ ids: members, users });
      setUsersInList(usersWithName);
    });
  };

  const toggleList = () => {
    rtm.subscribeChannelEvents(getMembers);
    rtm.getMembers().then((members) => {
      const usersWithName = getFullUserDetails({ ids: members, users });
      setUsersInList(usersWithName);
      setShow((prevShow) => !prevShow);
    });
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
              usersInList.map((user, index) => {
                const uid = user.id.toString();
                const { username } = user;
                const isYourself = uid === userId;
                const isAudience = !hosts.includes(user);
                if (isAudience && inSearchResults(username)) {
                  return (
                    <UserContainer index={index} key={uid}>
                      <UserName>
                        {username}
                        {isYourself && ' (du)'}
                      </UserName>
                      <UserActionContainer>
                        <UserActionItem
                          className="promoteUser"
                          type="button"
                          onClick={() => promoteUserToHost(uid)}
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
                {hosts.map((host, index) => {
                  const hostId = host.id.toString();
                  const isCurrentMain = hostId === currentMainId;
                  const isYourself = hostId === userId;
                  if (inSearchResults(host.username)) {
                    return (
                      <UserContainer index={index} key={hostId}>
                        <UserName>
                          {host.username}
                          {isYourself && ' (du)'}
                        </UserName>
                        <UserActionContainer>
                          <UserActionItem
                            className="onStage"
                            isActive={isCurrentMain}
                            type="button"
                            onClick={() => {
                              if (isCurrentMain) degradeMainToHost();
                              else promoteHostOnStage(hostId);
                            }}
                          >
                            <StageIcon isActive={isCurrentMain} />
                          </UserActionItem>
                          {!isYourself && (
                            <UserActionItem
                              className="removeHost"
                              type="button"
                              onClick={() => removeHost(hostId)}
                            >
                              {MinusIcon}
                            </UserActionItem>
                          )}
                        </UserActionContainer>
                      </UserContainer>
                    );
                  }
                })}
                {!!referentRequests.length && <h2>Referent-Anfragen</h2>}
                {referentRequests.map((user, index) => {
                  const { username } = getFullUserDetails({ ids: [user], users })[0];
                  return (
                    <UserContainer index={index} key={user}>
                      <UserName>{username}</UserName>
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
                              to: user,
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
                              to: user,
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
