import React, { useState, useEffect } from 'react';
import styled from 'styled-components/macro';

import { roles } from '../constants';
import { GridItemSmall } from './helpers/sharedStyles';

const isOdd = (num) => num % 2 === 1;
const { audience, host } = roles;

const ListTypeContainer = styled.div`
  display: flex;
`;
const ListType = styled.h3``;

const UserListContainer = styled(GridItemSmall)``;

const UserContainer = styled.div`
  background-color: ${(props) => (isOdd(props.index) ? 'white' : 'grey')};
  display: flex;
  justify-content: space-between;
`;

const UserName = styled.p`
  width: 80%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserActionContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 20%;
`;

export const UserList = ({ rtm, rtc, uid, streams, currentMainId }) => {
  // State types = audience | host;
  const [showUsersWithRole, setShowUsersWithRole] = useState(audience);
  const [searchValue, setSearchValue] = useState('');
  const [usersInList, setUsersInList] = useState([]);
  const [users, setUsers] = useState([]);
  const [show, setShow] = useState(false);
  const [hosts, setHosts] = useState([]);

  useEffect(() => {
    const currentHosts = streams.map((stream) => stream.streamId);
    setHosts(currentHosts);
  }, [streams]);

  const promoteUserToHost = (peerId) => {
    rtm
      .inviteAudienceToBecomeHost({ peerId, ownId: uid })
      .then(() => {
        console.log('heyy', 'successfully sent to', peerId);
      })
      .catch((err) => {
        console.error(`Send message to peer ${peerId}`, err);
      });
  };

  const promoteHostOnStage = (peerId) => {
    rtm
      .inviteAudienceToBecomeHost({ peerId, ownId: uid })
      .then(() => {
        console.log('promote', 'successfully sent to', peerId);
      })
      .catch((err) => {
        console.error(`Send message to peer ${peerId}`, err);
      });
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

  return (
    <UserListContainer>
      <button type="button" onClick={toggleList}>
        Toggle list
      </button>
      {show && (
        <>
          <ListTypeContainer>
            <ListType
              onClick={() => {
                setShowUsersWithRole(audience);
              }}
            >
              Zuschauer
            </ListType>
            <ListType onClick={() => setShowUsersWithRole(host)}>Teilnehmer</ListType>
          </ListTypeContainer>
          <input type="text" onChange={onChange} />
          {users.map((user, index) => {
            const isAudience = !hosts.includes(user);
            const isHost = hosts.includes(user);
            if (isAudience && showUsersWithRole === audience) {
              return (
                <UserContainer index={index} key={user}>
                  <UserName>{user}</UserName>
                  <UserActionContainer>
                    <button type="button" onClick={() => promoteUserToHost(user)}>
                      +
                    </button>
                  </UserActionContainer>
                </UserContainer>
              );
            }
            if (isHost && showUsersWithRole === host) {
              return (
                <UserContainer index={index} key={user}>
                  <UserName>{user}</UserName>
                  <UserActionContainer>
                    <button type="button" onClick={() => promoteHostOnStage(user)}>
                      A
                    </button>
                  </UserActionContainer>
                </UserContainer>
              );
            }
          })}
        </>
      )}
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
