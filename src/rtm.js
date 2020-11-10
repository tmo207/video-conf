import AgoraRTM from 'agora-rtm-sdk';
import EventEmitter from 'events';

import { APP_ID, CHANNEL_NAME, MESSAGES } from './utils';

const { REMOVE_AS_HOST } = MESSAGES;

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

  async joinChannel(name) {
    const channel = this.client.createChannel(name);
    this.channels[name] = {
      channel,
      joined: false,
    };
    return channel.join();
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

  async sendChannelMessage(userId, subject) {
    return this.channels[CHANNEL_NAME].channel.sendMessage({
      text: this.generateMessage(userId, subject),
    });
  }

  async sendPeerMessage(peerId, remoteId, subject) {
    return this.client.sendMessageToPeer({ text: this.generateMessage(remoteId, subject) }, peerId);
  }

  removeHost(hostId) {
    return this.client.sendMessageToPeer(
      { text: this.generateMessage(hostId, REMOVE_AS_HOST) },
      hostId
    );
  }
}
