import AgoraRTM from 'agora-rtm-sdk';
import EventEmitter from 'events';

import { appId, channelName } from './utils';

export default class Rtm extends EventEmitter {
  constructor() {
    super();
    this.channels = {};
    this.loggedIn = false;
  }

  setLoggedIn(isLoggedIn) {
    this.loggedIn = isLoggedIn;
  }

  init(handlers) {
    this.handlers = handlers;
    this.client = AgoraRTM.createInstance(appId);
  }

  async renewToken(token) {
    return this.client.renewToken(token);
  }

  subscribeClientEvents() {
    const clientEvents = ['ConnectionStateChanged'];
    clientEvents.forEach((eventName) => {
      this.client.on(eventName, (...args) => {
        this.emit(eventName, ...args);
      });
    });

    this.client.on('MessageFromPeer', (message) => {
      this.handlers.onMessage(message.text);
    });
  }

  subscribeChannelEvents(handler) {
    const memberEvents = ['MemberJoined', 'MemberLeft'];
    memberEvents.forEach((eventName) => {
      this.channels[channelName].channel.on(eventName, (...args) => {
        this.getMembers();
        handler();
        this.emit(eventName, { channelName, args });
      });
    });

    this.channels[channelName].channel.on('ChannelMessage', (...args) => {
      const message = args.filter((arg) => arg.text)[0];
      console.log({ message });
      this.handlers.onMessage(message.text);
    });
  }

  async login(accountName, token) {
    this.accountName = accountName.toString();
    return this.client.login({ uid: this.accountName, token });
  }

  async logout() {
    return this.client.logout();
  }

  async joinChannel(name) {
    const channel = this.client.createChannel(name);
    this.channels[name] = {
      channel,
      joined: false, // channel state
    };
    return channel.join();
  }

  async leaveChannel(name) {
    if (!this.channels[name] || (this.channels[name] && !this.channels[name].joined)) return;
    return this.channels[name].channel.leave();
  }

  async sendChannelMessage(text) {
    if (!this.channels[channelName] || !this.channels[channelName].joined) return;
    return this.channels[channelName].channel.sendMessage({ text });
  }

  /* async sendPeerMessage(text, peerId) {
    console.log('sendPeerMessage', text, peerId);
    return this.client.sendMessageToPeer({ text }, peerId);
  } */

  async inviteAudienceToBecomeHost({ peerId, ownId }) {
    return this.client.sendMessageToPeer({ text: this.generateHostInvitation(ownId) }, peerId);
  }

  async inviteHostToBecomeStage({ peerId, ownId }) {
    return this.client.sendMessageToPeer({ text: this.generateStageInvitation(ownId) }, peerId);
  }

  removeHost(hostId) {
    return this.client.sendMessageToPeer({ text: this.generateRemoveHostMessage(hostId) }, hostId);
  }

  /*  async queryPeersOnlineStatus(memberId) {
    console.log('queryPeersOnlineStatus', memberId);
    return this.client.queryPeersOnlineStatus([memberId]);
  } */

  async getMembers() {
    return this.channels[channelName].channel.getMembers().then((userList) => {
      if (userList !== this.users) {
        return userList;
      }
    });
  }

  generateRemoveHostMessage = (hostId) => {
    return JSON.stringify({
      subject: 'remove-you-as-host',
      issuer: hostId, // Here: id of host to be removed
      token:
        '00609055eb4141f4ab4809ff8a2302254e9IAD8tvnQu5r8hAlgFGLlmZ8Cre6tU1VvEdKs/WvGmuFU4uAbzEcAAAAAEADOpjO6dw9yXwEAAQB2D3Jf',
    });
  };

  generateHostInvitation = (issuerId) => {
    return JSON.stringify({
      subject: 'host-invitation',
      issuer: issuerId,
      token:
        '00609055eb4141f4ab4809ff8a2302254e9IAD8tvnQu5r8hAlgFGLlmZ8Cre6tU1VvEdKs/WvGmuFU4uAbzEcAAAAAEADOpjO6dw9yXwEAAQB2D3Jf',
    });
  };

  generateHostInvitationAccept = (issuerId) => {
    return JSON.stringify({
      subject: 'host-invitation-accepted',
      issuer: issuerId,
      token:
        '00609055eb4141f4ab4809ff8a2302254e9IAD8tvnQu5r8hAlgFGLlmZ8Cre6tU1VvEdKs/WvGmuFU4uAbzEcAAAAAEADOpjO6dw9yXwEAAQB2D3Jf',
    });
  };

  generateStageInvitation = (issuerId) => {
    return JSON.stringify({
      subject: 'stage-invitation',
      issuer: issuerId,
      token:
        '00609055eb4141f4ab4809ff8a2302254e9IAD8tvnQu5r8hAlgFGLlmZ8Cre6tU1VvEdKs/WvGmuFU4uAbzEcAAAAAEADOpjO6dw9yXwEAAQB2D3Jf',
    });
  };

  generateStageInvitationAccept = (issuerId, currentMainId) => {
    return JSON.stringify({
      subject: 'stage-invitation-accepted',
      issuer: issuerId,
      previousMain: currentMainId,
      token:
        '00609055eb4141f4ab4809ff8a2302254e9IAD8tvnQu5r8hAlgFGLlmZ8Cre6tU1VvEdKs/WvGmuFU4uAbzEcAAAAAEADOpjO6dw9yXwEAAQB2D3Jf',
    });
  };

  acceptStageInvitation(uid, currentMainId) {
    this.channels[channelName].channel.sendMessage({
      text: this.generateStageInvitationAccept(uid, currentMainId),
    });
  }

  acceptHostInvitation(uid, remoteUid) {
    this.client.sendMessageToPeer(
      { text: this.generateHostInvitationAccept(uid) }, // An RtmMessage object.
      remoteUid // The user ID of the remote user.
    );
  }

  generateHostInvitationDecline = (issuerId) => {
    return JSON.stringify({
      subject: 'host-invitation-declined',
      issuer: issuerId,
    });
  };

  declineHostInvitation(uid, remoteUid) {
    this.client.sendMessageToPeer(
      { text: this.generateHostInvitationDecline(uid) }, // An RtmMessage object.
      remoteUid // The user ID of the remote user.
    );
  }
}
