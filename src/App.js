import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import AgoraRTC from 'agora-rtc-sdk';

import { ControlMenu, Hosts, UserList, Chat } from './components';

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

const VideoWindow = styled.div`
  height: 400px;
  width: 400px;
`;

const App = () => {
  const [streams, setStreams] = useState([]);
  const [userId, setUserId] = useState();
  // const [users, setUsers] = useState([]);
  const [client, setClient] = useState(AgoraRTC.createClient({ mode: 'live', codec: 'vp8' }));

  let localstream;

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
  };

  const streamEndHandler = (event) => {
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
      console.log({ streams });
    });

    client.on('stream-removed', streamEndHandler);

    client.on('peer-leave', streamEndHandler);
  };

  const initStream = (uid, role) => {
    const isAttendee = role === ('attendee' || 'host' || 'superhost');
    const defaultConfig = {
      streamID: uid,
      audio: /* isAttendee */ false,
      video: isAttendee,
      screen: false,
    };

    localstream = AgoraRTC.createStream(defaultConfig);

    localstream.init(() => {
      addVideoStream(localstream);
      localstream.play(`video-${localstream.streamId}`);
      client.publish(localstream, handleFail);
    }, handleFail);
  };

  useEffect(() => {
    const getUserToken = () => Math.floor(Math.random() * 10000);

    client.init(
      '6f5b7ccc9a3a448abf1ce396b3deb846', // appId: Should be token for user authentication (https://docs.agora.io/en/Agora%20Platform/term_appid)
      () => {
        console.log('successfully initialized');
        subscribeToStreamEvents();
        client.join(
          '0066f5b7ccc9a3a448abf1ce396b3deb846IACl0y2n8Zy2qKHRH7gmEjulCvrB1OWAXBRQUlbUXNAwJxcKBPEAAAAAEAAKvMYLIB2UXwEAAQAfHZRf', // tokenOrKey: Token or Channel Key
          'react-test',
          getUserToken(), // User specific ID. Type: Number or string, must be the same type for all users
          (uid) => {
            console.log(`userWith id ${uid} joined the channel`);
            setUserId(uid);
            initStream(uid);
          },
          handleFail
        );
      },
      () => console.log('failed to initialize')
    );
  }, []);

  return (
    <>
      <ControlMenu />
      <VideoWindow id="me" />
      <button type="button" onClick={() => initStream(userId, 'attendee')}>
        BECOME PARTICIPANT
      </button>
      <button type="button" onClick={() => removeStream(userId)}>
        STOP STREAMING
      </button>
      <LayoutGrid>
        <UserList users={dbUsers} />
        <Hosts streams={streams} />
        <Chat />
      </LayoutGrid>
    </>
  );
};

export default App;
