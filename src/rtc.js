import AgoraRTC from 'agora-rtc-sdk';
import { ROLES, SCREEN_SHARE, getMainScreen, setMainScreen } from './utils';

const { AUDIENCE, HOST, SUPERHOST } = ROLES;

const onError = (error) => console.log('Error:', error);

export default class Rtc {
  constructor({ APP_ID, CHANNEL_ID, EVENT_ID, USER_TOKEN }) {
    this.appId = APP_ID;
    this.channelId = CHANNEL_ID;
    this.eventId = EVENT_ID;
    this.streams = [];
    this.userToken = USER_TOKEN;
  }

  async setRtcToken(rtcToken) {
    this.rtcToken = rtcToken;
  }

  createClient() {
    this.client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
    return this.client;
  }

  init(handlers, callback) {
    this.handlers = handlers;
    this.client.init(
      this.appId,
      () => {
        this.subscribeToStreamEvents();
        if (callback) callback();
      },
      () => console.log('failed to initialize')
    );
  }

  join(uid) {
    this.client.join(
      this.rtcToken, // tokenOrKey: Token or Channel Key
      this.channelId, // channelId
      uid, // User specific ID. Type: Number or string, must be the same type for all users
      (id) => {
        this.handlers.setRtcLoggedIn(true);
        console.log('JOINED CHANNEL with', id);
      },
      onError
    );
  }

  async removeStream(uid) {
    getMainScreen({
      eventId: this.eventId,
      channelId: this.channelId,
      token: this.userToken,
      callback: (currentMainScreen) =>
        currentMainScreen === uid && this.handlers.setLocalMainScreen(null),
    });
    this.streams.map((stream, index) => {
      if (stream.streamId === uid) {
        stream.close();
        const tempList = [...this.streams];
        tempList.splice(index, 1);
        this.streams = tempList;
        this.handlers.setStreams(tempList);
      }
    });
  }

  publishAndStartStream(uid, role) {
    const stream = this.createStream(uid, role);
    // Toast für cant access media, you need to allow camera, mic
    stream.init(() => {
      this.client.publish(stream, onError);
      this.streams = [...this.streams, stream];
      this.handlers.setStreams(this.streams);
      stream.play(`video-${stream.streamId}`);
      this.handlers.setIsPlaying(true);
    }, onError);
  }

  createStream(uid, attendeeMode) {
    const defaultConfig = {
      streamID: uid,
      audio: false,
      video: false,
      screen: false,
      screenAudio: false,
    };

    switch (attendeeMode) {
      case SCREEN_SHARE:
        defaultConfig.screen = true;
        // defaultConfig.screenAudio = true;
        defaultConfig.video = false;
        break;
      case HOST:
      case SUPERHOST:
        defaultConfig.video = true;
        defaultConfig.audio = false; // TURN TRUE TODO
        break;
      default:
      case AUDIENCE:
        break;
    }
    this.localstream = AgoraRTC.createStream(defaultConfig);
    return this.localstream;
  }

  async setMainScreen(uid) {
    setMainScreen({
      mainscreen: uid,
      token: this.userToken,
      channelId: this.channelId,
      eventId: this.eventId,
    });
    this.handlers.setLocalMainScreen(uid);
  }

  subscribeToStreamEvents() {
    this.client.on('stream-published', (event) => {
      console.log('stream-published');
    });

    this.client.on('client-role-changed', (event) => {
      if (event.role === AUDIENCE) this.handlers.setRole(AUDIENCE);
    });

    this.client.on('stream-added', (event) => {
      const { stream } = event;
      this.client.subscribe(stream, onError);
    });

    // Here we are receiving the remote stream
    this.client.on('stream-subscribed', (event) => {
      getMainScreen({
        callback: this.handlers.setLocalMainScreen,
        token: this.userToken,
        eventId: this.eventId,
        channelId: this.channelId,
      });
      const { stream } = event;
      this.streams = [...this.streams, stream];
      this.handlers.setStreams(this.streams);
      const streamId = stream.getId();
      stream.play(`video-${streamId}`);
    });

    this.client.on('stream-removed', ({ stream }) => {
      this.removeStream(stream.streamId);
    });

    this.client.on('peer-leave', ({ stream }) => {
      this.removeStream(stream.streamId);
      console.log('peer left');
    });

    this.client.on('client-role-changed', (event) => {
      console.log('client role has changed', event);
    });

    this.client.on('mute-video', () => {
      console.log('successfully muted');
    });
  }
}
