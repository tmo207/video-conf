import AgoraRTM from 'agora-rtm-sdk';
import EventEmitter from 'events';

import { APP_ID, CHANNEL_NAME, ROLES, MESSAGES } from './utils';

const { SUPERHOST } = ROLES;

const {
  HOST_INVITE,
  HOST_INVITE_ACCEPTED,
  HOST_INVITE_DECLINED,
  STAGE_INVITE,
  REMOVE_AS_HOST,
  CHANNEL_OPENED,
  MAIN_SCREEN_UPDATED,
} = MESSAGES;

export default class Rtm extends EventEmitter {
  constructor() {
    super();
    this.channels = {};
  }

  init(handlers) {
    this.handlers = handlers;
    this.client = AgoraRTM.createInstance(APP_ID);
  }

  async renewToken(token) {
    return this.client.renewToken(token);
  }

  subscribeClientEvents() {
    this.client.on('ConnectionStateChanged', (...args) => {
      this.emit('ConnectionStateChanged', ...args);
    });

    this.client.on('MessageFromPeer', (message) => {
      this.handlers.onMessage(message.text);
    });
  }

  subscribeChannelEvents(handler) {
    const memberEvents = ['MemberJoined', 'MemberLeft'];
    memberEvents.forEach((eventName) => {
      this.channels[CHANNEL_NAME].channel.on(eventName, (...args) => {
        this.getMembers();
        handler();
        this.emit(eventName, { CHANNEL_NAME, args });
      });
    });

    this.channels[CHANNEL_NAME].channel.on('ChannelMessage', (...args) => {
      const message = args.filter((arg) => arg.text)[0];
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
      joined: false,
    };
    return channel.join();
  }

  async leaveChannel(name) {
    if (!this.channels[name] || (this.channels[name] && !this.channels[name].joined)) return;
    return this.channels[name].channel.leave();
  }

  async sendChannelMessage(text) {
    if (!this.channels[CHANNEL_NAME] || !this.channels[CHANNEL_NAME].joined) return;
    return this.channels[CHANNEL_NAME].channel.sendMessage({ text });
  }

  async getMembers() {
    return this.channels[CHANNEL_NAME].channel.getMembers().then((userList) => {
      if (userList !== this.users) {
        return userList;
      }
    });
  }

  generateHostInvitation = (issuerId) => {
    return JSON.stringify({
      subject: HOST_INVITE,
      issuer: issuerId,
      token:
        '00609055eb4141f4ab4809ff8a2302254e9IAD8tvnQu5r8hAlgFGLlmZ8Cre6tU1VvEdKs/WvGmuFU4uAbzEcAAAAAEADOpjO6dw9yXwEAAQB2D3Jf',
    });
  };

  generateHostInvitationAccept = (issuerId) => {
    return JSON.stringify({
      subject: HOST_INVITE_ACCEPTED,
      issuer: issuerId,
      token:
        '00609055eb4141f4ab4809ff8a2302254e9IAD8tvnQu5r8hAlgFGLlmZ8Cre6tU1VvEdKs/WvGmuFU4uAbzEcAAAAAEADOpjO6dw9yXwEAAQB2D3Jf',
    });
  };

  generateHostInvitationDecline = (issuerId) => {
    return JSON.stringify({
      subject: HOST_INVITE_DECLINED,
      issuer: issuerId,
    });
  };

  generateStageInvitation = (issuerId) => {
    return JSON.stringify({
      subject: STAGE_INVITE,
      issuer: issuerId,
      token:
        '00609055eb4141f4ab4809ff8a2302254e9IAD8tvnQu5r8hAlgFGLlmZ8Cre6tU1VvEdKs/WvGmuFU4uAbzEcAAAAAEADOpjO6dw9yXwEAAQB2D3Jf',
    });
  };

  generateRemoveHostMessage = (hostId) => {
    return JSON.stringify({
      subject: REMOVE_AS_HOST,
      issuer: hostId, // Here: id of host to be removed
      token:
        '00609055eb4141f4ab4809ff8a2302254e9IAD8tvnQu5r8hAlgFGLlmZ8Cre6tU1VvEdKs/WvGmuFU4uAbzEcAAAAAEADOpjO6dw9yXwEAAQB2D3Jf',
    });
  };

  generateUpdateMainScreen = (uid) => {
    return JSON.stringify({
      subject: MAIN_SCREEN_UPDATED,
      issuer: uid,
      token:
        '00609055eb4141f4ab4809ff8a2302254e9IAD8tvnQu5r8hAlgFGLlmZ8Cre6tU1VvEdKs/WvGmuFU4uAbzEcAAAAAEADOpjO6dw9yXwEAAQB2D3Jf',
    });
  };

  generateChannelOpened = () => {
    return JSON.stringify({
      subject: CHANNEL_OPENED,
      issuer: SUPERHOST,
      token:
        '00609055eb4141f4ab4809ff8a2302254e9IAD8tvnQu5r8hAlgFGLlmZ8Cre6tU1VvEdKs/WvGmuFU4uAbzEcAAAAAEADOpjO6dw9yXwEAAQB2D3Jf',
    });
  };

  async inviteAudienceToBecomeHost({ peerId, ownId }) {
    return this.client.sendMessageToPeer({ text: this.generateHostInvitation(ownId) }, peerId);
  }

  acceptHostInvitation(uid, remoteUid) {
    this.client.sendMessageToPeer(
      { text: this.generateHostInvitationAccept(uid) }, // An RtmMessage object.
      remoteUid // The user ID of the remote user.
    );
  }

  declineHostInvitation(uid, remoteUid) {
    this.client.sendMessageToPeer(
      { text: this.generateHostInvitationDecline(uid) }, // An RtmMessage object.
      remoteUid // The user ID of the remote user.
    );
  }

  async inviteHostToBecomeStage({ hostId, ownId }) {
    return this.client.sendMessageToPeer({ text: this.generateStageInvitation(ownId) }, hostId);
  }

  removeHost(hostId) {
    return this.client.sendMessageToPeer({ text: this.generateRemoveHostMessage(hostId) }, hostId);
  }

  updateMainScreen(uid) {
    this.channels[CHANNEL_NAME].channel.sendMessage({
      text: this.generateUpdateMainScreen(uid),
    });
  }

  openChannel() {
    this.channels[CHANNEL_NAME].channel.sendMessage({
      text: this.generateChannelOpened(),
    });
  }
}
