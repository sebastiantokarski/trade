import CryptoJS from 'crypto-js';
import { API_KEY, API_SECRET_KEY, WEBSOCKET_API_KEY, WEBSOCKET_API_SECRET_KEY } from './config';

export const timeSince = (timestamp) => {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = new Date() - timestamp;

  if (elapsed < msPerMinute) {
    return `${Math.round(elapsed / 1000)} seconds ago`;
  } else if (elapsed < msPerHour) {
    return `${Math.round(elapsed / msPerMinute)} minutes ago`;
  } else if (elapsed < msPerDay) {
    return `${Math.round(elapsed / msPerHour)} hours ago`;
  } else if (elapsed < msPerMonth) {
    return `${Math.round(elapsed / msPerDay)} days ago`;
  } else if (elapsed < msPerYear) {
    return `${Math.round(elapsed / msPerMonth)} months ago`;
  }

  return `${Math.round(elapsed / msPerYear)} years ago`;
};

export const getTodayMidnightTime = () => {
  const todayMidnight = new Date();

  todayMidnight.setHours(0, 0, 0, 0);

  return todayMidnight.getTime();
};

export const getWebsocketAuthData = () => {
  const apiKey = 'rSHoKUi01PqU6FvLi0a0nyl2RvDPjVINk8l3YfbamW9';

  const authNonce = Date.now() * 1000;
  const authPayload = 'AUTH' + authNonce;
  const authSig = CryptoJS.HmacSHA384(authPayload, WEBSOCKET_API_SECRET_KEY).toString(
    CryptoJS.enc.Hex
  );

  const payload = {
    apiKey,
    authSig,
    authNonce,
    authPayload,
    event: 'auth',
  };

  return payload;
};

export const getAuthHeaders = (apiPath, body) => {
  const nonce = (Date.now() * 1000).toString();
  const signature = `/api/${apiPath}${nonce}${JSON.stringify(body)}`;
  const sig = CryptoJS.HmacSHA384(signature, API_SECRET_KEY).toString();

  return {
    'Content-Type': 'application/json',
    'bfx-nonce': nonce,
    'bfx-apikey': API_KEY,
    'bfx-signature': sig,
  };
};

export const fetchData = async (apiPath, body = {}) => {
  const response = await fetch(`https://api.bitfinex.com/${apiPath}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: getAuthHeaders(apiPath, body),
  })
    .then((res) => res.json())
    .catch((err) => {
      console.log(err);
    });

  return response;
};
