import AgoraRTC from 'agora-rtc-sdk';
import { APP_ID, CHANNEL_NAME, ROLES } from './utils';

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

  join(uid, role) {
    const onSuccess = (id) => {
      const isHost = role === HOST || role === 'cohost';
      const isSuperHost = role === SUPERHOST;

      if (isSuperHost) this.publishAndStartStream(id, role);
      if (isHost) this.publishAndStartStream(id, HOST);
    };

    this.client.join(
      null, // tokenOrKey: Token or Channel Key
      CHANNEL_NAME, // channelId
      uid, // User specific ID. Type: Number or string, must be the same type for all users
      onSuccess,
      onError
    );
  }

  init(handlers, onSuccess) {
    this.handlers = handlers;
    this.client.init(
      APP_ID,
      () => {
        this.subscribeToStreamEvents();
        onSuccess();
      },
      () => console.log('failed to initialize')
    );
  }

  async removeStream(uid) {
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

  createStream(uid, attendeeMode, screen) {
    const defaultConfig = {
      streamID: uid,
      audio: false,
      video: false,
      screen,
      screenAudio: screen,
    };

    switch (attendeeMode) {
      case HOST:
      case SUPERHOST:
        defaultConfig.video = true;
        defaultConfig.audio = false; // TURN TRUE
        break;
      default:
      case AUDIENCE:
        break;
    }
    this.localstream = AgoraRTC.createStream(defaultConfig);
    return this.localstream;
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
      fetch('https://agora.service-sample.de/api/test/init/test').then((response) =>
        response.json().then((data) => {
          const mainScreenId = data[0].currentMainScreen.toString();
          this.handlers.setMainScreenId(mainScreenId);
          const { stream } = event;
          this.streams = [...this.streams, stream];
          this.handlers.setStreams(this.streams);
          const streamId = stream.getId(); // Same value as uid. Turning into string because ID of DOM elements can only be strings.
          stream.play(`video-${streamId}`);
        })
      );
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
