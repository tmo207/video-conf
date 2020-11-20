import { useContext, useState, useEffect } from 'react';
import styled from 'styled-components/macro';
// import { ToastContainer, toast } from 'react-toastify';

import { RtmModal, Hosts, UserList, ControlMenu, ChangeInput } from './components';

import { UserContext } from './state';

import { MESSAGES, ROLES, SCREEN_CLIENT, SCREEN_SHARE, global } from './utils/constants';
import { VideoIcon } from './utils/icons';
import {
  getIsWaitingRoom,
  getSuperhostId,
  initUser,
  setIsWaitingRoom,
  setMainScreen,
} from './utils/requests';
import { CONTENT_MARGIN } from './utils/styles';

const { AUDIENCE, HOST, SUPERHOST } = ROLES;
const { CHANNEL_OPENED } = MESSAGES;

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
  const { userId, setUid } = useContext(UserContext);
  // Host/Admin states
  const [adminId, setAdminId] = useState();
  const [rtmLoggedIn, setRtmLoggedIn] = useState(false);

  // Common states
  const [currentMainId, setLocalMainScreen] = useState(null);
  const [streams, setStreams] = useState([]);
  const [userRole, setRole] = useState();
  const [isWaitingRoom, setLocalWaitingRoom] = useState(true);

  const { appId, channelId, eventId, token } = global;
  const hasAdminRights = adminId === userId;
  const isHost = userRole === SUPERHOST || userRole === HOST;

  const rtmLogin = (uid) => {
    try {
      const rtmHandlers = {
        setLocalMainScreen,
        setLocalWaitingRoom,
        setRtmLoggedIn,
        setRole,
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
      setLocalMainScreen,
      setRole,
      setStreams,
    };

    rtc.createClient();
    if (!currentMainId && role === SUPERHOST)
      setMainScreen({ mainscreen: uid, token, channelId, eventId }).then(() =>
        setLocalMainScreen(uid)
      );
    rtc.init(rtcHandlers, () => rtc.join(uid, role));
    if (role === SUPERHOST) rtc.setIsSuperhost(true);

    // Create screen share client
    rtc.createClient(SCREEN_CLIENT);
    rtc[SCREEN_CLIENT].init(appId, () =>
      rtc[SCREEN_CLIENT].join(rtc.rtcToken, channelId, SCREEN_SHARE)
    );
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

    getSuperhostId({ callback: setAdminId, token, channelId, eventId }).then(({ superhost }) =>
      setAdminId(superhost)
    );
    // initUser({ token, callback: setSessionData, channelId, eventId });

    // Mocking to choose user role during development
    //
    const mockUser = (role) => {
      const roles = {
        s: {
          user: {
            role: SUPERHOST,
            id: '13',
          },
          waitingroom: true,
          mainscreen: getSuperhostId({ token, channelId, eventId }),
          rtcToken: null,
        },
        a: {
          user: {
            role: AUDIENCE,
            id: '99',
          },
          waitingroom: true,
          mainscreen: getSuperhostId({ token, channelId, eventId }),
          rtcToken: null,
        },
        r: {
          user: {
            role: HOST,
            id: '107',
          },
          waitingroom: true,
          mainscreen: getSuperhostId({ token, channelId, eventId }),
          rtcToken: null,
        },
      };
      return roles[role];
    };
    if (!userRole) setSessionData(mockUser(window.prompt()));
  }, []);

  // useEffect(() => {
  //   if (!isHost && isWaitingRoom) streams.map((stream) => stream.stop());
  // }, [isWaitingRoom]);

  useEffect(() => {
    const isAudience = userRole === AUDIENCE;
    if (isAudience && currentMainId === userId) setLocalMainScreen(null);
    if (isAudience) {
      rtc.removeStream(userId);
      rtc.unpublishAll();
      getIsWaitingRoom({ callback: setLocalWaitingRoom, channelId, eventId, token });
    }
  }, [userRole]);

  const toggleChannelOpen = () => {
    setIsWaitingRoom({ waitingroom: !isWaitingRoom, channelId, eventId, token }).then(() => {
      setLocalWaitingRoom((waitingroom) => !waitingroom);
      rtm.sendChannelMessage(SUPERHOST, CHANNEL_OPENED);
    });
  };

  const acceptHostInvitation = () => {
    setRole(HOST);
    rtc.publishAndStartStream({ uid: userId, role: HOST });
    if (isWaitingRoom) setLocalWaitingRoom(false);
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
          {isHost && <ChangeInput {...{ role: userRole, rtc }} />}
          <ControlMenu
            {...{
              adminId,
              currentMainId,
              isWaitingRoom,
              rtc,
              rtm,
              toggleChannelOpen,
              userRole,
            }}
          />
          <RtmModal
            {...{
              icon: VideoIcon,
              headline: 'Konferenz beitreten?',
              text:
                'Der Host dieser Konferenz hat dich dazu eingeladen der Konferenz beizutreten. Hierfür werden Mikrofon und deine Kamera aktiviert. Möchtest du beitreten?',
              onAccept: acceptHostInvitation,
              rtm,
            }}
          />
          {hasAdminRights && rtmLoggedIn && (
            <UserList
              {...{
                currentMainId,
                rtc,
                rtm,
                streams,
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
