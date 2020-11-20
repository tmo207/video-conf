export const global = {};

export const ROLES = {
  SUPERHOST: 'superhost',
  HOST: 'referent',
  AUDIENCE: 'audience',
};

export const SCREEN_SHARE = 'screenshare';
export const SCREEN_CLIENT = 'screenclient';

export const MESSAGES = {
  ASK_STAGE_ACCESS: 'ask-stage-access',
  HOST_INVITE: 'host-invitation',
  HOST_INVITE_ACCEPTED: 'host-invitation-accepted',
  HOST_INVITE_DECLINED: 'host-invitation-declined',
  REMOVE_AS_HOST: 'remove-you-as-host',
  NO_MAIN_SCREEN: 'null',
  CHANNEL_OPENED: 'channel-opened',
  MAIN_SCREEN_UPDATED: 'main-screen-updated',
  HOST_REQUEST_ACCEPTED: 'you-got-promoted',
  HOST_REQUEST_DECLINED: 'host-request-declined',
};

export const defaultSessionContext = {
  app_id: 'eb8e2114337f4422b490c61bdb758a98',
  channel_id: 'react-dev',
  channel_typ: 'broadcast',
  event_id: 'lr5PUQf9VbRUYXIoiZHJ',
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ4aXJjdXMiLCJpYXQiOjE2MDUyODI5NTQsImV4cCI6MTYwNTMwMDY5MzU0LCJ1aWQiOiIxMyIsIm5hbWUiOiJEYXZpZEtvZXJudGdlbiIsInJvbGVzIjpbImFkbWluaXN0cmF0b3IiXX0.ev5zO5hoaIYf7ptRWpPqE3bqDm3qJQ_UWOUXZZ8ieos',
};
