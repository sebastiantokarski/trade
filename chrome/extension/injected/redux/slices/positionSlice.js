import { createSlice } from '@reduxjs/toolkit';
import { retrievePositions } from '../../api';

const initialState = {
  position: null,
};

const position = createSlice({
  name: 'position',
  initialState,
  reducers: {
    setPosition(state, action) {
      const position = action.payload;

      state.position = position;
    },
  },
});

export const { setPosition } = position.actions;

export default position.reducer;

export const fetchPosition = () => async (dispatch) => {
  const positions = await retrievePositions();

  if (positions.length) {
    dispatch(setPosition(position[0]));
  }
};
