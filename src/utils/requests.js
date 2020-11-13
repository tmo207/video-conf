import { CHANNEL_NAME, EVENT_ID, HOST_TOKEN } from './constants';

const baseUrl = 'https://europe-west3-xircus-7739e.cloudfunctions.net/agoraService';

export const initUser = async (token) => {
  const url = `${baseUrl}/api/init/${EVENT_ID}/${CHANNEL_NAME}`;
  await fetch(url, {
    method: 'GET',
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  }).then((response) =>
    response.json().then(({ user }) => {
      return user;
    })
  );
};

export const getMainScreen = async ({ callback, token }) => {
  const url = `${baseUrl}/api/mainscreen/${EVENT_ID}/${CHANNEL_NAME}`;
  await fetch(url, {
    method: 'GET',
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  }).then((response) =>
    response.json().then(({ mainscreen }) => {
      if (callback) callback(mainscreen);
      return mainscreen;
    })
  );
};

export const setMainScreen = async (mainscreen) => {
  const url = `${baseUrl}/api/mainscreen/${EVENT_ID}/${CHANNEL_NAME}`;
  const body = JSON.stringify({ mainscreen });
  fetch(url, {
    method: 'POST',
    headers: new Headers({
      Authorization: `Bearer ${HOST_TOKEN}`,
      'Content-Type': 'application/json',
    }),
    body,
  });
};

export const getIsWaitingRoom = async ({ callback, token }) => {
  const url = `${baseUrl}/api/waitingroom/${EVENT_ID}/${CHANNEL_NAME}`;
  await fetch(url, {
    method: 'GET',
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  }).then((response) =>
    response.json().then(({ waitingroom }) => {
      if (callback) callback(waitingroom);
      return waitingroom;
    })
  );
};

export const setIsWaitingRoom = async (waitingroom) => {
  const url = `${baseUrl}/api/waitingroom/${EVENT_ID}/${CHANNEL_NAME}`;
  const body = JSON.stringify({ waitingroom });
  fetch(url, {
    method: 'POST',
    headers: new Headers({
      Authorization: `Bearer ${HOST_TOKEN}`,
      'Content-Type': 'application/json',
    }),
    body,
  });
};
