import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components/macro';
import { ToastContainer, toast } from 'react-toastify';

import { Modal, Hosts, UserList, ControlMenu } from './components';

import { UserContext } from './state';
import {
  CHANNEL_NAME,
  CONTENT_MARGIN_TOP,
  MESSAGES,
  ROLES,
  STAGE,
  getCurrentMainScreen,
} from './utils';

const { HOST, MODERATOR, SUPERHOST } = ROLES;
const {
  HOST_INVITE,
  HOST_INVITE_ACCEPTED,
  HOST_INVITE_DECLINED,
  STAGE_INVITE,
  REMOVE_AS_HOST,
  CHANNEL_OPENED,
  MAIN_SCREEN_UPDATED,
} = MESSAGES;

const LayoutGrid = styled.div`
  display: flex;
  justify-content: center;
  align-items: start;
  height: 100%;
  width: 100%;
  margin-top: ${CONTENT_MARGIN_TOP};
`;

const WaitingRoomNotice = styled.h1`
  color: white;
`;

const App = ({ rtc, rtm }) => {
  // Host/Admin states
  const [users, setUsers] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [adminId, setAdminId] = useState();
  const [modalIsOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState(); // Types: host | stage | hangup

  // Common states
  const { userId, setUid } = useContext(UserContext);
  const [currentMainId, setLocalMainScreen] = useState(null);
  const [streams, setStreams] = useState([]);
  const [userRole, setRole] = useState(); // Serverseitig
  const [isWaitingRoom, setIsWaitingRoom] = useState(true); // Serverseitig

  const onMessage = (message) => {
    const msg = JSON.parse(message);
    if (!msg || !msg.subject || !msg.userId) {
      return false;
    }
    switch (msg.subject) {
      case HOST_INVITE:
        setModalType(HOST);
        setIsOpen(true);
        setAdminId(msg.userId);
        break;
      case HOST_INVITE_ACCEPTED:
        toast(`host invitation accepted from: ${msg.userId}`, {
          autoClose: 8000,
          draggable: true,
          closeOnClick: true,
        });
        break;
      case HOST_INVITE_DECLINED:
        toast(`host invitation declined from: ${msg.userId}`, {
          autoClose: 8000,
          draggable: true,
          closeOnClick: true,
        });
        break;
      case STAGE_INVITE:
        setModalType(STAGE);
        setIsOpen(true);
        setAdminId(msg.userId);
        break;
      case MAIN_SCREEN_UPDATED:
        setLocalMainScreen(msg.userId);
        break;
      case REMOVE_AS_HOST:
        rtc.removeStream(msg.userId);
        rtc.client.unpublish(rtc.localstream);
        break;
      case CHANNEL_OPENED:
        setIsWaitingRoom(false);
        break;
      default:
        break;
    }
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
    streams.map((stream) => stream.play(`video-${stream.streamId}`));
  }, [isWaitingRoom]);

  useEffect(() => {
    fetch('https://agora.service-sample.de/api/test/init/test').then((response) =>
      response.json().then((data) => {
        setUsers(data);
        getCurrentMainScreen(setLocalMainScreen);
      })
    );
  }, []);

  const rtmLogin = (uid) => {
    try {
      const rtmHandlers = {
        onMessage,
        setIsPlaying,
      };
      rtm.init(rtmHandlers);
      rtm.login(uid, null).then(() => {
        rtm.joinChannel(CHANNEL_NAME).then(() => {
          rtm.subscribeChannelEvents(() => {});
        });
      });
      rtm.subscribeClientEvents();
    } catch (err) {
      console.log('rtm login failed', err);
    }
  };

  const startRtc = ({ uid }) => {
    const rtcHandlers = {
      setLocalMainScreen,
      setIsPlaying,
      setStreams,
    };

    rtc.createClient();
    rtc.init(rtcHandlers, uid);
    rtmLogin(uid);
  };

  const openChannel = () => {
    setIsWaitingRoom(false);
    rtm.sendChannelMessage(SUPERHOST, CHANNEL_OPENED);
  };

  const hasAdminRights = userRole === SUPERHOST || userRole === MODERATOR;

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
              startRtc({ uid: currentUid });
            }}
          >
            {currentUser.role}
          </button>
        ))}
      {userId && (
        <>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            pauseOnHover
            closeButton={false}
            draggable={false}
          />
          {isPlaying && (
            <ControlMenu
              {...{
                currentMainId,
                localstream: rtc.localstream,
                rtc,
                setIsOpen,
                setIsPlaying,
                setModalType,
                userId,
              }}
            />
          )}
          <Modal
            {...{
              currentMainId,
              isOpen: modalIsOpen,
              isWaitingRoom,
              modalType,
              rtc,
              rtm,
              setIsOpen,
              setIsPlaying,
              setIsWaitingRoom,
              adminId,
            }}
          />
          {hasAdminRights && (
            <>
              {isWaitingRoom && (
                <button type="button" onClick={openChannel}>
                  Channel öffnen
                </button>
              )}
              <UserList
                {...{
                  currentMainId,
                  rtc,
                  rtm,
                  streams,
                }}
              />
            </>
          )}
          <LayoutGrid>
            {isWaitingRoom && !hasAdminRights ? (
              <WaitingRoomNotice>Das Event beginnt in Kürze.</WaitingRoomNotice>
            ) : (
              <Hosts streams={streams} currentMainId={currentMainId} />
            )}
          </LayoutGrid>
        </>
      )}
    </>
  );
};

export default App;
