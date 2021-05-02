import React, { useState } from 'react';
import { fetchData, getSymbolFromUrl } from '../utils';
import RiskOption from './RiskOption';
import { riskOptions } from '../config';
import styled from 'styled-components';

const MarginActionBtn = styled.button`
  &[disabled] {
    cursor: not-allowed;
  }
`;

const MarginForm = ({ currBalance }) => {
  const [risk, setRisk] = useState();

  const manageRisk = (type, price) => {
    const riskValue = riskOptions[risk];

    if (type === 'buy') {
      return price * (1 - riskValue);
    } else if (type === 'sell') {
      return price * (1 + riskValue);
    }
  };

  const getMarginInfo = async () => {
    try {
      const marginInfoResponse = await fetchData(`v2/auth/r/info/margin/${getSymbolFromUrl()}`);
      const getSafeAmount = (value) => {
        return value * 0.995;
      };

      return {
        tradable_balance: marginInfoResponse[2][0],
        gross_balance: marginInfoResponse[2][1],
        buy: getSafeAmount(marginInfoResponse[2][2]),
        sell: getSafeAmount(marginInfoResponse[2][3]),
      };
    } catch (ex) {
      console.error('FAILED TO FETCH MARGIN INFO', ex);
    }
  };

  const retrievePositions = async () => {
    try {
      const positionsResponse = await fetchData('v2/auth/r/positions');

      return positionsResponse.map((position) => ({
        symbol: position[0],
        status: position[1],
        amount: position[2],
        price: position[3],
        funding: position[4],
        funding_type: position[5],
        pl: position[6],
        pl_perc: position[7],
        price_liq: position[8],
        leverage: position[9],
        _PLACEHOLDER: position[10],
        position_id: position[11],
        mts_create: position[12],
        mts_update: position[13],
        _PLACEHOLDER: position[14],
        type: position[15],
        _PLACEHOLDER: position[16],
        collateral: position[17],
        collateral_min: position[18],
        meta: position[19],
      }));
    } catch (ex) {
      console.error('FAILED TO RETRIEVE POSITIONS', ex);
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
  };

  const handleRiskChange = (ev) => {
    setRisk(ev.target.value);
  };

  return (
    <div>
      <div>
        <RiskOption
          value="maximum"
          label="Maximum risk"
          onChange={handleRiskChange}
          currBalance={currBalance}
        />
        <RiskOption
          value="standard"
          label="Standard risk"
          onChange={handleRiskChange}
          currBalance={currBalance}
        />
        <RiskOption
          value="minimal"
          label="Minimal risk"
          onChange={handleRiskChange}
          currBalance={currBalance}
        />
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
    </div>
  );
};

export default MarginForm;
