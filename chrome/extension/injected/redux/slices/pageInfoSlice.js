import { createSlice } from '@reduxjs/toolkit';

const initialState = {
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
  },
});

export const { getInfoFromPage } = pageInfo.actions;

export default pageInfo.reducer;

export const fetchPageInfo = () => async (dispatch) => {
  dispatch(getInfoFromPage());
};
