import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import AgoraRTC from 'agora-rtc-sdk';

import Rtm from './rtm';
import { Chat, Hosts, UserList, ControlMenu } from './components';

import { appId, channelName, roles } from './constants';

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

const { audience, host, moderator, superhost } = roles;

const App = () => {
  const [streams, setStreams] = useState([]);
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState(Math.floor(Math.random() * 10000).toString());
  const [client, setClient] = useState(AgoraRTC.createClient({ mode: 'live', codec: 'vp8' }));
  const [localstream, setLocalstream] = useState();
  const [role, setRole] = useState(audience);
  const [isPlaying, setIsPlaying] = useState(false);

  const rtm = new Rtm({ appId, channelName, uid: userId, userCallback: setUsers });

  const handleFail = (error) => console.log('Error:', error);

  const addVideoStream = (stream) => {
    setStreams((currentStreams) => [...currentStreams, stream]);
  };

  const removeStream = (uid) => {
    streams.map((item, index) => {
      if (item.getId() === uid) {
        item.close();
        const tempList = [...streams];
        tempList.splice(index, 1);
        setStreams(tempList);
      }
    });
  };

  const subscribeToStreamEvents = () => {
    client.on('stream-published', (event) => {
      console.log('stream-published');
    });

    client.on('stream-added', (event) => {
      const { stream } = event;
      console.log('ADDED', stream);
      addVideoStream(stream);
      client.subscribe(stream, handleFail);
    });

    // Here we are receiving the remote stream
    client.on('stream-subscribed', (event) => {
      const { stream } = event;
      console.log('SUBSCRIBED', { stream });
      const streamId = stream.getId(); // Same value as uid. Turning into string because ID of DOM elements can only be strings.
      stream.play(`video-${streamId}`);
    });

    client.on('stream-removed', (event) => removeStream(event.stream.getId()));

    client.on('peer-leave', (event) => removeStream(event.stream.getId()));

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
      case host:
      case superhost:
        defaultConfig.video = true;
        defaultConfig.audio = true;
        break;
      default:
      case audience:
        break;
    }

    const stream = AgoraRTC.createStream(defaultConfig);

    stream.init(() => {
      const videoWindowId = `video-${stream.streamId}`;
      addVideoStream(stream);
      stream.play(videoWindowId);
      client.publish(stream, handleFail);
      setLocalstream(stream);
      setIsPlaying(true);
    }, handleFail);
  };

  useEffect(() => {
    client.init(
      appId,
      () => {
        console.log('successfully initialized');
        subscribeToStreamEvents();
        client.join(
          null, // tokenOrKey: Token or Channel Key
          channelName, // channelId
          userId, // User specific ID. Type: Number or string, must be the same type for all users
          (uid) => {
            rtm.init();
            console.log(`userWith id ${uid} joined the channel`);
            initStream(uid);
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
      {isPlaying && (
        <ControlMenu
          localstream={localstream}
          removeStream={removeStream}
          setIsPlaying={setIsPlaying}
          userId={userId}
        />
      )}
      <span
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 200,
          backgroundColor: 'grey',
          position: 'fixed',
        }}
      >
        <button
          type="button"
          onClick={() => {
            setRole(superhost);
            initStream(userId, superhost);
          }}
        >
          BECOME SUPERHOST
        </button>
        <button
          type="button"
          onClick={() => {
            setRole(host);
            initStream(userId, host);
          }}
        >
          BECOME HOST
        </button>
        <button type="button" onClick={() => setRole(moderator)}>
          BECOME MODERATOR
        </button>
        <button type="button" onClick={() => setRole(audience)}>
          BECOME AUDIENCE
        </button>
      </span>
      <LayoutGrid>
        {(role === superhost || role === moderator) && (
          <UserList users={users} sendMessageToPeer={sendMessageToPeer} />
        )}
        <Hosts streams={streams} role={role} />
        <Chat />
      </LayoutGrid>
    </>
  );
};

export default App;
