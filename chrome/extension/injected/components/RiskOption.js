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
  min-width: 55px;
`;

const RiskOption = ({ value, label, onChange, currBalance }) => {
  const potentialLossInPerc = RISK_OPTIONS[value].value * 100;
  const potentialLossInValue = currBalance
    ? currBalance - currBalance * (potentialLossInPerc / 100)
    : 0;
  const colorClass = potentialLossInPerc * -1 >= 0 ? 'bfx-green-text' : 'bfx-red-text';

  return (
    <RiskOptionWrapper>
      <RadioButton name="risk" value={value} label={label} onChange={onChange} />
      <div>
        <span className={colorClass}>{potentialLossInPerc * -1}%</span>
        <RiskValues className={colorClass}>{potentialLossInValue.toFixed(2)}$</RiskValues>
      </div>
    </RiskOptionWrapper>
  );
};

export default RiskOption;
