import { useState, useEffect } from 'react';
import styled from 'styled-components/macro';

import {
  BLACK,
  CONTENT_MARGIN_TOP,
  ControlItem,
  GREEN,
  GridItemSmall,
  NO_CURRENT_MAIN_ID,
  ROLES,
  StageIcon,
  getCurrentMainScreen,
  MinusIcon,
  PlusIcon,
  setCurrentMainScreen,
} from '../utils';

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

export const UserList = ({ rtc, rtm, uid, streams, currentMainId, setLocalMainScreen }) => {
  // showUsersWithRole types = audience | host;
  const [showUsersWithRole, setShowUsersWithRole] = useState(AUDIENCE);
  const [searchValue, setSearchValue] = useState('');
  const [users, setUsers] = useState([]);
  const [show, setShow] = useState(false);
  const [hosts, setHosts] = useState([]);

  useEffect(() => {
    const currentHosts = streams.map((stream) => stream.streamId);
    setHosts(currentHosts);
  }, [streams]);

  const promoteUserToHost = (peerId) => {
    const getCurrentMainScreenCb = (currentMainScreen) => {
      if (currentMainScreen) {
        rtc.publishAndStartStream(uid, HOST);
      } else {
        rtc.publishAndStartStream(uid, SUPERHOST);
        setCurrentMainScreen(uid);
        setLocalMainScreen(uid);
      }
    };

    if (peerId === uid) getCurrentMainScreen(getCurrentMainScreenCb);
    else rtm.inviteAudienceToBecomeHost({ peerId, ownId: uid });
  };

  const promoteHostOnStage = (peerId) => {
    if (peerId === uid) {
      rtm.acceptStageInvitation(uid);
      setCurrentMainScreen(uid);
      setLocalMainScreen(uid);
    } else {
      rtm.inviteHostToBecomeStage({ peerId, ownId: uid });
    }
  };

  const degradeMainToHost = () => {
    setCurrentMainScreen(NO_CURRENT_MAIN_ID);
    setLocalMainScreen(null);
    rtm.removeMain();
  };

  const removeHost = (userId) => {
    rtm.removeHost(userId);
    if (currentMainId === userId) {
      setCurrentMainScreen(NO_CURRENT_MAIN_ID);
      setLocalMainScreen(null);
    }
  };

  const getMembers = () => {
    rtm.getMembers().then((members) => {
      setUsers(members);
    });
  };

  const toggleList = () => {
    rtm.subscribeChannelEvents(getMembers);
    rtm.getMembers().then((members) => {
      setUsers(members);
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
          <svg
            width="27"
            height="21"
            viewBox="0 0 27 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.21875 15.9688H0.84375C0.619974 15.9688 0.405362 16.0511 0.247129 16.1976C0.0888949 16.3441 0 16.5428 0 16.75L0 19.875C0 20.0822 0.0888949 20.2809 0.247129 20.4274C0.405362 20.5739 0.619974 20.6562 0.84375 20.6562H4.21875C4.44253 20.6562 4.65714 20.5739 4.81537 20.4274C4.97361 20.2809 5.0625 20.0822 5.0625 19.875V16.75C5.0625 16.5428 4.97361 16.3441 4.81537 16.1976C4.65714 16.0511 4.44253 15.9688 4.21875 15.9688ZM4.21875 0.34375H0.84375C0.619974 0.34375 0.405362 0.42606 0.247129 0.572573C0.0888949 0.719086 0 0.9178 0 1.125L0 4.25C0 4.4572 0.0888949 4.65591 0.247129 4.80243C0.405362 4.94894 0.619974 5.03125 0.84375 5.03125H4.21875C4.44253 5.03125 4.65714 4.94894 4.81537 4.80243C4.97361 4.65591 5.0625 4.4572 5.0625 4.25V1.125C5.0625 0.9178 4.97361 0.719086 4.81537 0.572573C4.65714 0.42606 4.44253 0.34375 4.21875 0.34375ZM4.21875 8.15625H0.84375C0.619974 8.15625 0.405362 8.23856 0.247129 8.38507C0.0888949 8.53159 0 8.7303 0 8.9375L0 12.0625C0 12.2697 0.0888949 12.4684 0.247129 12.6149C0.405362 12.7614 0.619974 12.8438 0.84375 12.8438H4.21875C4.44253 12.8438 4.65714 12.7614 4.81537 12.6149C4.97361 12.4684 5.0625 12.2697 5.0625 12.0625V8.9375C5.0625 8.7303 4.97361 8.53159 4.81537 8.38507C4.65714 8.23856 4.44253 8.15625 4.21875 8.15625ZM26.1562 16.75H9.28125C9.05747 16.75 8.84286 16.8323 8.68463 16.9788C8.52639 17.1253 8.4375 17.324 8.4375 17.5312V19.0938C8.4375 19.301 8.52639 19.4997 8.68463 19.6462C8.84286 19.7927 9.05747 19.875 9.28125 19.875H26.1562C26.38 19.875 26.5946 19.7927 26.7529 19.6462C26.9111 19.4997 27 19.301 27 19.0938V17.5312C27 17.324 26.9111 17.1253 26.7529 16.9788C26.5946 16.8323 26.38 16.75 26.1562 16.75ZM26.1562 1.125H9.28125C9.05747 1.125 8.84286 1.20731 8.68463 1.35382C8.52639 1.50034 8.4375 1.69905 8.4375 1.90625V3.46875C8.4375 3.67595 8.52639 3.87466 8.68463 4.02118C8.84286 4.16769 9.05747 4.25 9.28125 4.25H26.1562C26.38 4.25 26.5946 4.16769 26.7529 4.02118C26.9111 3.87466 27 3.67595 27 3.46875V1.90625C27 1.69905 26.9111 1.50034 26.7529 1.35382C26.5946 1.20731 26.38 1.125 26.1562 1.125ZM26.1562 8.9375H9.28125C9.05747 8.9375 8.84286 9.01981 8.68463 9.16632C8.52639 9.31284 8.4375 9.51155 8.4375 9.71875V11.2812C8.4375 11.4885 8.52639 11.6872 8.68463 11.8337C8.84286 11.9802 9.05747 12.0625 9.28125 12.0625H26.1562C26.38 12.0625 26.5946 11.9802 26.7529 11.8337C26.9111 11.6872 27 11.4885 27 11.2812V9.71875C27 9.51155 26.9111 9.31284 26.7529 9.16632C26.5946 9.01981 26.38 8.9375 26.1562 8.9375Z"
              fill="#373737"
            />
          </svg>
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
              users.map((user, index) => {
                const isAudience = !hosts.includes(user);
                if (isAudience && inSearchResults(user)) {
                  return (
                    <UserContainer index={index} key={user}>
                      <UserName>{user}</UserName>
                      <UserActionContainer>
                        <UserActionItem type="button" onClick={() => promoteUserToHost(user)}>
                          {PlusIcon}
                        </UserActionItem>
                      </UserActionContainer>
                    </UserContainer>
                  );
                }
              })}
            {showHosts &&
              hosts.map((user, index) => {
                const isCurrentMain = user === currentMainId;
                const isYourself = user === uid;
                if (inSearchResults(user)) {
                  return (
                    <UserContainer index={index} key={user}>
                      <UserName>{user}</UserName>
                      <UserActionContainer>
                        <UserActionItem
                          type="button"
                          onClick={() => {
                            if (isCurrentMain) degradeMainToHost();
                            else promoteHostOnStage(user);
                          }}
                        >
                          <StageIcon isActive={isCurrentMain} />
                        </UserActionItem>
                        {!isYourself && (
                          <UserActionItem type="button" onClick={() => removeHost(user)}>
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
