import React from 'react';
import styled from 'styled-components';
import { riskOptions } from '../config';
import { RadioButton } from './UI';

const RiskOptionWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const RiskValues = styled.span`
  display: inline-block;
  margin-left: 15px;
  min-width: 20px;
`;

const RiskOption = ({ value, label, onChange, currBalance }) => {
  const feeInPerc = 0.02;
  const leverage = 5;
  const lossInPerc = (riskOptions[value] * leverage + feeInPerc) * 100;
  const lossInValue = currBalance ? currBalance - currBalance * (lossInPerc / 100) : null;

  return (
    <RiskOptionWrapper>
      <RadioButton name="risk" value={value} label={label} onChange={onChange} />
      <div>
        <RiskValues className="bfx-red-text">- {lossInPerc.toFixed(2)}%</RiskValues>
        <RiskValues className="bfx-red-text">{currBalance && lossInValue.toFixed(2)}$</RiskValues>
      </div>
    </RiskOptionWrapper>
  );
};

export default RiskOption;
