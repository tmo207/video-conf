import React from 'react';
import AgoraRTM from 'agora-rtm-sdk';
import EventEmitter from 'events';

import { MESSAGES, ROLES } from './utils/constants';
import { getUserDetails } from './utils/requests';

const {
  ASK_STAGE_ACCESS,
  CHANNEL_OPENED,
  HOST_INVITE,
  HOST_REQUEST_ACCEPTED,
  HOST_REQUEST_DECLINED,
  MAIN_SCREEN_UPDATED,
  REMOVE_AS_HOST,
} = MESSAGES;
const { AUDIENCE, HOST } = ROLES;

export default class Rtm extends EventEmitter {
  constructor({ appId, channelId, eventId, token }) {
    super();
    this.channels = {};
    this.appId = appId;
    this.channelId = channelId;
    this.eventId = eventId;
    this.token = token;
  }

  init(handlers) {
    this.handlers = handlers;
    this.client = AgoraRTM.createInstance(this.appId);
  }

  setRtmToken(token) {
    this.rtmToken = token;
  }

  addisOpenHandler(handler) {
    this.setIsOpen = handler;
  }

  addHasRequestedHandler(handler) {
    this.setHasRequested = handler;
  }

  addRequestsHandler(handler) {
    this.addRequestsHandler = handler;
  }

  subscribeClientEvents() {
    this.client.on('ConnectionStateChanged', (...args) => {
      if (args.includes('LOGIN_SUCCESS')) this.handlers.setRtmLoggedIn(true);
      this.emit('ConnectionStateChanged', ...args);
    });

    this.client.on('MessageFromPeer', (message) => {
      const { text } = message;
      const content = JSON.parse(text);

      if (content && content.subject) {
        switch (content.subject) {
          case HOST_INVITE:
            this.setIsOpen(true);
            break;
          case HOST_REQUEST_ACCEPTED:
            React.unstable_batchedUpdates(() => {
              this.handlers.setLocalWaitingRoom((waitingroom) => {
                if (waitingroom) return false;
              });
              this.setHasRequested(false);
              this.handlers.setRole(HOST);
            });
            break;
          case HOST_REQUEST_DECLINED:
            this.setHasRequested(false);
            break;
          case REMOVE_AS_HOST:
            this.handlers.setRole(AUDIENCE);
            break;
          case ASK_STAGE_ACCESS:
            getUserDetails({
              ids: [content.userId],
              channelId: this.channelId,
              eventId: this.eventId,
              token: this.token,
            }).then((newReferentDetails) =>
              this.handlers.setReferentRequests((referents) => [
                ...referents,
                newReferentDetails[0],
              ])
            );
            break;
          default:
            break;
        }
      }
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
      const { text } = message;
      const content = JSON.parse(text);

      if (content && content.subject) {
        switch (content.subject) {
          case MAIN_SCREEN_UPDATED:
            this.handlers.setLocalMainScreen(content.userId);
            break;
          case CHANNEL_OPENED:
            this.handlers.setLocalWaitingRoom((waitingroom) => !waitingroom);
            break;
          default:
            break;
        }
      }
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
