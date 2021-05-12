import CryptoJS from 'crypto-js';
import {
  DEBUG_MODE,
  API_KEY,
  API_SECRET_KEY,
  API_ORIGIN,
  WEBSOCKET_API_KEY,
  WEBSOCKET_API_SECRET_KEY,
  RISK_OPTIONS,
} from '../config';

export const log = (type, ...args) => {
  if (DEBUG_MODE && ['log', 'debug', 'info', 'warn', 'error'].includes(type)) {
    // eslint-disable-next-line no-console
    console[type](...args);
  }
};

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
  return window.location.pathname.replace(/\/|:/g, '').replace('DOGEUSD', 'DOGE:USD');
};

export const getTodayMidnightTime = () => {
  const todayMidnight = new Date();

  todayMidnight.setHours(0, 0, 0, 0);

  return todayMidnight.getTime();
};

export const isDateFromToday = (timestamp) => {
  const today = new Date().setHours(0, 0, 0, 0);
  const thatDay = new Date(timestamp).setHours(0, 0, 0, 0);

  if (today === thatDay) {
    return true;
  }
  return false;
};

export const getWebsocketAuthData = () => {
  const authNonce = Date.now() * 1000;
  const authPayload = `AUTH${authNonce}`;
  // eslint-disable-next-line new-cap
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
  // eslint-disable-next-line new-cap
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
    .catch((ex) => log('error', 'FAILED TO FETCH DATA', ex));

  return response;
};

export const getData = async (pathParams) => {
  const response = await fetch(`${API_ORIGIN}/${pathParams}`)
    .then((res) => res.json())
    .catch((ex) => log('error', 'FAILED TO GET DATA', ex));

  return response;
};

export const manageRisk = (type, price, risk) => {
  const riskValue = RISK_OPTIONS[risk].value;
  const feeInPerc = 0.021;
  // @TODO
  const leverage = 5;

  if (type === 'buy') {
    return price * (1 - (riskValue - feeInPerc) / leverage);
  } else if (type === 'sell') {
    return price * (1 + (riskValue - feeInPerc) / leverage);
  }
};
