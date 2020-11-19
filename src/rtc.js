import AgoraRTC from 'agora-rtc-sdk';

import { ROLES, SCREEN_CLIENT, SCREEN_SHARE } from './utils/constants';
import { getMainScreen, setMainScreen } from './utils/requests';

const { AUDIENCE, HOST, SUPERHOST } = ROLES;

const onError = (error) => console.log('Error:', error);

export default class Rtc {
  constructor({ appId, channelId, eventId, userToken }) {
    this.appId = appId;
    this.channelId = channelId;
    this.eventId = eventId;
    this.streams = [];
    this.userToken = userToken;
    this.isSuperhost = false;
  }

  async setRtcToken(rtcToken) {
    this.rtcToken = rtcToken;
  }

  async setIsSuperhost(isSuperhost) {
    this.isSuperhost = isSuperhost;
  }

  createClient(clientType) {
    const client = clientType || 'client';
    this[client] = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
    return this[client];
  }

  init(handlers, onSuccess) {
    if (handlers) this.handlers = handlers;
    this.client.init(
      this.appId,
      () => {
        this.subscribeToStreamEvents();
        if (onSuccess) onSuccess();
      },
      () => console.log('failed to initialize')
    );
  }

  join(uid, role) {
    this.client.join(
      this.rtcToken, // tokenOrKey: Token or Channel Key
      this.channelId, // channelId
      uid,
      (id) => {
        const isHost = role === SUPERHOST || role === HOST;
        if (isHost) this.publishAndStartStream(id, role);
        console.log('JOINED CHANNEL with', id);
      },
      (error) => console.log('join error:', error)
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

  publishAndStartStream({ uid, role, clientType, cameraId }) {
    const client = clientType || 'client';
    const stream = this.createStream(uid, role, cameraId);
    // Toast für cant access media, you need to allow camera, mic TODO
    stream.init(
      () => {
        this.streams = [...this.streams, stream];
        this.handlers.setStreams(this.streams);
        this.handlers.setIsPlaying(true);
        stream.play(`video-${stream.streamId}`);
        this[client].publish(stream, (error) => console.log('stream publish Error:', error));
      },
      (error) => console.log('stream init Error:', error)
    );
  }

  unpublishAll() {
    this.client.unpublish(this.localstream);
    if (this[SCREEN_SHARE]) this[SCREEN_CLIENT].unpublish(this[SCREEN_SHARE]);
  }

  createStream(uid, attendeeMode, cameraId = '') {
    const defaultConfig = {
      streamID: uid,
      audio: false,
      video: false,
      screen: false,
      screenAudio: false,
      cameraId,
    };

    switch (attendeeMode) {
      case SCREEN_SHARE:
        defaultConfig.streamID = SCREEN_SHARE;
        defaultConfig.screen = true;
        defaultConfig.screenAudio = true;
        defaultConfig.video = false;
        defaultConfig.audio = false;
        defaultConfig.optimizationMode = 'motion';
        break;
      case HOST:
      case SUPERHOST:
        defaultConfig.video = true;
        defaultConfig.audio = false; // TODO CHANGE
        break;
      default:
      case AUDIENCE:
        break;
    }

    const isScreenShare = attendeeMode === SCREEN_SHARE;
    const streamType = isScreenShare ? SCREEN_SHARE : 'localstream';
    this[streamType] = AgoraRTC.createStream(defaultConfig);
    return this[streamType];
  }

  async setMainScreen(mainscreen) {
    setMainScreen({
      mainscreen,
      token: this.userToken,
      channelId: this.channelId,
      eventId: this.eventId,
    });
    this.handlers.setLocalMainScreen(mainscreen);
  }

  subscribeToStreamEvents() {
    this.client.on('stream-published', (event) => {
      console.log('stream-published');
    });

    this.client.on('client-role-changed', (event) => {
      if (event.role === AUDIENCE && !this.isSuperhost) this.handlers.setRole(AUDIENCE);
    });

    this.client.on('stream-added', (event) => {
      const { stream } = event;
      const { streamId } = stream;

      // Prevent subscribing to own streams (https://docs.agora.io/en/Interactive%20Broadcast/screensharing_web?platform=Android#both:~:text=Agora%20recommends%20that%20you%20save%20the,do%20not%20subscribe%20to%20any%20stream.)
      const localstreamsIds = this.streams.map((localstream) => localstream.streamId);
      if (!localstreamsIds.includes(streamId)) {
        this.client.subscribe(stream, (error) => console.log('stream added Error:', error));
      }
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
