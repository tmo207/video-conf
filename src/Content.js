import React, { useState, useEffect } from 'react';
import styled from 'styled-components/macro';

import Modal from 'react-modal';

import { Chat, Hosts, UserList, Form } from './components';

import { appId, channelName, roles } from './constants';

// const dbUsers = [
//   { name: 'Max Muster', role: 'viewer', id: 0 },
//   { name: 'Jan Bsp', role: 'viewer', id: 1 },
//   { name: 'Lena Lauthatnenlaaaaaaaangennamen', role: 'viewer', id: 2 },
//   { name: 'Ole Some', role: 'viewer', id: 3 },
//   { name: 'Alina Hallo', role: 'viewer', id: 4 },
//   { name: 'Tungi Dang', role: 'viewer', id: 5 },
//   { name: 'Klaus Kleber', role: 'viewer', id: 6 },
//   { name: 'Günther Lange', role: 'viewer', id: 7 },
//   { name: 'Anna Tafel', role: 'viewer', id: 8 },
//   { name: 'Look Atme', role: 'host', id: 9 },
//   { name: 'Like Talking', role: 'host', id: 10 },
//   { name: 'Great Talker', role: 'host', id: 11 },
//   { name: 'Important Guy', role: 'host', id: 12 },
//   { name: 'One Host', role: 'host', id: 13 },
// ];

const LayoutGrid = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  background-color: darkgrey;
`;

const { audience, host, moderator, superhost } = roles;

const Content = ({ rtc, rtm }) => {
  const [streams, setStreams] = useState([]);
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState(333);
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [role, setRole] = useState(audience);
  const [isPlaying, setIsPlaying] = useState(false);
  const [superhostId, setSuperhostId] = useState();

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

  const sendMessageToPeer = (peerId) => {
    if (!rtm.loggedIn) {
      console.error('Please Login First');
      return;
    }

    rtm
      .inviteAudienceToBecomeHost({ text: 'heyy', peerId, ownId: userId })
      .then(() => {
        console.log('heyy', 'successfully sent to', peerId);
      })
      .catch((err) => {
        console.error(`Send message to peer ${peerId}`, err);
      });
  };

  const rtmLogin = () => {
    try {
      rtm.init(appId);
      rtm.login(Math.floor(Math.random() * 10000).toString(), null).then(() => {
        console.log('rtm logged in');
        rtm.setLoggedIn(true);
        rtm.joinChannel(channelName);
      });
      rtm.subscribeClientEvents(/* { modalHandler: setIsOpen, remoteSenderIdHandler: setSuperhostId } */);
    } catch (err) {
      console.log('login failed', err);
    }
  };

  const declineHostInvitation = () => {
    rtm.declineHostInvitation(superhostId);
  };

  useEffect(() => {
    rtmLogin();
    return () => rtm.leaveChannel();
  }, []);

  return (
    <>
      {/* {isPlaying && (
        <ControlMenu
          localstream={localstream}
          removeStream={removeStream}
          setIsPlaying={setIsPlaying}
          userId={userId}
        />
      )} */}
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={() => console.log('after open')}
        onRequestClose={() => console.log('request close')}
        style={{}}
        contentLabel="Example Modal"
      >
        <h1>Hey</h1>
        <button
          type="button"
          onClick={() => {
            rtc.initStream(userId, superhost);
            rtc.acceptHostInvitation(setIsOpen);
          }}
        >
          Accept
        </button>
        <button type="button" onClick={declineHostInvitation}>
          Decline
        </button>
      </Modal>
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
            rtc.initStream(userId, superhost);
          }}
        >
          BECOME SUPERHOST
        </button>
        <button
          type="button"
          onClick={() => {
            setRole(host);
            rtc.initStream(userId, host);
          }}
        >
          BECOME HOST
        </button>
        <button
          type="button"
          onClick={() => {
            setRole(moderator);
            console.log({ users });
          }}
        >
          BECOME MODERATOR
        </button>
        <button type="button">BECOME AUDIENCE</button>
        <Form handleSubmit={sendMessageToPeer} />
      </span>
      <LayoutGrid>
        {/* eslint-disable-next-line react/jsx-curly-brace-presence */}
        {/* (role === superhost || role === moderator) && */ <UserList rtm={rtm} />}
        <Hosts streams={streams} role={role} />
        <Chat />
      </LayoutGrid>
    </>
  );
};

export default Content;
