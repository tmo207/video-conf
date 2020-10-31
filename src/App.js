import React, { useState, useEffect } from 'react';
import styled from 'styled-components/macro';
import { ToastContainer, toast } from 'react-toastify';
import Modal from 'react-modal';

import { Hosts, UserList, ControlMenu } from './components';

import { channelName, roles } from './constants';

const { audience, host, moderator, superhost } = roles;

const LayoutGrid = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const ModalButton = styled.button`
  background-color: ${(props) => (props.accept ? 'green' : 'darkred')};
  border: none;
  border-radius: 20px;
  color: white;
  padding: 8px 30px;
  margin: 0 8px;
`;

const modalStyle = {
  content: {
    color: 'black',
    textAlign: 'center',
    maxWidth: '90vw',
    width: '300px',
    height: 'fit-content',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '20px',
  },
};

const App = ({ rtc, rtm }) => {
  const [userId, setUid] = useState();
  const [users, setUsers] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [superhostId, setSuperhostId] = useState();
  const [currentMainId, setMainScreenId] = useState();
  const [streams, setStreams] = useState([]);
  const [userRole, setRole] = useState();
  // Types: host | stage
  const [invitationType, setInvitationType] = useState();

  const onMessage = (message) => {
    const msg = JSON.parse(message);
    if (!msg || !msg.subject || !msg.issuer) {
      return false;
    }
    switch (msg.subject) {
      case 'host-invitation':
        setInvitationType(host);
        setIsOpen(true);
        setSuperhostId(msg.issuer);
        break;
      case 'host-invitation-accepted':
        toast(`host invitation accepted from: ${msg.issuer}`, {
          autoClose: 8000,
          draggable: true,
          closeOnClick: true,
        });
        break;
      case 'host-invitation-declined':
        toast(`host invitation declined from: ${msg.issuer}`, {
          autoClose: 8000,
          draggable: true,
          closeOnClick: true,
        });
        break;
      case 'stage-invitation-accepted':
        setMainScreenId(msg.issuer);
        break;
      default:
        break;
    }
  };

  const acceptHostInvitation = () => {
    rtm.acceptHostInvitation(userId, superhostId);
    rtc.client.setClientRole(host, (error) => {
      if (!error) {
        rtc.publishAndStartStream(userId, host);
      } else {
        console.log('setHost error', error);
      }
    });
  };

  const acceptStageInvitation = () => {
    rtm.acceptStageInvitation(userId, currentMainId);
    setMainScreenId(userId);
  };

  useEffect(() => {
    const video = document.getElementById(`video-${currentMainId}`);
    if (video) {
      video.style.maxWidth = '100%';
      video.style.width = '100%';
      video.style.order = 1;
    }
  }, [currentMainId]);

  useEffect(() => {
    fetch('https://agora.service-sample.de/api/test/init/test').then((response) =>
      response.json().then((data) => {
        setUsers(data);
        const currentMainScreen = data[0].currentMainScreen.toString();
        setMainScreenId(currentMainScreen);
      })
    );

    return () => {
      // rtc.removeStream(rtc.localstream);
      rtm.leaveChannel();
    };
  }, []);

  const rtmLogin = (uid) => {
    try {
      const rtmHandlers = {
        onMessage,
        setIsPlaying,
      };
      rtm.init(rtmHandlers);
      rtm.login(uid, null).then(() => {
        rtm.setLoggedIn(true);
        rtm.joinChannel(channelName);
      });
      rtm.subscribeClientEvents();
    } catch (err) {
      console.log('rtm login failed', err);
    }
  };

  const startRtc = ({ uid, role }) => {
    const rtcHandlers = {
      setMainScreenId,
      setIsPlaying,
      setStreams,
    };
    rtc.createClient();
    rtc.initClient(uid, role, rtcHandlers);
    rtmLogin(uid);
  };

  useEffect(() => {
    console.log({ invitationType });
  }, [invitationType]);

  const hasAdminRights = userRole === superhost || userRole === moderator;
  const isHostInvitation = invitationType === host;
  const isStageInvitation = invitationType === 'stage';

  return (
    <>
      {users.length &&
        !userId &&
        users.map((currentUser) => (
          <button
            key={currentUser.id}
            style={{ width: '100%', height: 150, margin: '300 40', fontSize: 40 }}
            type="button"
            onClick={() => {
              const currentUid = currentUser.id.toString();
              setUid(currentUid);
              setRole(currentUser.role);
              startRtc({ role: currentUser.role, uid: currentUid });
              if (currentUser.role === superhost) {
                setMainScreenId(currentUid);
              }
            }}
          >
            {currentUser.role}
          </button>
        ))}
      {userId && (
        <>
          <ToastContainer autoClose closeButton={false} draggable={false} closeOnClick={false} />
          {isPlaying && (
            <ControlMenu
              localstream={rtc.localstream}
              rtc={rtc}
              setIsPlaying={setIsPlaying}
              userId={userId}
              role={userRole}
            />
          )}
          <Modal
            isOpen={modalIsOpen}
            onAfterOpen={() => console.log('after open')}
            onRequestClose={() => console.log('request close')}
            style={modalStyle}
            contentLabel="Example Modal"
            ariaHideApp={false}
          >
            <h1>{isHostInvitation ? 'Konferenz beitreten?' : 'Bühne betreten?'}</h1>
            <p>
              {isHostInvitation
                ? 'Der Host dieser Konferenz hat dich dazu eingeladen der Konferenz beizutreten. Hierfür werden Mikrofon und deine Kamera aktiviert. Möchtest du beitreten?'
                : 'Der Host dieser Konferenz hat dich dazu eingeladen die Bühne zu betreten. Möchtest du das?'}
            </p>
            <ButtonContainer>
              <ModalButton
                accept
                type="button"
                onClick={() => {
                  if (isHostInvitation) acceptHostInvitation();
                  if (isStageInvitation) acceptStageInvitation();
                  setIsOpen(false);
                }}
              >
                Beitreten
              </ModalButton>
              <ModalButton
                type="button"
                onClick={() => {
                  rtm.declineHostInvitation(userId, superhostId);
                  setIsOpen(false);
                }}
              >
                Ablehnen
              </ModalButton>
            </ButtonContainer>
          </Modal>
          <LayoutGrid>
            {hasAdminRights && <UserList rtm={rtm} uid={userId} streams={streams} />}
            <Hosts streams={streams} currentMainId={currentMainId} />
            {hasAdminRights && <div style={{ width: '20%' }} />}
          </LayoutGrid>
        </>
      )}
    </>
  );
};

export default App;
