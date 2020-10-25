import React, { useState } from 'react';
import styled from 'styled-components/macro';

import { border } from './helpers/sharedStyles';

const ControlMenuContainer = styled.div`
  position: fixed;
  top: 0;
  left: 50%;
  width: 250px;
  height: 80px;
  padding: 0 10px;
  background-color: grey;
  transform: translateX(-50%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px;
`;

const ControlItem = styled.button`
  width: 60px;
  height: 60px;
  background-color: white;
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  ${(props) => (props.red ? 'border: none;' : border)}
  background-color: ${(props) => {
    let color;
    if (props.red) {
      color = 'red';
    } else {
      color = props.isActive ? 'white' : 'grey';
    }
    return color;
  }};
  &:hover {
    cursor: pointer;
  }
`;

export const ControlMenu = ({ removeStream, localstream, setIsPlaying, userId }) => {
  const [hasVideo, setHasVideo] = useState(localstream.hasVideo());
  const [hasAudio, setHasAudio] = useState(localstream.hasAudio());

  const videoHandler = () => {
    if (hasVideo) {
      localstream.muteVideo();
      setHasVideo(false);
    } else {
      localstream.enableVideo();
      setHasVideo(true);
    }
  };

  const audioHandler = () => {
    if (hasAudio) {
      localstream.muteAudio();

      setHasAudio(false);
    } else {
      localstream.enableAudio();
      setHasAudio(true);
    }
  };

  return (
    <ControlMenuContainer>
      <ControlItem
        onClick={() => {
          removeStream(userId);
          setIsPlaying(false);
        }}
        red
      >
        <svg
          width="29"
          height="26"
          viewBox="0 0 29 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.1544 19.3673L9.90691 16.2899C9.59879 15.8684 9.08222 15.7262 8.63816 15.9395L3.56316 18.377C3.07831 18.6106 2.8155 19.1946 2.93331 19.7735L4.02081 25.0548C4.1341 25.6032 4.5691 25.9993 5.08113 25.9993C9.6441 25.9993 13.8582 24.354 17.3019 21.5864L13.6769 18.4481C13.183 18.7782 12.6755 19.093 12.1544 19.3673ZM28.7207 23.2622L21.5296 17.0364C24.3752 13.0196 26.1016 7.96688 26.1016 2.4368C26.1016 1.86805 25.7527 1.37547 25.2588 1.24852L20.5463 0.0297667C20.0343 -0.102265 19.5086 0.197345 19.3002 0.735626L17.1252 6.42312C16.9349 6.92078 17.0618 7.50477 17.4378 7.845L20.1838 10.3638C19.631 11.6891 18.9196 12.918 18.0994 14.0606L2.06331 0.171954C1.74613 -0.102265 1.293 -0.0413271 1.04378 0.314142L0.155658 1.59383C-0.0890297 1.9493 -0.0346547 2.45711 0.282533 2.73133L26.9444 25.8216C27.2616 26.0958 27.7147 26.0348 27.9639 25.6794L28.8521 24.3946C29.0968 24.0493 29.0379 23.5364 28.7207 23.2622Z"
            fill="white"
          />
        </svg>
      </ControlItem>
      <ControlItem onClick={videoHandler} isActive={hasVideo}>
        <svg
          width="28"
          height="19"
          viewBox="0 0 28 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.3431 0.875H2.32361C1.04028 0.875 0 1.83633 0 3.02227V15.9777C0 17.1637 1.04028 18.125 2.32361 18.125H16.3431C17.6264 18.125 18.6667 17.1637 18.6667 15.9777V3.02227C18.6667 1.83633 17.6264 0.875 16.3431 0.875ZM25.55 2.56855L20.2222 5.96465V13.0354L25.55 16.427C26.5806 17.0828 28 16.4135 28 15.268V3.72754C28 2.58652 26.5854 1.9127 25.55 2.56855Z"
            fill="#373737"
          />
        </svg>
      </ControlItem>
      <ControlItem onClick={audioHandler} isActive={hasAudio}>
        <svg
          width="20"
          height="28"
          viewBox="0 0 20 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19.0909 10.5H18.1818C17.6795 10.5 17.2727 10.8916 17.2727 11.375V14C17.2727 18.0906 13.6085 21.373 9.2733 20.9661C5.49489 20.6112 2.72727 17.342 2.72727 13.6883V11.375C2.72727 10.8916 2.32045 10.5 1.81818 10.5H0.909091C0.406818 10.5 0 10.8916 0 11.375V13.5712C0 18.4734 3.63466 22.8435 8.63636 23.5074V25.375H5.45455C4.95227 25.375 4.54545 25.7666 4.54545 26.25V27.125C4.54545 27.6084 4.95227 28 5.45455 28H14.5455C15.0477 28 15.4545 27.6084 15.4545 27.125V26.25C15.4545 25.7666 15.0477 25.375 14.5455 25.375H11.3636V23.5282C16.2335 22.8851 20 18.8617 20 14V11.375C20 10.8916 19.5932 10.5 19.0909 10.5ZM10 19.25C13.0125 19.25 15.4545 16.8995 15.4545 14H10.6062C10.2716 14 10 13.8042 10 13.5625V12.6875C10 12.4458 10.2716 12.25 10.6062 12.25H15.4545V10.5H10.6062C10.2716 10.5 10 10.3042 10 10.0625V9.1875C10 8.94578 10.2716 8.75 10.6062 8.75H15.4545V7H10.6062C10.2716 7 10 6.80422 10 6.5625V5.6875C10 5.44578 10.2716 5.25 10.6062 5.25H15.4545C15.4545 2.35047 13.0125 0 10 0C6.9875 0 4.54545 2.35047 4.54545 5.25V14C4.54545 16.8995 6.9875 19.25 10 19.25Z"
            fill="#373737"
          />
        </svg>
      </ControlItem>
    </ControlMenuContainer>
  );
};
