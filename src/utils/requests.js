const baseUrl = 'https://europe-west3-xircus-7739e.cloudfunctions.net/agoraService';

export const initUser = async ({ callback, token, channelId, eventId }) => {
  const url = `${baseUrl}/api/init/${eventId}/${channelId}`;
  await fetch(url, {
    method: 'GET',
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  }).then((response) =>
    response.json().then((data) => {
      if (callback) callback(data);
      return data;
    })
  );
};

export const getMainScreen = async ({ callback, token, channelId, eventId }) => {
  const url = `${baseUrl}/api/mainscreen/${eventId}/${channelId}`;
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

export const setMainScreen = async ({ mainscreen, token, channelId, eventId }) => {
  const url = `${baseUrl}/api/mainscreen/${eventId}/${channelId}`;
  const body = JSON.stringify({ mainscreen });
  fetch(url, {
    method: 'POST',
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }),
    body,
  });
};

export const getIsWaitingRoom = async ({ callback, token, channelId, eventId }) => {
  const url = `${baseUrl}/api/waitingroom/${eventId}/${channelId}`;
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

export const setIsWaitingRoom = async ({ waitingroom, channelId, eventId, token }) => {
  const url = `${baseUrl}/api/waitingroom/${eventId}/${channelId}`;
  const body = JSON.stringify({ waitingroom });
  fetch(url, {
    method: 'POST',
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }),
    body,
  });
};

export const getReferents = async ({ callback, token, channelId, eventId }) => {
  const url = `${baseUrl}/api/referent/${eventId}/${channelId}`;
  await fetch(url, {
    method: 'GET',
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  }).then((response) =>
    response.json().then(({ referents }) => {
      if (callback) callback(referents);
      return referents;
    })
  );
};

export const addReferent = async ({ id, channelId, eventId, token }) => {
  const url = `${baseUrl}/api/addReferent/${eventId}/${channelId}`;
  const body = JSON.stringify({ id });
  fetch(url, {
    method: 'POST',
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }),
    body,
  });
};

export const removeReferent = async ({ id, channelId, eventId, token }) => {
  const url = `${baseUrl}/api/removeReferent/${eventId}/${channelId}`;
  const body = JSON.stringify({ id });
  fetch(url, {
    method: 'POST',
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }),
    body,
  });
};
