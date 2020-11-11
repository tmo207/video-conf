import AgoraRTC from 'agora-rtc-sdk';
import {
  APP_ID,
  CHANNEL_NAME,
  ROLES,
  SCREEN_SHARE,
  getCurrentMainScreen,
  setCurrentMainScreen,
} from './utils';

const { AUDIENCE, HOST, SUPERHOST } = ROLES;

const onError = (error) => console.log('Error:', error);

export default class Rtc {
  constructor() {
    this.streams = [];
  }

  createClient() {
    this.client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
    return this.client;
  }

  init(handlers, uid) {
    this.handlers = handlers;
    this.client.init(
      APP_ID,
      () => {
        this.subscribeToStreamEvents();
        this.client.join(
          null, // tokenOrKey: Token or Channel Key
          CHANNEL_NAME, // channelId
          uid, // User specific ID. Type: Number or string, must be the same type for all users
          (id) => {
            console.log('JOINED CHANNEL with', id);
          },
          onError
        );
      },
      () => console.log('failed to initialize')
    );
  }

  async removeStream(uid) {
    getCurrentMainScreen(
      (currentMainScreen) => currentMainScreen === uid && this.handlers.setLocalMainScreen(null)
    );
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
        defaultConfig.audio = true;
        break;
      default:
      case AUDIENCE:
        break;
    }
    this.localstream = AgoraRTC.createStream(defaultConfig);
    return this.localstream;
  }

  async setMainScreen(uid) {
    setCurrentMainScreen(uid);
    this.handlers.setLocalMainScreen(uid);
  }

  subscribeToStreamEvents() {
    this.client.on('stream-published', (event) => {
      console.log('stream-published');
    });

    this.client.on('stream-added', (event) => {
      const { stream } = event;
      this.client.subscribe(stream, onError);
    });

    // Here we are receiving the remote stream
    this.client.on('stream-subscribed', (event) => {
      getCurrentMainScreen(this.handlers.setLocalMainScreen);
      const { stream } = event;
      this.streams = [...this.streams, stream];
      this.handlers.setStreams(this.streams);
      const streamId = stream.getId(); // Same value as uid. Turning into string because ID of DOM elements can only be strings.
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
