import AgoraRTM from 'agora-rtm-sdk';
import EventEmitter from 'events';

import { channelName } from './constants';

export default class Rtm extends EventEmitter {
  constructor() {
    super();
    this.channels = {};
    this.loggedIn = false;
  }

  setLoggedIn(isLoggedIn) {
    this.loggedIn = isLoggedIn;
  }

  init(appId) {
    this.client = AgoraRTM.createInstance(appId);
  }

  async renewToken(token) {
    return this.client.renewToken(token);
  }

  subscribeClientEvents(/* { modalHandler, remoteSenderIdHandler } */) {
    const clientEvents = ['ConnectionStateChanged'];
    clientEvents.forEach((eventName) => {
      this.client.on(eventName, (...args) => {
        console.log('emit ', eventName, ...args);
        this.emit(eventName, ...args);
      });
    });

    this.client.on('MessageFromPeer', () => {
      console.log('message from peer');
      // modalHandler(true);
      // remoteSenderIdHandler();
    });

    // this.client.on('MessageFromPeer', () => {
    //   console.log('message from peer');
    // });
  }

  subscribeChannelEvents(handler) {
    const channelEvents = ['ChannelMessage', 'MemberJoined', 'MemberLeft'];
    channelEvents.forEach((eventName) => {
      this.channels[channelName].channel.on(eventName, (...args) => {
        this.getMembers();
        handler();
        console.log('emit ', eventName, args);
        this.emit(eventName, { channelName, args });
      });
    });

    // this.channels[channelName].channel.on('MemberJoined', () => {
    //   console.log('member joined');
    //   membersChanged();
    // });

    // this.channels[channelName].channel.on('MemberLeft', () => {
    //   console.log('member left');
    //   membersChanged();
    // });

    // this.channels[channelName].channel.on('ChannelMessage', () => {
    //   console.log('message in channel');
    // });
  }

  async login(accountName, token) {
    this.accountName = accountName.toString();
    return this.client.login({ uid: this.accountName, token });
  }

  async logout() {
    return this.client.logout();
  }

  async joinChannel(name) {
    console.log('joinChannel', name);
    const channel = this.client.createChannel(name);
    this.channels[name] = {
      channel,
      joined: false, // channel state
    };
    return channel.join();
  }

  async leaveChannel(name) {
    console.log('leaveChannel', name);
    if (!this.channels[name] || (this.channels[name] && !this.channels[name].joined)) return;
    return this.channels[name].channel.leave();
  }

  async sendChannelMessage(text, channelName) {
    if (!this.channels[channelName] || !this.channels[channelName].joined) return;
    return this.channels[channelName].channel.sendMessage({ text });
  }

  async sendPeerMessage(text, peerId) {
    console.log('sendPeerMessage', text, peerId);
    return this.client.sendMessageToPeer({ text }, peerId.toString());
  }

  async inviteAudienceToBecomeHost({ text, peerId, ownId }) {
    console.log('invite audience to become host', text, peerId, ownId);
    return this.client.sendMessageToPeer(
      { text: this.generateHostInvitation(ownId) },
      peerId.toString()
    );
  }

  async queryPeersOnlineStatus(memberId) {
    console.log('queryPeersOnlineStatus', memberId);
    return this.client.queryPeersOnlineStatus([memberId]);
  }

  async getMembers() {
    return this.channels[channelName].channel.getMembers().then((userList) => {
      if (userList !== this.users) {
        console.log({ userList });
        return userList;
      }
    });
  }

  generateHostInvitation = (issuerId) => {
    return JSON.stringify({
      subject: 'host-invitation',
      issuer: issuerId,
      token:
        '00609055eb4141f4ab4809ff8a2302254e9IAD8tvnQu5r8hAlgFGLlmZ8Cre6tU1VvEdKs/WvGmuFU4uAbzEcAAAAAEADOpjO6dw9yXwEAAQB2D3Jf',
    });
  };

  declineHostInvitation(uid) {
    this.client
      .sendMessageToPeer(
        { text: 'invitation declined' }, // An RtmMessage object.
        uid // The user ID of the remote user.
      )
      .then((sendResult) => {
        if (sendResult.hasPeerReceived) {
          console.log('peer received answer');
        } else {
          console.log('peer did not receive answer');
        }
      })
      .catch((error) => {
        console.log('could not send message', error);
      });
  }
}
