import { useState, useEffect } from 'react';
import styled from 'styled-components/macro';
import { ToastContainer, toast } from 'react-toastify';

import { Modal, Hosts, UserList, ControlMenu } from './components';

import { CHANNEL_NAME, ROLES, CONTENT_MARGIN_TOP, STAGE, MESSAGES } from './utils';

const { AUDIENCE, HOST, MODERATOR, SUPERHOST } = ROLES;
const {
  HOST_INVITE,
  HOST_INVITE_ACCEPTED,
  HOST_INVITE_DECLINED,
  STAGE_INVITE,
  STAGE_INVITE_ACCEPTED,
  REMOVE_AS_HOST,
  CHANNEL_OPENED,
  MAIN_SCREEN_HOST_REMOVED,
} = MESSAGES;

const LayoutGrid = styled.div`
  display: flex;
  justify-content: center;
  align-items: start;
  height: 100%;
  width: 100%;
  margin-top: ${CONTENT_MARGIN_TOP};
`;

const App = ({ rtc, rtm }) => {
  const [userId, setUid] = useState();
  const [users, setUsers] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [superhostId, setSuperhostId] = useState();
  const [currentMainId, setMainScreenId] = useState(); // Serverseitig
  const [streams, setStreams] = useState([]);
  const [userRole, setRole] = useState();
  const [isWaitingRoom, setIsWaitingRoom] = useState(true); // Serverseitig
  // Types: host | stage | hangup
  const [modalType, setModalType] = useState();

  const onMessage = (message) => {
    const msg = JSON.parse(message);
    if (!msg || !msg.subject || !(msg.issuer || msg.receiver)) {
      return false;
    }
    switch (msg.subject) {
      case HOST_INVITE:
        setModalType(HOST);
        setIsOpen(true);
        setSuperhostId(msg.issuer);
        break;
      case HOST_INVITE_ACCEPTED:
        toast(`host invitation accepted from: ${msg.issuer}`, {
          autoClose: 8000,
          draggable: true,
          closeOnClick: true,
        });
        break;
      case HOST_INVITE_DECLINED:
        toast(`host invitation declined from: ${msg.issuer}`, {
          autoClose: 8000,
          draggable: true,
          closeOnClick: true,
        });
        break;
      case STAGE_INVITE:
        setModalType(STAGE);
        setIsOpen(true);
        setSuperhostId(msg.issuer);
        break;
      case STAGE_INVITE_ACCEPTED:
        setMainScreenId(msg.issuer);
        break;
      case REMOVE_AS_HOST:
        rtc.client.setClientRole(AUDIENCE, (error) => {
          if (!error) {
            rtc.removeStream(msg.issuer);
            rtc.client.unpublish(rtc.localstream);
            console.log({ receiver: msg.receiver, currentMainId }, msg.receiver === currentMainId);
            if (msg.receiver === currentMainId) {
              console.log('inside');
              setMainScreenId(null);
              rtm.sendChannelMessage(rtm.generateMainScreenHostRemovedMessage(msg.receiver));
            }
            console.log('remove host success');
          } else {
            console.log('removeHost error', error);
          }
        });
        break;
      case MAIN_SCREEN_HOST_REMOVED:
        console.log('main screen host removed');
        setMainScreenId(null);
        break;
      case CHANNEL_OPENED:
        setIsWaitingRoom(false);
        rtc.join(userId, userRole);
        break;
      default:
        break;
    }
  };

  // const acceptHostInvitation = () => {
  //   rtm.acceptHostInvitation(userId, superhostId);
  //   rtc.client.setClientRole(host, (error) => {
  //     if (!error) {
  //       rtc.publishAndStartStream(userId, host);
  //     } else {
  //       console.log('setHost error', error);
  //     }
  //   });
  // };

  // const acceptStageInvitation = () => {
  //   setMainScreenId(userId);
  //   rtm.acceptStageInvitation(userId, currentMainId);
  // };

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
      rtc.removeStream(rtc.localstream);
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
      setMainScreenId,
      setIsPlaying,
      setStreams,
    };

    const onInitSuccess = () => {
      if (!isWaitingRoom || role === SUPERHOST) rtc.join(uid, role);
    };

    rtc.createClient();
    rtc.init(rtcHandlers, onInitSuccess);

    rtmLogin(uid);
  };

  const openChannel = () => {
    setIsWaitingRoom(false);
    rtm.openChannel();
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
              startRtc({ role: currentUser.role, uid: currentUid });
              if (currentUser.role === SUPERHOST) {
                setMainScreenId(currentUid);
              }
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
                role: userRole,
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
              setMainScreenId,
              superhostId,
              userId,
            }}
          />
          {hasAdminRights && (
            <>
              <button type="button" onClick={openChannel}>
                Channel öffnen
              </button>
              <UserList
                currentMainId={currentMainId}
                setMainScreenId={setMainScreenId}
                rtm={rtm}
                uid={userId}
                streams={streams}
              />
            </>
          )}
          <LayoutGrid>
            <Hosts streams={streams} currentMainId={currentMainId} />
          </LayoutGrid>
        </>
      )}
    </>
  );
};

export default App;
