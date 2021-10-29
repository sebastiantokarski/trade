import React, { useState } from 'react';
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
import { MainWrapper, Title } from '../theme';

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
  const { leverage } = useSelector((state) => state.pageInfo);

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

      await createStopOrder(type, amount, price, risk, leverage);
    }
  };

  const handleRiskChange = (ev) => {
    setRisk(ev.target.value);
  };

  const handleClosePosition = async () => {
    await cancelStopOrder();

    const positions = await retrievePositions();

    if (positions[0]) {
      const { amount } = positions[0];

      await submitMarketOrder(amount * -1);

      // @TODO transfer only on demand
      // if (pl > 0) {
      //   await transferUSDToExchangeWallet(pl * 0.15);
      // }
    }
  };

  return (
    <MainWrapper>
      <Title>Order Form</Title>
      <Description>Select how much you can lose:</Description>
      <SimpleBar style={{ maxHeight: '105px' }}>
        {Object.keys(RISK_OPTIONS).map((key, index) => (
          <RiskOption
            key={index}
            option={RISK_OPTIONS[key]}
            onChange={handleRiskChange}
            currBalance={currBalance}
          />
        ))}
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
