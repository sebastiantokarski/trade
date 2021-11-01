import { createSlice } from '@reduxjs/toolkit';
import { getSymbolFromUrl } from '../../utils';

const initialState = {
  leverage: 1,
  symbol: '',
  tickers: [],
};

const slice = createSlice({
  name: 'pageInfo',
  initialState,
  reducers: {
    getTickers(state) {
      const tickers = document.querySelectorAll(
        '.tickerlist__container [aria-label=row] .tickerlist__symbolcell'
      );
      state.tickers = [...tickers].map((node) => node.pathname.replace(/\//g, ''));
    },
    updateSymbol(state, action) {
      state.symbol = action.payload;
    },
    setCurrLeverage(state, action) {
      const currToken = action.payload;
      const tokens = document.querySelectorAll(
        '.tickerlist__container [aria-label=row] .tickerlist__symbolcell'
      );

      const currTokenNode = [...tokens].find((token) => token.textContent.trim() === currToken);

      if (currTokenNode) {
        const currTokenRow = currTokenNode.parentNode.parentNode.parentNode;
        const currLeverageNode = currTokenRow.querySelector(
          '.tickerlist__icons-marginindicator span'
        );

        if (currLeverageNode) {
          state.leverage = Number(currLeverageNode.textContent.trim());
        } else {
          state.leverage = 1;
        }
      }
    },
  },
});

export const { getTickers, updateSymbol, setCurrLeverage } = slice.actions;

export default slice.reducer;

export const observeCurrToken = () => async (dispatch, getState) => {
  const mainTickerWrapper = document.querySelector('.main-ticker__wrapper');
  const config = {
    childList: true,
    subtree: true,
  };

  const handleMainTickerChange = () => {
    const currToken = document.querySelector('.main-ticker__items h5 span span');

    if (currToken) {
      dispatch(setCurrLeverage(currToken.textContent.trim()));
    }
  };

  const handleSymbolChange = () => {
    const { symbol } = getState().pageInfo;
    const currSymbol = getSymbolFromUrl();

    if (symbol !== currSymbol) {
      dispatch(updateSymbol(currSymbol));
    }
  };

  const handleChange = () => {
    handleMainTickerChange();
    handleSymbolChange();
  };

  const observer = new MutationObserver(handleChange);

  if (mainTickerWrapper) {
    observer.observe(mainTickerWrapper, config);
    handleChange();
  }
};
export const fetchPageInfo = () => async (dispatch) => {
  dispatch(getTickers());
  dispatch(observeCurrToken());
};
