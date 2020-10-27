import AgoraRTC from 'agora-rtc-sdk';
import { appId, channelName, roles } from './constants';

const { host, superhost, audience } = roles;

const handleFail = (error) => console.log('Error:', error);

export default class Rtc {
  //   constructor({ removeStream, addVideoStream }) {
  //     this.removeStream = removeStream;
  //     this.addVideoStream = addVideoStream;
  //   }

  createClient() {
    this.client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
    return this.client;
  }

  initClient() {
    fetch('https://agora.service-sample.de/api/test/init/test').then((response) =>
      response.json().then((data) => {
        // setUserId(data.id);
        this.client.init(
          appId,
          () => {
            console.log('successfully initialized');
            this.subscribeToStreamEvents();
            this.client.join(
              null, // tokenOrKey: Token or Channel Key
              channelName, // channelId
              data.id, // User specific ID. Type: Number or string, must be the same type for all users
              (uid) => {
                console.log(`userWith id ${uid} joined the channel`);
                const stream = this.initStream(uid);

                stream.init(() => {
                  //   this.addVideoStream(stream);
                  this.client.publish(stream, handleFail);
                  // const videoWindowId = `video-${localstream.streamId}`;
                  // localstream.play(videoWindowId);
                  // setIsPlaying(true);
                }, handleFail);
              },
              handleFail
            );
          },
          () => console.log('failed to initialize')
        );
      })
    );
  }

  acceptHostInvitation(/* setIsOpen */) {
    console.log({ client: this.client, stream: this.localstream });
    // setIsOpen(false);
    // this.client.setClientRole('host', (error) => {
    //   if (!error) {
    //     console.log('accepted');
    //   } else {
    //     console.log('error setting role');
    //   }
    // });
  }

  initStream(uid, attendeeMode) {
    const defaultConfig = {
      streamID: uid,
      audio: false,
      video: false,
      screen: false,
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
    console.log({ client: this.client });
    return this.localstream;
  }

  subscribeToStreamEvents() {
    this.client.on('stream-published', (event) => {
      console.log('stream-published');
    });

    this.client.on('stream-added', (event) => {
      const { stream } = event;
      console.log('ADDED', stream);
      this.client.subscribe(stream, handleFail);
    });

    // Here we are receiving the remote stream
    this.client.on('stream-subscribed', (event) => {
      const { stream } = event;
      console.log('SUBSCRIBED', { stream });
      //   this.addVideoStream(stream);
      // const streamId = stream.getId(); // Same value as uid. Turning into string because ID of DOM elements can only be strings.
      // stream.play(`video-${streamId}`);
    });

    this.client.on('stream-removed', () => {
      console.log('stream removed');
    }); /* , (event) => this.removeStream(event.stream.getId()) */

    this.client.on('peer-leave', () => {
      console.log('peer left');
    }); /* , (event) => this.removeStream(event.uid) */

    this.client.on('client-role-changed', (event) => {
      console.log('client role has changed', event);
    });

    this.client.on('mute-video', () => {
      console.log('successfully muted');
    });
  }
}
