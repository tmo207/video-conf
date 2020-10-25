import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import AgoraRTC from 'agora-rtc-sdk';

import Rtm from './rtm';
import { Chat, Hosts, UserList, ControlMenu } from './components';

import { appId, channelName, tempToken } from './constants';

const dbUsers = [
  { name: 'Max Muster', role: 'viewer', id: 0 },
  { name: 'Jan Bsp', role: 'viewer', id: 1 },
  { name: 'Lena Lauthatnenlaaaaaaaangennamen', role: 'viewer', id: 2 },
  { name: 'Ole Some', role: 'viewer', id: 3 },
  { name: 'Alina Hallo', role: 'viewer', id: 4 },
  { name: 'Tungi Dang', role: 'viewer', id: 5 },
  { name: 'Klaus Kleber', role: 'viewer', id: 6 },
  { name: 'Günther Lange', role: 'viewer', id: 7 },
  { name: 'Anna Tafel', role: 'viewer', id: 8 },
  { name: 'Look Atme', role: 'host', id: 9 },
  { name: 'Like Talking', role: 'host', id: 10 },
  { name: 'Great Talker', role: 'host', id: 11 },
  { name: 'Important Guy', role: 'host', id: 12 },
  { name: 'One Host', role: 'host', id: 13 },
];

const LayoutGrid = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  background-color: darkgrey;
`;

const App = () => {
  const [streams, setStreams] = useState([]);
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState(Math.floor(Math.random() * 10000).toString());
  const [client, setClient] = useState(AgoraRTC.createClient({ mode: 'live', codec: 'vp8' }));
  const [localstream, setLocalstream] = useState();

  const rtm = new Rtm({ appId, channelName, uid: userId, userCallback: setUsers });

  const handleFail = (error) => console.log('Error:', error);

  const addVideoStream = (stream) => {
    setStreams((currentStreams) => [...currentStreams, stream]);
  };

  const removeStream = (uid) => {
    streams.map((stream) => {
      if (stream.getId() === uid) {
        stream.close();
      }
    });
    const updatedStreams = streams.filter((currentStream) => currentStream.getId() !== uid);
    setStreams(updatedStreams);
    console.log({ localstream, streams });
  };

  const removeStreamHandler = (event) => {
    const { stream } = event;
    const streamId = String(stream.getId());
    removeStream(streamId);
  };

  const subscribeToStreamEvents = () => {
    client.on('stream-published', (event) => {
      console.log('stream-published');
    });

    client.on('stream-added', (event) => {
      console.log('ADDED', event.stream);
      client.subscribe(event.stream, handleFail);
    });

    // Here we are receiving the remote stream
    client.on('stream-subscribed', (event) => {
      const { stream } = event;
      console.log('SUBSCRIBED', { stream });
      const streamId = stream.getId(); // Same value as uid. Turning into string because ID of DOM elements can only be strings.
      addVideoStream(stream);
      stream.play(`video-${streamId}`);
    });

    client.on('stream-removed', removeStreamHandler);

    client.on('peer-leave', removeStreamHandler);

    client.on('client-role-changed', (event) => {
      console.log('client role has changed', event);
    });

    client.on('mute-video', () => {
      console.log('successfully muted');
    });
  };

  const initStream = (uid, attendeeMode) => {
    const defaultConfig = {
      streamID: uid,
      audio: false,
      video: false,
      screen: false,
    };

    switch (attendeeMode) {
      case 'host':
      case 'superhost':
        defaultConfig.video = true;
        defaultConfig.audio = true;
        break;
      default:
      case 'attendee':
        break;
    }

    const stream = AgoraRTC.createStream(defaultConfig);

    stream.init(() => {
      addVideoStream(stream);
      stream.play(`video-${stream.streamId}`);
      client.publish(stream, handleFail);
      setLocalstream(stream);
    }, handleFail);
  };

  useEffect(() => {
    client.init(
      appId, // appId: Should be token for user authentication (https://docs.agora.io/en/Agora%20Platform/term_appid)
      () => {
        console.log('successfully initialized');
        subscribeToStreamEvents();
        client.join(
          tempToken, // tokenOrKey: Token or Channel Key
          channelName, // channelId
          userId, // User specific ID. Type: Number or string, must be the same type for all users
          (uid) => {
            rtm.init();
            console.log(`userWith id ${uid} joined the channel`);
            initStream(uid, 'attendee');
          },
          handleFail
        );
      },
      () => console.log('failed to initialize')
    );

    return () => rtm.leaveChannel();
  }, []);

  const sendMessageToPeer = (message, uid) => {
    // rtm.client.queryPeersOnlineStatus([uid]);
    rtm.sendMessageToPeer(message, uid);
  };

  return (
    <>
      {localstream && (
        <ControlMenu removeStream={removeStream} localstream={localstream} userId={userId} />
      )}
      <button type="button" onClick={() => initStream(userId, 'host')}>
        BECOME PARTICIPANT
      </button>
      <button type="button" onClick={() => removeStream(userId)}>
        STOP STREAMING
      </button>
      <LayoutGrid>
        <UserList users={users} sendMessageToPeer={sendMessageToPeer} />
        <Hosts streams={streams} />
        <Chat />
      </LayoutGrid>
    </>
  );
};

export default App;
