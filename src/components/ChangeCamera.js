import { useEffect, useState } from 'react';
import styled from 'styled-components';
import AgoraRTC from 'agora-rtc-sdk';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 5rem 0;
  width: fit-content;
`;

const ChooseCameraButton = styled.button`
  padding: 0.5rem 1rem;
  cursor: pointer;
`;

const OptionButton = styled.button`
  cursor: pointer;
`;

export const ChangeCamera = ({ rtc }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    AgoraRTC.getDevices((devices) =>
      setCameras(devices.filter((device) => device.kind === 'videoinput'))
    );
  }, []);

  const onClick = (id) => {
    setIsOpen(false);
    rtc.localstream.switchDevice('video', id);
  };

  return (
    <Container>
      <ChooseCameraButton type="button" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? 'Kamera auswählen' : 'Kamera wechseln'}
      </ChooseCameraButton>
      {isOpen &&
        cameras.map((cam) => (
          <OptionButton type="button" key={cam.deviceId} onClick={() => onClick(cam.deviceId)}>
            {cam.label}
          </OptionButton>
        ))}
    </Container>
  );
};
