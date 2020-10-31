import AgoraRTC from 'agora-rtc-sdk';
import { appId, channelName, roles } from './constants';

const { host, superhost, audience, moderator } = roles;

const handleFail = (error) => console.log('Error:', error);

export default class Rtc {
  constructor() {
    this.streams = [];
  }

  createClient() {
    this.client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
    return this.client;
  }

  initClient(uid, role, handlers) {
    this.handlers = handlers;
    this.client.init(
      appId,
      () => {
        this.subscribeToStreamEvents();
        this.client.join(
          null, // tokenOrKey: Token or Channel Key
          channelName, // channelId
          uid, // User specific ID. Type: Number or string, must be the same type for all users
          (id) => {
            const isHost = role === host;
            const isSuperHost = role === superhost;

            if (isHost || isSuperHost) {
              this.publishAndStartStream(id, role);
            }
          },
          handleFail
        );
      },
      () => console.log('failed to initialize')
    );
  }

  removeStream(uid) {
    this.streams.map((stream, index) => {
      if (stream.streamId === uid) {
        stream.close();
        const tempList = [...this.streams];
        tempList.splice(index, 1);
        this.handlers.setStreams(tempList);
      }
    });
  }

  publishAndStartStream(uid, role) {
    const stream = this.createStream(uid, role);

    stream.init(() => {
      this.client.publish(stream, handleFail);
      this.streams = [...this.streams, stream];
      this.handlers.setStreams(this.streams);
      stream.play(`video-${stream.streamId}`);
      this.handlers.setIsPlaying(true);
    }, handleFail);
  }

  createStream(uid, attendeeMode, screen) {
    const defaultConfig = {
      streamID: uid,
      audio: false,
      video: false,
      screen,
    };

    switch (attendeeMode) {
      case host:
      case superhost:
        defaultConfig.video = true;
        defaultConfig.audio = true;
        break;
      default:
      case audience:
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
      this.client.subscribe(stream, handleFail);
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
