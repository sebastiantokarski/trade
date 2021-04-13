import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { fetchData } from '../utils';

const InfoWrapper = styled.div`
  text-align: center;
  margin: 1rem;
`;

const Info = styled.span`
  display: block;
  font-weight: bold;
  font-size: 30px;
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

const MarginForm = ({ lossProfitPerc }) => {
  const [orders, setOrders] = useState([]);

  useEffect(async () => {
    const rawOrders = await fetchData('v2/auth/r/orders', {});

    if (rawOrders && rawOrders[0]) {
      setOrders(
        rawOrders.map((order) => ({
          id: order[0],
        }))
      );
    }
    console.log(rawOrders);
  }, []);

  return (
    <div>
      <InfoWrapper>
        {lossProfitPerc !== null && <Info className="bfx-red-text">USTAW STOP LOSS</Info>}
      </InfoWrapper>
      <div className="orderform__actions">
        <button type="button" className="ui-button ui-button--green-o">
          Margin Buy
        </button>
        <button type="button" className="ui-button ui-button--red-o">
          Margin Sell
        </button>
      </div>
    </div>
  );
};

MarginForm.propTypes = {
  lossProfitPerc: PropTypes.number,
};

export default MarginForm;
