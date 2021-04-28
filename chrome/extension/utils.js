import CryptoJS from 'crypto-js';
import {
  API_KEY,
  API_SECRET_KEY,
  API_ORIGIN,
  WEBSOCKET_API_KEY,
  WEBSOCKET_API_SECRET_KEY,
  apiKey,
} from './config';

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

export const getSymbolFromUrl = () => {
  return window.location.pathname.replace(/\/|:/g, '');
};

export const getTodayMidnightTime = () => {
  const todayMidnight = new Date();

  todayMidnight.setHours(0, 0, 0, 0);

  return todayMidnight.getTime();
};

export const getWebsocketAuthData = () => {
  const authNonce = Date.now() * 1000;
  const authPayload = 'AUTH' + authNonce;
  const authSig = CryptoJS.HmacSHA384(authPayload, WEBSOCKET_API_SECRET_KEY).toString(
    CryptoJS.enc.Hex
  );

  const payload = {
    apiKey: WEBSOCKET_API_KEY,
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
  const response = await fetch(`${API_ORIGIN}/${apiPath}`, {
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

export const getData = async (pathParams) => {
  const response = await fetch(`${API_ORIGIN}/${pathParams}`)
    .then((res) => res.json())
    .catch((err) => {
      console.log(err);
    });

  return response;
};

const getCurrTickerInfo = async () => {
  const tickerResponse = await getData(`v2/ticker/${getSymbolFromUrl()}`);

  return { bid: tickerResponse[0], ask: tickerResponse[2] };
};

const getCurrMarginWalletInfo = async () => {
  const walletResponse = await fetchData('v2/auth/r/wallets');
  const marginWalletInfo = walletResponse.find(
    (wallet) => wallet[0] === 'margin' && wallet[1] === 'USD'
  );

  return {
    total: marginWalletInfo ? marginWalletInfo[2] : 0,
    available: marginWalletInfo ? marginWalletInfo[4] : 0,
  };
};
