import React, { useState } from 'react';
import styled from 'styled-components';
import { fetchData, getSymbolFromUrl } from '../utils';
import { getMarginInfo, retrievePositions } from '../api';
import RiskOption from './RiskOption';
import { RISK_OPTIONS } from '../config';

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
`;

const MarginActionBtn = styled.button`
  &[disabled] {
    cursor: not-allowed;
  }
`;

const MarginForm = ({ currBalance }) => {
  const [risk, setRisk] = useState();

  const manageRisk = (type, price) => {
    const riskValue = RISK_OPTIONS[risk].value;
    const feeInPerc = 0.02;
    const leverage = 5;

    if (type === 'buy') {
      return price * (1 - (riskValue - feeInPerc) / leverage);
    } else if (type === 'sell') {
      return price * (1 + (riskValue - feeInPerc) / leverage);
    }
  };

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
    const amount = type === 'buy' ? marginInfo.buy : marginInfo.sell * -1;

    await fetchData('v2/auth/w/order/submit', {
      type: 'MARKET',
      symbol: getSymbolFromUrl(),
      amount: amount.toFixed(2),
    });

    const positions = await retrievePositions();
    const position = positions[0];

    await fetchData('v2/auth/w/order/submit', {
      type: 'STOP',
      symbol: getSymbolFromUrl(),
      amount: (position.amount * -1).toString(),
      price: manageRisk(type, position.price).toFixed(4),
    });

    setRisk();
  };

  const handleRiskChange = (ev) => {
    setRisk(ev.target.value);
  };

  const handleClosePosition = async () => {
    const closeBtn = document.querySelector('[data-qa-id="positions-table"] button[data-qa-id]');

    await cancelStopOrder();

    if (closeBtn) {
      closeBtn.click();
    }
  };

  return (
    <MainWrapper>
      <Title>Order form</Title>
      <Description>Select how much you can lose:</Description>
      <div>
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
      </div>
      <div className="orderform__actions">
        <MarginActionBtn
          type="button"
          className="ui-button ui-button--green-o"
          onClick={() => handleMarginAction('buy')}
          disabled={!risk}
        >
          Margin Buy
        </MarginActionBtn>
        <MarginActionBtn
          type="button"
          className="ui-button ui-button--red-o"
          onClick={() => handleMarginAction('sell')}
          disabled={!risk}
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