import { useEffect, useState } from 'react';
import styled from 'styled-components';
import ReactModal from 'react-modal';
import AgoraRTC from 'agora-rtc-sdk';

import { modalStyle } from '../utils/styles';

const Container = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 5rem;
  width: fit-content;
  z-index: 100;
`;

const ChooseCameraButton = styled.button`
  padding: 0.5rem 1rem;
  cursor: pointer;
`;

const OptionButton = styled.button`
  cursor: pointer;
`;

export const ChangeInput = ({ rtc }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [mics, setMics] = useState([]);

  useEffect(() => {
    AgoraRTC.getDevices((devices) => {
      setCameras(devices.filter((device) => device.kind === 'videoinput'));
      setMics(devices.filter((device) => device.kind === 'audioinput'));
    });
  }, []);

  const onClick = (id, type) => {
    setIsOpen(false);
    rtc.localstream.switchDevice(type, id);
  };

  return (
    <Container>
      <ChooseCameraButton type="button" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? 'Kamera/Mikrofon auswählen' : 'Kamera/Mikrofon wechseln'}
      </ChooseCameraButton>
      <ReactModal
        isOpen={isOpen}
        style={modalStyle}
        contentLabel="Call-to-Action Modal"
        ariaHideApp={false}
      >
        <h2>Kamera auswählen</h2>
        {cameras.map((cam) => (
          <OptionButton
            type="button"
            key={cam.deviceId}
            onClick={() => onClick(cam.deviceId, 'video')}
          >
            {cam.label}
          </OptionButton>
        ))}
        <h2>Mikrofon auswählen</h2>
        {mics.map((mic) => (
          <OptionButton
            type="button"
            key={mic.deviceId}
            onClick={() => onClick(mic.deviceId, 'audio')}
          >
            {mic.label}
          </OptionButton>
        ))}
      </ReactModal>
    </Container>
  );
};
