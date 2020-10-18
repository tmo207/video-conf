import React from 'react';
import styled from 'styled-components';

import { Hosts, UserList, Chat } from './components';

const LayoutGrid = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
`;

const RoleContext = React.createContext(null);

const App = () => {
  return (
    <RoleContext.Provider>
      <LayoutGrid>
        <UserList>Geiler tet ashdjkashdjkashd jks</UserList>
        <Hosts />
        <Chat>Hier auchasd asd asd as</Chat>
      </LayoutGrid>
    </RoleContext.Provider>
  );
};

export default App;
