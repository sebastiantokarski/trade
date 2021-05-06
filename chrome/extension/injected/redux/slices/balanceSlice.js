import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  minBalance: undefined,
  currBalance: undefined,
  currDayBalance: undefined,
  targetBalance: undefined,
  currPositionPLValue: 0,
};

const balance = createSlice({
  name: 'balance',
  initialState,
  reducers: {
    setBalance(state, action) {
      const balance = action.payload;

      state.minBalance = 0;
      state.currBalance = balance;
    },
  },
});

export const { setBalance } = balance.actions;

export default balance.reducer;

export const fetchBalanceInfo = () => async (dispatch) => {
  const positions = await retrievePositions();

  if (positions.length) {
    dispatch(setPosition(position[0]));
  }
};
