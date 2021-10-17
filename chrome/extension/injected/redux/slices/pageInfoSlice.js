import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  leverage: 1,
  tickers: [],
};

const pageInfo = createSlice({
  name: 'pageInfo',
  initialState,
  reducers: {
    getInfoFromPage(state, action) {
      const tickers = document.querySelectorAll(
        '.tickerlist__container [aria-label=row] .tickerlist__symbolcell'
      );
      state.tickers = [...tickers].map((node) => node.pathname.replace(/\//g, ''));
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

export const { getInfoFromPage, setCurrLeverage } = pageInfo.actions;

export default pageInfo.reducer;

export const fetchPageInfo = () => async (dispatch) => {
  dispatch(getInfoFromPage());
};

export const observeCurrToken = () => async (dispatch) => {
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

  const observer = new MutationObserver(handleMainTickerChange);

  if (mainTickerWrapper) {
    observer.observe(mainTickerWrapper, config);
    handleMainTickerChange();
  }
};
