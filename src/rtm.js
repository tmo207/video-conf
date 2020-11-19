import AgoraRTM from 'agora-rtm-sdk';
import EventEmitter from 'events';

import { MESSAGES } from './utils/constants';

const { REMOVE_AS_HOST } = MESSAGES;

export default class Rtm extends EventEmitter {
  constructor({ appId, channelId }) {
    super();
    this.channels = {};
    this.appId = appId;
    this.channelId = channelId;
  }

  init(handlers) {
    this.handlers = handlers;
    this.client = AgoraRTM.createInstance(this.appId);
  }

  async setRtmToken(token) {
    this.rtmToken = token;
  }

  async renewToken(token) {
    return this.client.renewToken(token);
  }

  subscribeClientEvents() {
    this.client.on('ConnectionStateChanged', (...args) => {
      if (args.includes('LOGIN_SUCCESS')) this.handlers.setRtmLoggedIn(true);
      this.emit('ConnectionStateChanged', ...args);
    });

    this.client.on('MessageFromPeer', (message) => {
      this.handlers.onMessage(message.text);
    });
  }

  subscribeChannelEvents(handler) {
    const memberEvents = ['MemberJoined', 'MemberLeft'];
    memberEvents.forEach((eventName) => {
      this.channels[this.channelId].channel.on(eventName, (...args) => {
        this.getMembers();
        if (handler) handler();
        this.emit(eventName, { CHANNEL_ID: this.channelId, args });
      });
    });

    this.channels[this.channelId].channel.on('ChannelMessage', (...args) => {
      const message = args.filter((arg) => arg.text)[0];
      this.handlers.onMessage(message.text);
    });
  }

  async login(accountName) {
    this.accountName = accountName.toString();
    return this.client.login({ uid: this.accountName, token: this.rtmToken });
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
    return this.channels[this.channelId].channel.getMembers().then((userList) => {
      if (userList !== this.users) {
        return userList;
      }
    });
  }

  generateMessage = (userId, subject) => {
    return JSON.stringify({
      subject,
      userId,
      token: this.rtmToken,
    });
  };

  async sendChannelMessage(userId, subject) {
    return this.channels[this.channelId].channel.sendMessage({
      text: this.generateMessage(userId, subject),
    });
  }

  async sendPeerMessage({ to, from, subject }) {
    return this.client.sendMessageToPeer({ text: this.generateMessage(from, subject) }, to);
  }

  removeHost(hostId) {
    return this.client.sendMessageToPeer(
      { text: this.generateMessage(hostId, REMOVE_AS_HOST) },
      hostId
    );
  }
}
