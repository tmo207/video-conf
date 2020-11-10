import { CHANNEL_NAME } from './constants';

export const getCurrentMainScreen = async (callback) => {
  await fetch(`https://agora.service-sample.de/api/test/${CHANNEL_NAME}/mainscreen`).then(
    (response) =>
      response.json().then(({ currentMainScreen }) => {
        if (callback) callback(currentMainScreen);
        return currentMainScreen;
      })
  );
};

export const setCurrentMainScreen = async (currentMainScreen) => {
  const url = `https://agora.service-sample.de/api/test/${CHANNEL_NAME}/mainscreen`;
  const body = JSON.stringify({ currentMainScreen });
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body,
  });
};
