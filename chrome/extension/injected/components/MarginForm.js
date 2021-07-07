import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';
import { fetchData } from '../utils';
import {
  getMarginInfo,
  retrievePositions,
  submitMarketOrder,
  createStopOrder,
  transferUSDToExchangeWallet,
} from '../api';
import RiskOption from './RiskOption';
import { RISK_OPTIONS } from '../../config';

const MainWrapper = styled.div`
  position: relative;
  max-width: 400px;
  padding: 20px;
  border: 1px solid rgba(100, 100, 100, 0.3);
`;

const Title = styled.span`
  position: absolute;
  display: inline-block;
  padding: 0 20px;
  background-color: #1b262d;
  left: 50%;
  top: 0;
  transform: translate(-50%, -50%);
  text-transform: uppercase;
`;

const Description = styled.p`
  margin: 0 0 6px;
`;

const ClosePositionBtn = styled.button`
  line-height: 12px;
  width: 100%;
  margin: 0;
  outline: 2px solid #0f8fdafc;

  &:focus {
    background-color: #284556;
  }
`;

const MarginActionBtn = styled.button`
  &[disabled] {
    cursor: not-allowed;
  }

  &.ui-button--red-o:focus {
    outline: 2px solid var(--sell-color);
    background-color: var(--sell-color-transparent);
  }

  &.ui-button--green-o:focus {
    outline: 2px solid var(--buy-color);
    background-color: var(--buy-color-transparent);
  }
`;

const MarginForm = () => {
  const [risk, setRisk] = useState();

  const { currBalance } = useSelector((state) => state.account);
  const { isActive, plValue } = useSelector((state) => state.position);

  const blockMarginActions = false; // currBalance < minBalance;

  const cancelStopOrder = async () => {
    const ordersResponse = await fetchData('v2/auth/r/orders');
    const stopOrderToCancel = ordersResponse.find((order) => order[8] === 'STOP');

    if (stopOrderToCancel) {
      await fetchData('v2/auth/w/order/cancel', { id: stopOrderToCancel[0] });
    }
  };

  const handleMarginAction = async (type) => {
    await cancelStopOrder();

    const marginInfo = await getMarginInfo();
    const plValueMod = type === 'buy' ? plValue * 0.15 : plValue * -0.15;
    const marketAmount = type === 'buy' ? marginInfo.buy : marginInfo.sell * -1;

    if (marketAmount !== 0) {
      const modMarketAmount = isActive && plValue > 0 ? marketAmount - plValueMod : marketAmount;

      if (plValue > 0) {
        await transferUSDToExchangeWallet(plValue * 0.15);
      }

      await submitMarketOrder(modMarketAmount);
    }

    const positions = await retrievePositions();

    if (positions[0]) {
      const { amount, price } = positions[0];

      await createStopOrder(type, amount, price, risk);
    }
  };

  const handleRiskChange = (ev) => {
    setRisk(ev.target.value);
  };

  const handleClosePosition = async () => {
    await cancelStopOrder();

    const positions = await retrievePositions();

    if (positions[0]) {
      const { amount, pl } = positions[0];

      await submitMarketOrder(amount * -1);

      if (pl > 0) {
        await transferUSDToExchangeWallet(pl * 0.15);
      }
    }
  };

  return (
    <MainWrapper>
      <Title>Order form</Title>
      <Description>Select how much you can lose:</Description>
      <SimpleBar style={{ maxHeight: '105px' }}>
        {Object.keys(RISK_OPTIONS).map((key, index) => {
          const { name, label } = RISK_OPTIONS[key];

          return (
            <RiskOption
              key={index}
              value={name}
              label={label}
              onChange={handleRiskChange}
              currBalance={currBalance}
            />
          );
        })}
      </SimpleBar>
      <div className="orderform__actions">
        <MarginActionBtn
          type="button"
          className="ui-button ui-button--green"
          onClick={() => handleMarginAction('buy')}
          disabled={!risk || blockMarginActions}
        >
          Margin Buy
        </MarginActionBtn>
        <MarginActionBtn
          type="button"
          className="ui-button ui-button--red"
          onClick={() => handleMarginAction('sell')}
          disabled={!risk || blockMarginActions}
        >
          Margin Sell
        </MarginActionBtn>
      </div>
      <ClosePositionBtn type="button" className="ui-button" onClick={handleClosePosition}>
        Close Position
      </ClosePositionBtn>
    </MainWrapper>
  );
};

export default MarginForm;
