import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components/macro';

import { UserContext } from '../state';

import {
  BLACK,
  CONTENT_MARGIN_TOP,
  ControlItem,
  GREEN,
  GridItemSmall,
  MESSAGES,
  MenuIcon,
  MinusIcon,
  NO_CURRENT_MAIN_ID,
  PlusIcon,
  ROLES,
  StageIcon,
  getCurrentMainScreen,
} from '../utils';

const { HOST_INVITE, STAGE_INVITE, MAIN_SCREEN_UPDATED } = MESSAGES;

const isOdd = (num) => num % 2 === 1;
const { AUDIENCE, HOST, SUPERHOST } = ROLES;

const UserListContainer = styled(GridItemSmall)`
  position: fixed;
  z-index: 1;
  top: ${CONTENT_MARGIN_TOP};
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
  height: calc(100vh - ${CONTENT_MARGIN_TOP});
  z-index: 1;
  width: 20vw;
`;

const ListTypeContainer = styled.div`
  display: flex;
  padding-top: 44px;
  padding-bottom: 25px;
  justify-content: space-around;
`;

const ListType = styled.p`
  color: ${(props) => (props.isActive ? GREEN : BLACK)};

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

const UserActionItem = styled.button`
  border: none;
  background-color: transparent;

  &:hover {
    cursor: pointer;
  }
`;

export const UserList = ({ currentMainId, rtc, rtm, streams, users }) => {
  const { userId } = useContext(UserContext);

  // showUsersWithRole types = audience | host;
  const [showUsersWithRole, setShowUsersWithRole] = useState(AUDIENCE);
  const [searchValue, setSearchValue] = useState('');
  const [usersInList, setUsersInList] = useState([]);
  const [show, setShow] = useState(false);
  const [hosts, setHosts] = useState([]);

  useEffect(() => {
    const currentHostIds = streams.map((stream) => stream.streamId);
    const hostsWithName = users.filter((user) => currentHostIds.includes(user.id.toString()));
    setHosts(hostsWithName);
  }, [streams]);

  const promoteUserToHost = (peerId) => {
    const isYourself = peerId === userId;
    const promoteYourselfToHost = (currentMainScreen) => {
      if (currentMainScreen === NO_CURRENT_MAIN_ID) {
        rtc.setMainScreen(userId);
        rtm.sendChannelMessage(userId, MAIN_SCREEN_UPDATED);
      }
      rtc.publishAndStartStream(userId, SUPERHOST);
    };

    if (isYourself) getCurrentMainScreen(promoteYourselfToHost);
    else rtm.sendPeerMessage(peerId, userId, HOST_INVITE);
  };

  const promoteHostOnStage = (hostId) => {
    const isYourself = hostId === userId;
    if (isYourself) {
      rtc.setMainScreen(userId);
      rtm.sendChannelMessage(userId, MAIN_SCREEN_UPDATED);
    } else {
      rtm.sendPeerMessage(hostId, userId, STAGE_INVITE);
    }
  };

  const degradeMainToHost = () => {
    rtc.setMainScreen(NO_CURRENT_MAIN_ID);
    rtm.sendChannelMessage(NO_CURRENT_MAIN_ID, MAIN_SCREEN_UPDATED);
  };

  const removeHost = (hostId) => {
    rtm.removeHost(hostId);
    if (currentMainId === hostId) {
      rtc.setMainScreen(NO_CURRENT_MAIN_ID);
      rtm.sendChannelMessage(NO_CURRENT_MAIN_ID, MAIN_SCREEN_UPDATED);
    }
  };

  const getMembers = () => {
    rtm.getMembers().then((members) => {
      const usersWithName = users.filter((user) => members.includes(user.id.toString()));
      setUsersInList(usersWithName);
    });
  };

  const toggleList = () => {
    rtm.subscribeChannelEvents(getMembers);
    rtm.getMembers().then((members) => {
      const usersWithName = users.filter((user) => members.includes(user.id.toString()));
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
          {MenuIcon}
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
                const isAudience = !hosts.includes(user);
                if (isAudience && inSearchResults(username)) {
                  return (
                    <UserContainer index={index} key={uid}>
                      <UserName>{username}</UserName>
                      <UserActionContainer>
                        <UserActionItem type="button" onClick={() => promoteUserToHost(uid)}>
                          {PlusIcon}
                        </UserActionItem>
                      </UserActionContainer>
                    </UserContainer>
                  );
                }
              })}
            {showHosts &&
              hosts.map((host, index) => {
                const hostId = host.id.toString();
                const isCurrentMain = hostId === currentMainId;
                const isYourself = hostId === userId;
                if (inSearchResults(host.username)) {
                  return (
                    <UserContainer index={index} key={hostId}>
                      <UserName>{host.username}</UserName>
                      <UserActionContainer>
                        <UserActionItem
                          type="button"
                          onClick={() => {
                            if (isCurrentMain) degradeMainToHost();
                            else promoteHostOnStage(hostId);
                          }}
                        >
                          <StageIcon isActive={isCurrentMain} />
                        </UserActionItem>
                        {!isYourself && (
                          <UserActionItem type="button" onClick={() => removeHost(hostId)}>
                            {MinusIcon}
                          </UserActionItem>
                        )}
                      </UserActionContainer>
                    </UserContainer>
                  );
                }
              })}
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
