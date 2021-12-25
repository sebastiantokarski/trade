import { createSlice } from '@reduxjs/toolkit';
import { log } from '../../utils';

const initialState = {
  isActive: false,
  type: null,
  amount: null,
  price: null,
  plPerc: null,
  plValue: null,
};

let positionObserver = null;

const slice = createSlice({
  name: 'position',
  initialState,
  reducers: {
    updatePosition(state, action) {
      const { plPerc, plValue, amount, price, type } = action.payload;

      state.isActive = true;
      state.type = type;
      state.amount = amount;
      state.price = price;
      state.plPerc = typeof plPerc === 'number' ? plPerc : null;
      state.plValue = typeof plValue === 'number' ? plValue : null;
    },
    removePosition(state) {
      state = initialState;
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
        const buyEl = positionsTable.querySelector('.buying-icon');
        const amountEl = positionsTable.querySelector('span:nth-child(3) span');
        const priceEl = positionsTable.querySelector('span:nth-child(5) span');
        const plValueEl = positionsTable.querySelector('span:nth-child(7) span');
        const plPercEl = positionsTable.querySelector('span:nth-child(8) span');

        dispatch(
          updatePosition({
            type: buyEl ? 'buy' : 'sell',
            amount: Number(amountEl.textContent.replace(',', '')),
            price: Number(priceEl.textContent),
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
