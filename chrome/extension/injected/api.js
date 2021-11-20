import {
  fetchData,
  getData,
  getSymbolFromPathname,
  log,
  manageRisk,
  getWebsocketAuthData,
} from './utils';
import { WEBSOCKET_API_HOST } from '../config';

export const getMarginInfo = async () => {
  try {
    const marginInfoResponse = await fetchData(`v2/auth/r/info/margin/${getSymbolFromPathname()}`);
    const getSafeAmount = (value) => value * 0.995;

    return {
      tradable_balance: marginInfoResponse[2][0],
      gross_balance: marginInfoResponse[2][1],
      buy: getSafeAmount(marginInfoResponse[2][2]),
      sell: getSafeAmount(marginInfoResponse[2][3]),
    };
  } catch (ex) {
    log('error', 'FAILED TO FETCH MARGIN INFO', ex);
  }
};

export const retrievePositions = async () => {
  try {
    const positionsResponse = await fetchData('v2/auth/r/positions');

    return positionsResponse.map((position) => ({
      symbol: position[0],
      status: position[1],
      amount: position[2],
      price: position[3],
      funding: position[4],
      funding_type: position[5],
      pl: position[6],
      pl_perc: position[7],
      price_liq: position[8],
      leverage: position[9],
      _PLACEHOLDER_1: position[10],
      position_id: position[11],
      mts_create: position[12],
      mts_update: position[13],
      _PLACEHOLDER_2: position[14],
      type: position[15],
      _PLACEHOLDER_3: position[16],
      collateral: position[17],
      collateral_min: position[18],
      meta: position[19],
    }));
  } catch (ex) {
    log('error', 'FAILED TO RETRIEVE POSITIONS', ex);
  }
};

export const retrieveOrders = async () => {
  try {
    const ordersResponse = await fetchData('v2/auth/r/orders');

    return ordersResponse.map((order) => ({
      id: order[0],
      gid: order[1],
      cid: order[2],
      symbol: order[3],
      mts_create: order[4],
      mts_update: order[5],
      amount: order[6],
      amount_orig: order[7],
      type: order[8],
      type_prev: order[9],
      flags: order[12],
      status: order[13],
      price: order[16],
      price_avg: order[17],
      price_trailing: order[18],
      price_aux_limit: order[19],
      hidden: order[23],
      placed_id: order[24],
      routing: order[28],
      meta: order[31],
    }));
  } catch (ex) {
    log('error', 'FAILED TO RETRIEVE ORDERS', ex);
  }
};

export const getLedgersHistory = async (query) => {
  try {
    const { category, start, end, limit } = query;
    const ledgersResponse = await fetchData('v2/auth/r/ledgers/hist', {
      category,
      start,
      end,
      limit,
    });

    return ledgersResponse.map((ledger) => ({
      id: ledger[0],
      currency: ledger[1],
      _PLACEHOLDER_1: ledger[2],
      timestamp: ledger[3],
      _PLACEHOLDER_2: ledger[4],
      amout: ledger[5],
      balance: ledger[6],
      _PLACEHOLDER_3: ledger[7],
      description: ledger[8],
    }));
  } catch (ex) {
    log('error', 'FAILED TO FETCH LEDGERS HISTORY', ex);
  }
};

export const getCurrTickerInfo = async () => {
  try {
    const tickerResponse = await getData(`v2/ticker/${getSymbolFromPathname()}`);

    return {
      bid: tickerResponse[0],
      bid_size: tickerResponse[1],
      ask: tickerResponse[2],
      ask_size: tickerResponse[3],
      daily_change: tickerResponse[4],
      daily_change_relative: tickerResponse[5],
      last_price: tickerResponse[6],
      volume: tickerResponse[7],
      high: tickerResponse[8],
      low: tickerResponse[9],
    };
  } catch (ex) {
    log('error', 'FAILED TO FETCH CURRENT TICKER INFO', ex);
  }
};

export const submitMarketOrder = async (amount) => {
  try {
    await fetchData('v2/auth/w/order/submit', {
      type: 'MARKET',
      symbol: getSymbolFromPathname(),
      amount: amount.toFixed(4),
    });
  } catch (ex) {
    log('error', 'FAILED TO SUBMIT MARKET ORDER', ex);
  }
};

export const createStopOrder = async (type, amount, price, risk, leverage) => {
  try {
    await fetchData('v2/auth/w/order/submit', {
      type: 'STOP',
      symbol: getSymbolFromPathname(),
      amount: (amount * -1).toString(),
      price: manageRisk(type, price, risk, leverage).toFixed(4),
    });
  } catch (ex) {
    log('error', 'FAILED TO CREATE STOP ORDER', ex);
  }
};

export const getCurrMarginWalletInfo = async () => {
  const walletResponse = await fetchData('v2/auth/r/wallets');
  const marginWalletInfo = walletResponse.find(
    (wallet) => wallet[0] === 'margin' && wallet[1] === 'USD'
  );

  return {
    balance: marginWalletInfo[2],
    unsettled_interest: marginWalletInfo[3],
    available_balance: marginWalletInfo[4],
    last_change: marginWalletInfo[5],
    trade_details: marginWalletInfo[6],
  };
};

export const connectWebsocket = (cb) => {
  try {
    const wss = new WebSocket(WEBSOCKET_API_HOST);

    wss.onopen = () => wss.send(JSON.stringify(getWebsocketAuthData()));

    wss.onmessage = (msg) => {
      const response = JSON.parse(msg.data);

      if (response) {
        cb(response);
      }
    };
  } catch (ex) {
    log('error', 'FAILED TO CONNECT WITH WEBSOCKET', ex);
  }
};

export const transferUSDToExchangeWallet = async (amount) => {
  try {
    const transferResponse = await fetchData('v2/auth/w/transfer', {
      from: 'margin',
      to: 'exchange',
      currency: 'USD',
      amount: amount.toFixed(2),
    });

    return transferResponse;
  } catch (ex) {
    log('error', 'FAILED TO TRANSFER USD TO EXCHANGE WALLET', ex);
  }
};
