import { fetchData, getSymbolFromUrl } from './utils';

export const getMarginInfo = async () => {
  try {
    const marginInfoResponse = await fetchData(`v2/auth/r/info/margin/${getSymbolFromUrl()}`);
    const getSafeAmount = (value) => {
      return value * 0.995;
    };

    return {
      tradable_balance: marginInfoResponse[2][0],
      gross_balance: marginInfoResponse[2][1],
      buy: getSafeAmount(marginInfoResponse[2][2]),
      sell: getSafeAmount(marginInfoResponse[2][3]),
    };
  } catch (ex) {
    console.error('FAILED TO FETCH MARGIN INFO', ex);
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
      _PLACEHOLDER: position[10],
      position_id: position[11],
      mts_create: position[12],
      mts_update: position[13],
      _PLACEHOLDER: position[14],
      type: position[15],
      _PLACEHOLDER: position[16],
      collateral: position[17],
      collateral_min: position[18],
      meta: position[19],
    }));
  } catch (ex) {
    console.error('FAILED TO RETRIEVE POSITIONS', ex);
  }
};

export const getLedgersHistory = async (limit) => {
  const ledgersResponse = await fetchData('v2/auth/r/ledgers/hist', { limit });

  return ledgersResponse.map((ledger) => ({
    id: ledger[0],
    currency: ledger[1],
    _PLACEHOLDER: ledger[2],
    timestamp: ledger[3],
    _PLACEHOLDER: ledger[4],
    amout: ledger[5],
    balance: ledger[6],
    _PLACEHOLDER: ledger[7],
    description: ledger[8],
  }));
};
