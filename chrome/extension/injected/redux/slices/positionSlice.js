import { createSlice } from '@reduxjs/toolkit';
import { log } from '../../utils';

const initialState = {
  isActive: false,
  plPerc: null,
  plValue: null,
};

let positionObserver = null;

const slice = createSlice({
  name: 'position',
  initialState,
  reducers: {
    updatePosition(state, action) {
      const { plPerc, plValue } = action.payload;

      state.isActive = true;
      state.plPerc = typeof plPerc === 'number' ? plPerc : null;
      state.plValue = typeof plValue === 'number' ? plValue : null;
    },
    removePosition(state) {
      state.isActive = false;
      state.plPerc = null;
      state.plValue = null;
    },
  },
});

export const { updatePosition, removePosition } = slice.actions;

export default slice.reducer;

export const startObservingPosition = () => async (dispatch, getState) => {
  const positionsPanel = document.querySelector('[data-qa-id="positions"]');

  positionObserver = new MutationObserver(() => {
    const positionsTable = document.querySelector('[data-qa-id="positions-table"]');

    try {
      if (positionsTable) {
        const plValueEl = positionsTable.querySelector('span:nth-child(7) span');
        const plPercEl = positionsTable.querySelector('span:nth-child(8) span');

        dispatch(
          updatePosition({
            plValue: Number(plValueEl.textContent.replace(',', '')),
            plPerc: Number(plPercEl.textContent),
          })
        );
      } else if (!positionsTable && getState().position.isActive) {
        dispatch(removePosition());
      }
    } catch (ex) {
      log('error', 'FAILED OBSERVING POSITION', ex);
    }
  }).observe(positionsPanel, {
    childList: true,
    subtree: true,
    characterData: true,
  });
};

export const stopObservingPosition = () => {
  if (positionObserver) {
    positionObserver.disconnect();
  }
};
