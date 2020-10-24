import React from 'react';
import styled from 'styled-components/macro';

const ControlMenuContainer = styled.div`
  position: fixed;
  top: 0;
  left: 50%;
  width: 200px;
  height: 80px;
  background-color: grey;
  transform: translateX(-50%);
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  border-radius: 10px;
`;

const ControlItem = styled.span`
  width: 40px;
  height: 40px;
  background-color: white;
  border-radius: 20px;
`;

export const ControlMenu = () => (
  <ControlMenuContainer>
    <ControlItem />
    <ControlItem />
    <ControlItem />
    <ControlItem />
  </ControlMenuContainer>
);
