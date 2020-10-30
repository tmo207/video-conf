import React, { useState, useEffect } from 'react';
import styled from 'styled-components/macro';
import { ToastContainer, toast } from 'react-toastify';
import Modal from 'react-modal';

import { Chat, Hosts, UserList, ControlMenu } from './components';

import { channelName, roles } from './constants';

const { audience, host, moderator, superhost } = roles;

const LayoutGrid = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
`;

const App = ({ rtc, rtm }) => {
  const [userId, setUid] = useState();
  const [users, setUsers] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [superhostId, setSuperhostId] = useState();
  const [currentMainId, setMainScreenId] = useState();
  const [streams, setStreams] = useState([]);
  const [userRole, setRole] = useState();

  const onMessage = (message) => {
    const msg = JSON.parse(message);
    if (!msg || !msg.subject || !msg.issuer) {
      return false;
    }
    switch (msg.subject) {
      case 'host-invitation':
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

    return () => rtm.leaveChannel();
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
          <h1>{userId}</h1>
          <ToastContainer autoClose closeButton={false} draggable={false} closeOnClick={false} />
          {isPlaying && (
            <ControlMenu
              localstream={rtc.localstream}
              rtc={rtc}
              setIsPlaying={setIsPlaying}
              userId={userId}
            />
          )}
          <Modal
            isOpen={modalIsOpen}
            onAfterOpen={() => console.log('after open')}
            onRequestClose={() => console.log('request close')}
            style={{}}
            contentLabel="Example Modal"
            ariaHideApp={false}
          >
            <h1>Hey</h1>
            <button
              type="button"
              onClick={() => {
                acceptHostInvitation();
                setIsOpen(false);
              }}
            >
              Accept Host
            </button>
            <button
              type="button"
              onClick={() => {
                rtm.declineHostInvitation(userId, superhostId);
                setIsOpen(false);
              }}
            >
              Decline Host
            </button>
            <button
              type="button"
              onClick={() => {
                acceptStageInvitation();
                setIsOpen(false);
              }}
            >
              Accept Stage
            </button>
            <button
              type="button"
              onClick={() => {
                rtm.declineHostInvitation(userId, superhostId);
                setIsOpen(false);
              }}
            >
              Decline Stage
            </button>
          </Modal>
          <LayoutGrid>
            {(userRole === superhost || userRole === moderator) && (
              <UserList rtm={rtm} uid={userId} streams={streams} />
            )}
            <Hosts streams={streams} currentMainId={currentMainId} />
          </LayoutGrid>
        </>
      )}
    </>
  );
};

export default App;
