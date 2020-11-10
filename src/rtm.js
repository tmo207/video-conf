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

  generateMessage = (userId, subject) => {
    return JSON.stringify({
      subject,
      userId,
      token:
        '00609055eb4141f4ab4809ff8a2302254e9IAD8tvnQu5r8hAlgFGLlmZ8Cre6tU1VvEdKs/WvGmuFU4uAbzEcAAAAAEADOpjO6dw9yXwEAAQB2D3Jf',
    });
  };

  async inviteAudienceToBecomeHost({ peerId, ownId }) {
    return this.client.sendMessageToPeer(
      { text: this.generateMessage(ownId, HOST_INVITE) },
      peerId
    );
  }

  acceptHostInvitation(uid, remoteUid) {
    this.client.sendMessageToPeer(
      { text: this.generateMessage(uid, HOST_INVITE_ACCEPTED) }, // An RtmMessage object.
      remoteUid // The user ID of the remote user.
    );
  }

  declineHostInvitation(uid, remoteUid) {
    this.client.sendMessageToPeer(
      { text: this.generateMessage(uid, HOST_INVITE_DECLINED) }, // An RtmMessage object.
      remoteUid // The user ID of the remote user.
    );
  }

  async inviteHostToBecomeStage({ hostId, ownId }) {
    return this.client.sendMessageToPeer(
      { text: this.generateMessage(ownId, STAGE_INVITE) },
      hostId
    );
  }

  removeHost(hostId) {
    return this.client.sendMessageToPeer(
      { text: this.generateMessage(hostId, REMOVE_AS_HOST) },
      hostId
    );
  }

  updateMainScreen(uid) {
    this.channels[CHANNEL_NAME].channel.sendMessage({
      text: this.generateMessage(uid, MAIN_SCREEN_UPDATED),
    });
  }

  openChannel() {
    this.channels[CHANNEL_NAME].channel.sendMessage({
      text: this.generateMessage(SUPERHOST, CHANNEL_OPENED),
    });
  }
}
