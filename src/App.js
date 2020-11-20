import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components/macro';
// import { ToastContainer, toast } from 'react-toastify';

import { Modal, Hosts, UserList, ControlMenu, ChangeInput } from './components';

import { UserContext, SessionContext } from './state';
import {
  CONTENT_MARGIN,
  MESSAGES,
  ROLES,
  getIsWaitingRoom,
  getSuperhostId,
  getUserDetails,
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
  const [hosts, setHosts] = useState([]);
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

  const forceReload = () =>
    streams.map((stream) => {
      stream.stop();
      stream.play(`video-${stream.streamId}`);
    });

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
        setReferentRightsRequested(false);
        forceReload();
        rtc.publishAndStartStream(userId, HOST);
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
        getUserDetails({
          ids: [msg.userId],
          channelId,
          eventId,
          token,
          callback: (newReferentDetails) =>
            setReferentRequests((referents) => [...referents, newReferentDetails[0]]),
        });
        break;
      default:
        break;
    }
  };

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
    if (role === SUPERHOST) rtc.setIsSuperhost(true);
  };

  // Init user
  useEffect(() => {
    const setSessionData = (res) => {
      setRole(res.user.role);
      setUid(res.user.id);
      setLocalWaitingRoom(res.waitingroom);
      setLocalMainScreen(res.mainscreen);
      rtc
        .setRtcToken(null)
        .then(() =>
          startRtc({
            uid: res.user.id,
            role: res.user.role,
          })
        )
        .then(() => {
          rtm.setRtmToken(null).then(() => rtmLogin(res.user.id)); // TODO use real token
        });
    };

    getSuperhostId({ callback: setAdminId, token, channelId, eventId });
    initUser({ token, callback: setSessionData, channelId, eventId });

    // Mocking to choose user role during development
    //
    // const mockUser = (role) => {
    //   const roles = {
    //     s: {
    //       user: {
    //         role: SUPERHOST,
    //         id: '13',
    //       },
    //       waitingroom: true,
    //       mainscreen: getSuperhostId({ token, channelId, eventId }),
    //       rtcToken: null,
    //     },
    //     a: {
    //       user: {
    //         role: AUDIENCE,
    //         id: '99',
    //       },
    //       waitingroom: true,
    //       mainscreen: getSuperhostId({ token, channelId, eventId }),
    //       rtcToken: null,
    //     },
    //     r: {
    //       user: {
    //         role: HOST,
    //         id: '107',
    //       },
    //       waitingroom: true,
    //       mainscreen: getSuperhostId({ token, channelId, eventId }),
    //       rtcToken: null,
    //     },
    //   };
    //   return roles[role];
    // };
    // if (!userRole) setSessionData(mockUser(window.prompt()));
  }, []);

  useEffect(() => {
    if (!isHost && isWaitingRoom) streams.map((stream) => stream.stop());
    if (!isWaitingRoom || (isWaitingRoom && isHost)) forceReload();
  }, [isWaitingRoom]);

  useEffect(() => {
    if (!isPlaying) getIsWaitingRoom({ callback: setLocalWaitingRoom, channelId, eventId, token });
  }, [isPlaying]);

  useEffect(() => {
    const currentHostIds = streams.map((stream) => stream.streamId);
    getUserDetails({ ids: currentHostIds, channelId, eventId, token, callback: setHosts });
  }, [streams]);

  useEffect(() => {
    if (isHost) rtc.publishAndStartStream(userId, userRole);
  }, [rtcLoggedIn]);

  useEffect(() => {
    if (userRole === AUDIENCE && currentMainId === userId) setLocalMainScreen(null);
    if (userRole === AUDIENCE && !isWaitingRoom) forceReload();
  }, [userRole]);

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
          {isPlaying && <ChangeInput {...{ role: userRole, rtc }} />}
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
          {hasAdminRights && rtmLoggedIn && (
            <UserList
              {...{
                currentMainId,
                hosts,
                referentRequests,
                rtc,
                rtm,
                setReferentRequests,
              }}
            />
          )}
          <LayoutGrid>
            {isWaitingRoom && !isHost ? (
              <WaitingRoomNotice>Das Event beginnt in Kürze.</WaitingRoomNotice>
            ) : (
              <Hosts {...{ streams, currentMainId }} />
            )}
          </LayoutGrid>
        </>
      )}
    </>
  );
};

export default App;
