import { createSlice } from '@reduxjs/toolkit';
import { getLedgersHistory, getCurrMarginWalletInfo } from '../../api';
import { getTodayMidnightTime } from '../../utils';
import {
  MAXIMUM_PERC_LOSS,
  TARGET_PERC_PROFIT,
  LEDGERS_HISTORY_LIMIT,
  LEDGERS_CATEGORY_POSITION_CLOSED,
} from '../../../config';

const initialState = {
  ledgers: [],
  posLedgers: [],
  wallet: null,
  currBalance: undefined,
  currDayBalance: undefined,
  minBalance: undefined,
  targetBalance: undefined,
  performDataSuccess: false,
};

const slice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setLedgers(state, action) {
      const { ledgers, posLedgers } = action.payload;

      state.ledgers = ledgers;
      state.posLedgers = posLedgers;
    },
    setWallet(state, action) {
      const { wallet } = action.payload;

      state.wallet = wallet;
    },
    performData(state, action) {
      const latestUSDLedger = state.ledgers.find(
        (ledger) => ledger.currency === 'USD' && !ledger.description.match(/Transfer|Exchange/)
      );
      const yesterdayUSDLedger = state.ledgers.find(
        (ledger) =>
          ledger.currency === 'USD' &&
          ledger.timestamp < getTodayMidnightTime() &&
          ledger.balance !== 0 &&
          !ledger.description.match(/Transfer|Exchange/)
      );

      if (latestUSDLedger) {
        state.currBalance = latestUSDLedger.balance;
      }
      if (yesterdayUSDLedger) {
        state.currDayBalance = yesterdayUSDLedger.balance;
        state.minBalance = state.currDayBalance * (1 - MAXIMUM_PERC_LOSS);
        state.targetBalance = state.currDayBalance * (1 + TARGET_PERC_PROFIT);
      }

      state.performDataSuccess = true;
    },
  },
});

export const { setLedgers, setWallet, performData } = slice.actions;

export default slice.reducer;

export const fetchLedgers = () => async (dispatch) => {
  const ledgers = await getLedgersHistory({ limit: LEDGERS_HISTORY_LIMIT });
  const posLedgers = await getLedgersHistory({
    limit: LEDGERS_HISTORY_LIMIT,
    category: LEDGERS_CATEGORY_POSITION_CLOSED,
  });
  const wallet = await getCurrMarginWalletInfo();

  dispatch(setLedgers({ ledgers, posLedgers }));
  dispatch(setWallet({ wallet }));

  dispatch(performData());
};
