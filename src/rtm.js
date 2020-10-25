import AgoraRTM from 'agora-rtm-sdk';

export default class Rtm {
  constructor({ appId, channelName, uid, userCallback }) {
    this.channelName = channelName;
    this.channel = {};
    this.appId = appId;
    this.client = AgoraRTM.createInstance(appId);
    this.uid = uid;
    this.userCallback = userCallback;
    this.users = [];
  }

  sendMessageToPeer = (message, uid) => {
    console.log({ message, uid });
    this.client
      .sendMessageToPeer(
        { text: message }, // An RtmMessage object.
        uid // The user ID of the remote user.
      )
      .then((sendResult) => {
        if (sendResult.hasPeerReceived) {
          /* Your code for handling the event that the remote user receives the message. */
          console.log('peer received message');
        } else {
          /* Your code for handling the event that the message is received by the server but the remote user cannot be reached. */
          console.log('only server received message');
        }
      })
      .catch((error) => {
        console.error('error', error);
      });
  };

  subscribeToEvents = () => {
    this.channel.on('MemberJoined', () => {
      console.log('member joined');
      this.getMembers();
    });

    this.channel.on('MemberLeft', () => {
      console.log('member left');
      this.getMembers();
    });

    this.client.on('MessageFromPeer', () => {
      console.log('message from peer');
    });
  };

  joinChannel = async () => {
    console.log('join channel', this.channel);
    return this.channel.join();
  };

  leaveChannel = async () => {
    return this.channel.leave();
  };

  init = async () => {
    this.channel = this.client.createChannel(this.channelName);
    this.subscribeToEvents();
    this.client
      .login({
        token: undefined,
        uid: this.uid.toString(),
      })
      .then(() => {
        console.log({ channel: this.channel });
        console.log('AgoraRTM client login success');
        this.joinChannel().then(() => this.getMembers());
      })
      .catch((err) => {
        console.log('AgoraRTM client login failure', err);
      });
  };

  getMembers = () => {
    this.channel.getMembers().then((userList) => {
      if (userList !== this.users) {
        this.userCallback(userList);
        return userList;
      }
    });
  };
}
