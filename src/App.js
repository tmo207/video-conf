import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components/macro';
import { ToastContainer, toast } from 'react-toastify';

import { Modal, Hosts, UserList, ControlMenu } from './components';

import { UserContext } from './state';
import {
  CHANNEL_NAME,
  CONTENT_MARGIN,
  HexagonIcon,
  MESSAGES,
  ROLES,
  STAGE,
  USER_TOKEN,
  getIsWaitingRoom,
  getMainScreen,
  initUser,
  moveToMain,
  setIsWaitingRoom,
  setMainScreen,
} from './utils';

const { AUDIENCE, HOST, SUPERHOST } = ROLES;
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
  margin: ${CONTENT_MARGIN} 0;
`;

const WaitingRoomNotice = styled.h1`
  color: white;
`;

const OpenChannel = styled.button.attrs((props) => ({
  className: props.isActive ? 'active' : '',
}))`
  padding: 1rem;
  display: flex;
  align-items: center;
`;

const OpenChannelText = styled.p`
  margin-left: 0.5rem;
`;

const App = ({ rtc, rtm }) => {
  // Host/Admin states
  const [users, setUsers] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [adminId, setAdminId] = useState();
  const [modalIsOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState(); // Types: host | stage | hangup
  const [rtmLoggedIn, setRtmLoggedIn] = useState(false);
  const [rtcLoggedIn, setRtcLoggedIn] = useState(false);

  // Common states
  const { userId, setUid } = useContext(UserContext);
  const [currentMainId, setLocalMainScreen] = useState(null);
  const [streams, setStreams] = useState([]);
  const [userRole, setRole] = useState(); // Serverseitig
  const [isWaitingRoom, setLocalWaitingRoom] = useState(true); // Serverseitig

  const hasAdminRights = userRole === SUPERHOST;
  const isHost = userRole === SUPERHOST || userRole === HOST;

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
        setLocalWaitingRoom((waitingroom) => !waitingroom);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    moveToMain(currentMainId);
  }, [currentMainId]);

  useEffect(() => {
    if (!isHost) {
      if (!isWaitingRoom) streams.map((stream) => stream.play(`video-${stream.streamId}`));
      else streams.map((stream) => stream.stop());
    }
  }, [isWaitingRoom]);

  useEffect(() => {
    fetch('https://agora.service-sample.de/api/test/init/test').then((response) =>
      response.json().then((data) => {
        setUsers(data);
        initUser(USER_TOKEN);
        getMainScreen({ token: USER_TOKEN, callback: setLocalMainScreen });
        getIsWaitingRoom({ token: USER_TOKEN, callback: setLocalWaitingRoom });
        rtc.setUserToken(USER_TOKEN);
      })
    );
  }, []);

  const rtmLogin = (uid) => {
    try {
      const rtmHandlers = {
        onMessage,
        setIsPlaying,
        setRtmLoggedIn,
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

  const startRtc = ({ uid, role }) => {
    const rtcHandlers = {
      setIsPlaying,
      setLocalMainScreen,
      setRole,
      setRtcLoggedIn,
      setStreams,
    };

    rtc.createClient();
    if (!currentMainId && role === SUPERHOST)
      setMainScreen(uid).then(() => setLocalMainScreen(uid));
    rtc.init(rtcHandlers, () => rtc.join(uid));
    rtmLogin(uid);
  };

  useEffect(() => {
    if (isHost) rtc.publishAndStartStream(userId, userRole);
  }, [rtcLoggedIn]);

  useEffect(() => {
    if (userRole === AUDIENCE && currentMainId === userId) setLocalMainScreen(null);
  }, [userRole]);

  const toggleChannelOpen = () => {
    setIsWaitingRoom(!isWaitingRoom).then(() => {
      setLocalWaitingRoom((waitingroom) => !waitingroom);
      rtm.sendChannelMessage(SUPERHOST, CHANNEL_OPENED);
    });
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
              startRtc({ uid: currentUid, role: currentUser.role });
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
              adminId,
              currentMainId,
              isOpen: modalIsOpen,
              isWaitingRoom,
              modalType,
              rtc,
              rtm,
              setIsOpen,
              setIsPlaying,
              setLocalWaitingRoom,
              setRole,
            }}
          />
          {hasAdminRights && (
            <>
              {rtmLoggedIn && (
                <>
                  <OpenChannel isActive={!isWaitingRoom} type="button" onClick={toggleChannelOpen}>
                    {HexagonIcon}
                    <OpenChannelText>
                      {isWaitingRoom ? 'Channel öffnen' : 'Channel schließen'}
                    </OpenChannelText>
                  </OpenChannel>
                  <UserList
                    {...{
                      currentMainId,
                      rtc,
                      rtm,
                      streams,
                      users,
                    }}
                  />
                </>
              )}
            </>
          )}
          <LayoutGrid>
            {isWaitingRoom && !isHost ? (
              <WaitingRoomNotice>Das Event beginnt in Kürze.</WaitingRoomNotice>
            ) : (
              <Hosts {...{ streams, users, currentMainId }} />
            )}
          </LayoutGrid>
        </>
      )}
    </>
  );
};

export default App;
