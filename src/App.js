import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components/macro';
// import { ToastContainer, toast } from 'react-toastify';

import { Modal, Hosts, UserList, ControlMenu } from './components';

import { UserContext, SessionContext } from './state';
import {
  CONTENT_MARGIN,
  MESSAGES,
  ROLES,
  initUser,
  setIsWaitingRoom,
  setMainScreen,
} from './utils';

const { AUDIENCE, HOST, SUPERHOST } = ROLES;
const {
  ASK_STAGE_ACCESS,
  HOST_INVITE,
  // HOST_INVITE_ACCEPTED,
  // HOST_INVITE_DECLINED,
  REMOVE_AS_HOST,
  CHANNEL_OPENED,
  MAIN_SCREEN_UPDATED,
  HOST_REQUEST_ACCEPTED,
  HOST_REQUEST_DECLINED,
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

const App = ({ rtc, rtm }) => {
  // Host/Admin states
  const [users, setUsers] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [adminId, setAdminId] = useState();
  const [referentRequests, setReferentRequests] = useState([]);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState(); // Types: host | stage | hangup
  const [rtmLoggedIn, setRtmLoggedIn] = useState(false);
  const [rtcLoggedIn, setRtcLoggedIn] = useState(false);

  // Common states
  const { channel_id: channelId, event_id: eventId, token } = useContext(SessionContext);
  const { userId, setUid } = useContext(UserContext);
  const [currentMainId, setLocalMainScreen] = useState(null);
  const [streams, setStreams] = useState([]);
  const [userRole, setRole] = useState(); // Serverseitig
  const [isWaitingRoom, setLocalWaitingRoom] = useState(true); // Serverseitig
  const [referentRightsRequested, setReferentRightsRequested] = useState(false);

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
      /*  case HOST_INVITE_ACCEPTED:
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
        break; */
      case HOST_REQUEST_ACCEPTED:
        if (isWaitingRoom) setLocalWaitingRoom(false);
        setRole(HOST);
        rtc.publishAndStartStream(userId, HOST);
        setReferentRightsRequested(false);
        break;
      case HOST_REQUEST_DECLINED:
        setReferentRightsRequested(false);
        break;
      case MAIN_SCREEN_UPDATED:
        setLocalMainScreen(msg.userId);
        break;
      case REMOVE_AS_HOST:
        rtc.removeStream(msg.userId);
        rtc.client.unpublish(rtc.localstream);
        setIsPlaying(false);
        break;
      case CHANNEL_OPENED:
        setLocalWaitingRoom((waitingroom) => !waitingroom);
        break;
      case ASK_STAGE_ACCESS:
        setReferentRequests((referents) => [...referents, msg.userId]);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (!isHost) {
      if (!isWaitingRoom) streams.map((stream) => stream.play(`video-${stream.streamId}`));
      else streams.map((stream) => stream.stop());
    }
  }, [isWaitingRoom]);

  useEffect(() => {
    if (isHost) rtc.publishAndStartStream(userId, userRole);
  }, [rtcLoggedIn]);

  useEffect(() => {
    if (userRole === AUDIENCE && currentMainId === userId) setLocalMainScreen(null);
  }, [userRole]);

  const rtmLogin = (uid) => {
    try {
      const rtmHandlers = {
        onMessage,
        setIsPlaying,
        setRtmLoggedIn,
      };
      rtm.init(rtmHandlers);
      rtm.login(uid).then(() => {
        rtm.joinChannel(channelId).then(() => {
          rtm.subscribeChannelEvents();
        });
      });
      rtm.subscribeClientEvents();
    } catch (err) {
      console.log('rtm login failed', err);
    }
  };

  const startRtc = async ({ uid, role }) => {
    const rtcHandlers = {
      setIsPlaying,
      setLocalMainScreen,
      setRole,
      setRtcLoggedIn,
      setStreams,
    };

    rtc.createClient();
    if (!currentMainId && role === SUPERHOST)
      setMainScreen({ mainscreen: uid, token, channelId, eventId }).then(() =>
        setLocalMainScreen(uid)
      );
    rtc.init(rtcHandlers, () => rtc.join(uid));
  };

  /* useEffect(() => {
    fetch('https://agora.service-sample.de/api/test/init/test').then((response) =>
      response.json().then((data) => {
        setUsers(data);
        initUser(USER_TOKEN);
        getMainScreen({ token: USER_TOKEN, callback: setLocalMainScreen });
        getIsWaitingRoom({ token: USER_TOKEN, callback: setLocalWaitingRoom });
        rtc.setUserToken(USER_TOKEN);
       
      })
    );
  }, []); */

  useEffect(() => {
    const setSessionData = (res) => {
      setRole(res.user.role);
      setUid(res.user.id);
      setLocalWaitingRoom(res.waitingroom);
      setLocalMainScreen(res.mainscreen);
      rtc
        .setRtcToken(res.rtcToken)
        .then(() => startRtc({ uid: res.user.id, role: res.user.role }))
        .then(() => {
          rtm.setRtmToken(null).then(() => rtmLogin(res.user.id)); // TODO use real token
        });
    };

    // setUsers(data);
    initUser({ token, callback: setSessionData, channelId, eventId });
  }, []);

  const toggleChannelOpen = () => {
    setIsWaitingRoom({ waitingroom: !isWaitingRoom, channelId, eventId, token }).then(() => {
      setLocalWaitingRoom((waitingroom) => !waitingroom);
      rtm.sendChannelMessage(SUPERHOST, CHANNEL_OPENED);
    });
  };

  const onRequestReferentRights = () => {
    setReferentRightsRequested((rights) => !rights);
    rtm.sendPeerMessage({ to: adminId, from: userId, subject: MESSAGES.ASK_STAGE_ACCESS });
  };

  return (
    <>
      {/* {users.length &&
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
        ))} */}
      {userId && (
        <>
          {/* <ToastContainer
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
          /> */}
          <ControlMenu
            {...{
              adminId,
              currentMainId,
              isPlaying,
              isWaitingRoom,
              localstream: rtc.localstream,
              onRequestReferentRights,
              referentRightsRequested,
              rtc,
              rtm,
              role: userRole,
              setIsOpen,
              setIsPlaying,
              setModalType,
              toggleChannelOpen,
            }}
          />
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
                <UserList
                  {...{
                    currentMainId,
                    referentRequests,
                    rtc,
                    rtm,
                    setReferentRequests,
                    streams,
                    users,
                  }}
                />
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
