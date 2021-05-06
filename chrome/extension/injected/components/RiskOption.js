import React from 'react';
import styled from 'styled-components';
import { RISK_OPTIONS } from '../../config';
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
  const potentialLossInPerc = RISK_OPTIONS[value].value * 100;
  const potentialLossInValue = currBalance
    ? currBalance - currBalance * (potentialLossInPerc / 100)
    : 0;

  return (
    <RiskOptionWrapper>
      <RadioButton name="risk" value={value} label={label} onChange={onChange} />
      <div>
        <RiskValues className="bfx-red-text">- {potentialLossInPerc}%</RiskValues>
        <RiskValues className="bfx-red-text">{potentialLossInValue.toFixed(2)}$</RiskValues>
      </div>
    </RiskOptionWrapper>
  );
};

export default RiskOption;
