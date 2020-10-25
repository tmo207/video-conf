import React, { useState } from 'react';

import styled from 'styled-components/macro';

import { GridItemSmall } from './helpers/sharedStyles';

const isOdd = (num) => num % 2 === 1;

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

export const UserList = ({ users, sendMessageToPeer }) => {
  // State types = viewer | host;
  const [showUsersWithRole, setShowUsersWithRole] = useState('viewer');
  const [searchValue, setSearchValue] = useState('');
  const [usersInList, setUsersInList] = useState(users);

  const onChange = (e) => {
    setSearchValue(e.target.value.toLowerCase());
  };

  const promoteUserToHost = (userId) => {
    sendMessageToPeer('hey', userId);
  };

  return (
    <UserListContainer>
      <ListTypeContainer>
        <ListType
          onClick={() => {
            console.log({ users });
            setShowUsersWithRole('viewer');
          }}
        >
          Zuschauer
        </ListType>
        <ListType onClick={() => setShowUsersWithRole('host')}>Teilnehmer</ListType>
      </ListTypeContainer>
      <input type="text" onChange={onChange} />
      {/* {usersInList.map(
        (user, index) =>
          user.role === showUsersWithRole && (
            <UserContainer index={index} key={user.id}>
              <UserName>{user.name}</UserName>
              <UserActionContainer>
                {showUsersWithRole === 'viewer' && (
                  <button type="button" onClick={() => promoteUserToHost(user.id)}>
                    +
                  </button>
                )}
                {showUsersWithRole === 'host' && (
                  <>
                    <button type="button">A</button>
                    <button type="button">-</button>
                  </>
                )}
              </UserActionContainer>
            </UserContainer>
          )
      )} */}
      {users.map((user, index) => (
        <UserContainer index={index} key={user}>
          <UserName>{user}</UserName>
          <UserActionContainer>
            <button type="button" onClick={() => promoteUserToHost(user)}>
              +
            </button>
          </UserActionContainer>
        </UserContainer>
      ))}
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
