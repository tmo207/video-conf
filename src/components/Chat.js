import React from 'react';
import styled from 'styled-components';

import { GridItemSmall } from './helpers/sharedStyles';

const ChatContainer = styled(GridItemSmall)`
  text-align: right;
`;

export const Chat = () => <ChatContainer>Chat</ChatContainer>;
