import { useState } from 'react';
import ReactModal from 'react-modal';
import styled from 'styled-components/macro';

import { HangUpIcon } from '../utils/icons';
import { ControlItem, GREEN, RED, modalStyle } from '../utils/styles';

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const ModalButton = styled.button.attrs((props) => ({
  className: props.accept ? 'accept' : 'decline',
}))`
  background-color: ${(props) => (props.accept ? GREEN : RED)};
  border: none;
  border-radius: 20px;
  color: white;
  padding: 8px 30px;
  margin: 0 8px;

  &:hover {
    cursor: pointer;
  }
`;

const ModalIcon = styled(ControlItem).attrs((props) => ({
  className: props.isActive ? 'active' : '',
}))`
  margin: 0 auto;
`;

export const Modal = ({ icon, headline, text, onAccept, onDecline, isOpen, setIsOpen }) => {
  return (
    <ReactModal
      isOpen={isOpen}
      style={modalStyle}
      contentLabel="Call-to-Action Modal"
      ariaHideApp={false}
    >
      {icon && (
        <ModalIcon red={icon === HangUpIcon} isActive>
          {icon}
        </ModalIcon>
      )}
      {headline && <h1>{headline}</h1>}
      {text && <p>{text}</p>}
      <ButtonContainer>
        <ModalButton
          type="button"
          onClick={() => {
            if (onDecline) onDecline();
            setIsOpen(false);
          }}
        >
          Ablehnen
        </ModalButton>
        <ModalButton
          accept
          type="button"
          onClick={() => {
            onAccept();
            setIsOpen(false);
          }}
        >
          Akzeptieren
        </ModalButton>
      </ButtonContainer>
    </ReactModal>
  );
};
