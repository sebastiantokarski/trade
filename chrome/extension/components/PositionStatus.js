import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const ValuesContainer = styled.div`
  width: 100%;
  text-align: right;
`;

const Value = styled.span`
  display: inline-block;
  margin: 0 10px;
`;

const PositionStatus = ({ position }) => {
  if (!position) {
    return null;
  }

  const { lossProfitValue, lossProfitPerc } = position;

  return (
    <ValuesContainer>
      Status:
      <Value className={lossProfitValue > 0 ? 'bfx-green-text' : 'bfx-red-text'}>
        {lossProfitValue && lossProfitValue.toFixed(3)}$
      </Value>
      <Value className={lossProfitPerc > 0 ? 'bfx-green-text' : 'bfx-red-text'}>
        {lossProfitPerc && lossProfitPerc.toFixed(2)}%
      </Value>
    </ValuesContainer>
  );
};

PositionStatus.propTypes = {
  position: PropTypes.shape({
    lossProfitValue: PropTypes.number,
    lossProfitPerc: PropTypes.number,
  }),
};

export default PositionStatus;
