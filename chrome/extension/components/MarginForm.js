import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { getData, fetchData, getSymbolFromUrl } from '../utils';
import { RadioButton } from './UI';

const InfoWrapper = styled.div`
  text-align: center;
  margin: 1rem;
`;

const Info = styled.span`
  display: block;
  font-weight: bold;
  font-size: 24px;
  animation: flash linear 0.8s infinite;

  @keyframes flash {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
    100% {
      opacity: 1;
    }
  }
`;

const RadioButton = styled.input`
  position: initial !important;
  visibility: initial !important;
`;

const MarginForm = ({ position }) => {
  const [risk, setRisk] = useState('standard');

  const manageRisk = (type, price) => {
    let riskValue;

    switch (risk) {
      case 'minimal':
        riskValue = 0.0045;
        break;
      case 'standard':
        riskValue = 0.008;
        break;
      case 'maximum':
        riskValue = 0.015;
        break;
    }

    if (type === 'buy') {
      return price * (1 - riskValue);
    } else if (type === 'sell') {
      return price * (1 + riskValue);
    }
  };

  const getMarginInfo = async () => {
    const marginInfoResponse = await fetchData(`v2/auth/r/info/margin/${getSymbolFromUrl()}`);
    const getAmount = (value) => {
      return value * 0.995;
    };

    console.log('marginInfoResponse', marginInfoResponse);

    return {
      maxBuy: getAmount(marginInfoResponse[2][2]),
      maxSell: getAmount(marginInfoResponse[2][3]),
    };
  };

  const retrievePosition = async () => {
    const positionsResponse = await fetchData('v2/auth/r/positions');
    const position = positionsResponse[0];

    console.log('positionsResponse', positionsResponse);

    return {
      symbol: position[0],
      status: position[1],
      amount: position[2],
      price: position[3],
    };
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
    const amount = type === 'buy' ? marginInfo.maxBuy : marginInfo.maxSell * -1;

    await fetchData('v2/auth/w/order/submit', {
      type: 'MARKET',
      symbol: getSymbolFromUrl(),
      amount: amount.toFixed(2),
    });

    const position = await retrievePosition();

    await fetchData('v2/auth/w/order/submit', {
      type: 'STOP',
      symbol: getSymbolFromUrl(),
      amount: (position.amount * -1).toString(),
      price: manageRisk(type, position.price).toFixed(4),
    });
  };

  const handleRiskChange = (ev) => {
    setRisk(ev.target.value);
  };

  return (
    <div>
      <div>
        <RadioButton name="risk" value="maximum" label="Maximum risk" onChange={handleRiskChange} />
        <RadioButton
          name="risk"
          value="standard"
          label="Standard risk"
          onChange={handleRiskChange}
          checked
        />
        <RadioButton name="risk" value="minimal" label="Minimal risk" onChange={handleRiskChange} />
      </div>
      <div className="orderform__actions">
        <button
          type="button"
          className="ui-button ui-button--green-o"
          onClick={() => handleMarginAction('buy')}
        >
          Margin Buy
        </button>
        <button
          type="button"
          className="ui-button ui-button--red-o"
          onClick={() => handleMarginAction('sell')}
        >
          Margin Sell
        </button>
      </div>
    </div>
  );
};

MarginForm.propTypes = {
  position: PropTypes.any,
};

export default MarginForm;
